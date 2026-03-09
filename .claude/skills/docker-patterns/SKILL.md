---
name: docker-patterns
description: ローカル開発向け Docker と Docker Compose のパターン。コンテナセキュリティ・ネットワーキング・ボリューム戦略・マルチサービスのオーケストレーションを含む。
---

# Docker パターン

コンテナ化された開発のための Docker と Docker Compose のベストプラクティス。

## 発動タイミング

- ローカル開発用に Docker Compose をセットアップするとき
- マルチコンテナアーキテクチャを設計するとき
- コンテナネットワークやボリュームの問題をトラブルシュートするとき
- Dockerfile のセキュリティとサイズをレビューするとき
- ローカル開発からコンテナ化されたワークフローへ移行するとき

## ローカル開発用 Docker Compose

### 標準 Web アプリスタック

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      target: dev                     # マルチステージ Dockerfile の dev ステージを使用
    ports:
      - "3000:3000"
    volumes:
      - .:/app                        # ホットリロード用のバインドマウント
      - /app/node_modules             # 匿名ボリューム -- コンテナの依存関係を保護
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app_dev
      - REDIS_URL=redis://redis:6379/0
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  mailpit:                            # ローカルのメールテスト
    image: axllent/mailpit
    ports:
      - "8025:8025"                   # Web UI
      - "1025:1025"                   # SMTP

volumes:
  pgdata:
  redisdata:
```

### 開発用と本番用の Dockerfile

```dockerfile
# ステージ: 依存関係
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ステージ: dev（ホットリロード・デバッグツール）
FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ステージ: ビルド
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

# ステージ: production（最小イメージ）
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

### オーバーライドファイル

```yaml
# docker-compose.override.yml（自動読み込み・開発専用設定）
services:
  app:
    environment:
      - DEBUG=app:*
      - LOG_LEVEL=debug
    ports:
      - "9229:9229"                   # Node.js デバッガー

# docker-compose.prod.yml（本番用・明示的に指定）
services:
  app:
    build:
      target: production
    restart: always
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
```

```bash
# 開発環境（オーバーライドを自動読み込み）
docker compose up

# 本番環境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ネットワーキング

### サービスディスカバリ

同じ Compose ネットワーク内のサービスはサービス名で解決される:
```
# "app" コンテナから:
postgres://postgres:postgres@db:5432/app_dev    # "db" が db コンテナに解決される
redis://redis:6379/0                             # "redis" が redis コンテナに解決される
```

### カスタムネットワーク

```yaml
services:
  frontend:
    networks:
      - frontend-net

  api:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net              # api からのみアクセス可能・frontend からは不可

networks:
  frontend-net:
  backend-net:
```

### 必要なものだけを公開する

```yaml
services:
  db:
    ports:
      - "127.0.0.1:5432:5432"   # ホストからのみアクセス可能・ネットワークからは不可
    # 本番環境ではポートを省略 -- Docker ネットワーク内でのみアクセス可能
```

## ボリューム戦略

```yaml
volumes:
  # 名前付きボリューム: コンテナの再起動をまたいで永続化・Docker が管理
  pgdata:

  # バインドマウント: ホストディレクトリをコンテナにマップ（開発用）
  # - ./src:/app/src

  # 匿名ボリューム: バインドマウントの上書きからコンテナ生成コンテンツを保護
  # - /app/node_modules
```

### よくあるパターン

```yaml
services:
  app:
    volumes:
      - .:/app                   # ソースコード（ホットリロード用バインドマウント）
      - /app/node_modules        # ホストの node_modules からコンテナを保護
      - /app/.next               # ビルドキャッシュを保護

  db:
    volumes:
      - pgdata:/var/lib/postgresql/data          # 永続データ
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql  # 初期化スクリプト
```

## コンテナセキュリティ

### Dockerfile のハードニング

```dockerfile
# 1. 特定のタグを使用（:latest は絶対に使わない）
FROM node:22.12-alpine3.20

# 2. 非 root で実行
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app

# 3. ケーパビリティを削除（compose で設定）
# 4. 可能な場合は読み取り専用のルートファイルシステム
# 5. イメージレイヤーにシークレットを保存しない
```

### Compose セキュリティ

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /app/.cache
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE          # 1024 未満のポートにバインドする場合のみ
```

### シークレット管理

```yaml
# 良い例: 環境変数を使用（ランタイムに注入）
services:
  app:
    env_file:
      - .env                     # .env を git にコミットしない
    environment:
      - API_KEY                  # ホスト環境から継承

# 良い例: Docker secrets（Swarm モード）
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  db:
    secrets:
      - db_password

# 悪い例: イメージにハードコード
# ENV API_KEY=sk-proj-xxxxx      # 絶対にしない
```

## .dockerignore

```
node_modules
.git
.env
.env.*
dist
coverage
*.log
.next
.cache
docker-compose*.yml
Dockerfile*
README.md
tests/
```

## デバッグ

### よく使うコマンド

```bash
# ログを表示
docker compose logs -f app           # app のログをフォロー
docker compose logs --tail=50 db     # db の最新 50 行

# 稼働中コンテナでコマンドを実行
docker compose exec app sh           # app にシェルで入る
docker compose exec db psql -U postgres  # postgres に接続

# 状態確認
docker compose ps                     # 稼働中のサービス
docker compose top                    # 各コンテナのプロセス
docker stats                          # リソース使用状況

# 再ビルド
docker compose up --build             # イメージを再ビルド
docker compose build --no-cache app   # 強制フルリビルド

# クリーンアップ
docker compose down                   # コンテナを停止して削除
docker compose down -v                # ボリュームも削除（破壊的）
docker system prune                   # 未使用のイメージ/コンテナを削除
```

### ネットワーク問題のデバッグ

```bash
# コンテナ内の DNS 解決を確認
docker compose exec app nslookup db

# 接続確認
docker compose exec app wget -qO- http://api:3000/health

# ネットワークを調査
docker network ls
docker network inspect <project>_default
```

## アンチパターン

```
# 悪い例: オーケストレーションなしで docker compose を本番で使用
# 本番のマルチコンテナワークロードには Kubernetes・ECS・Docker Swarm を使用

# 悪い例: ボリュームなしでコンテナにデータを保存
# コンテナはエフェメラル -- ボリュームなしでは再起動時に全データが失われる

# 悪い例: root で実行する
# 常に非 root ユーザーを作成して使用する

# 悪い例: :latest タグを使用する
# 再現可能なビルドのために特定バージョンに固定する

# 悪い例: 全サービスを 1 つの巨大なコンテナにまとめる
# 関心事を分離する: 1 コンテナにつき 1 プロセス

# 悪い例: シークレットを docker-compose.yml に書く
# .env ファイル（gitignore 済み）または Docker secrets を使用する
```
