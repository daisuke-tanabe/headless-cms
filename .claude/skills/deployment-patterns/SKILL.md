---
name: deployment-patterns
description: デプロイワークフロー・CI/CD パイプラインパターン・Docker コンテナ化・ヘルスチェック・ロールバック戦略・Web アプリケーションの本番リリース準備チェックリスト。
---

# デプロイパターン

本番デプロイワークフローと CI/CD ベストプラクティス。

## 発動タイミング

- CI/CD パイプラインをセットアップするとき
- アプリケーションを Docker 化するとき
- デプロイ戦略を計画するとき（Blue-Green・カナリア・ローリング）
- ヘルスチェックとレディネスプローブを実装するとき
- 本番リリースを準備するとき
- 環境固有の設定を構成するとき

## デプロイ戦略

### ローリングデプロイ（デフォルト）

インスタンスを段階的に入れ替える — ロールアウト中は古いバージョンと新しいバージョンが同時に稼働する。

```
インスタンス 1: v1 → v2  （最初に更新）
インスタンス 2: v1        （まだ v1 で稼働中）
インスタンス 3: v1        （まだ v1 で稼働中）

インスタンス 1: v2
インスタンス 2: v1 → v2  （2 番目に更新）
インスタンス 3: v1

インスタンス 1: v2
インスタンス 2: v2
インスタンス 3: v1 → v2  （最後に更新）
```

**メリット:** ゼロダウンタイム・段階的なロールアウト
**デメリット:** 2 つのバージョンが同時稼働 — 後方互換性のある変更が必要
**使用場面:** 標準デプロイ・後方互換性のある変更

### Blue-Green デプロイ

2 つの同一環境を稼働させ、トラフィックをアトミックに切り替える。

```
Blue  (v1) ← トラフィック
Green (v2)   待機中・新バージョンで稼働

# 検証後:
Blue  (v1)   待機中（スタンバイになる）
Green (v2) ← トラフィック
```

**メリット:** 即時ロールバック（Blue に切り戻す）・クリーンなカットオーバー
**デメリット:** デプロイ中に 2 倍のインフラが必要
**使用場面:** 重要なサービス・問題に対するゼロ許容

### カナリアデプロイ

最初に新バージョンへのトラフィックを少量だけルーティングする。

```
v1: トラフィックの 95%
v2: トラフィックの 5%  （カナリア）

# メトリクスが良好な場合:
v1: トラフィックの 50%
v2: トラフィックの 50%

# 最終:
v2: トラフィックの 100%
```

**メリット:** フルロールアウト前に実際のトラフィックで問題を検出できる
**デメリット:** トラフィック分割インフラとモニタリングが必要
**使用場面:** 高トラフィックサービス・リスクの高い変更・フィーチャーフラグ

## Docker

### マルチステージ Dockerfile（Node.js）

```dockerfile
# ステージ 1: 依存関係のインストール
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# ステージ 2: ビルド
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --production

# ステージ 3: 本番イメージ
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### マルチステージ Dockerfile（Go）

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.19 AS runner
RUN apk --no-cache add ca-certificates
RUN adduser -D -u 1001 appuser
USER appuser

COPY --from=builder /server /server

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["/server"]
```

### マルチステージ Dockerfile（Python/Django）

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app

RUN useradd -r -u 1001 appuser
USER appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### Docker ベストプラクティス

```
# 良い例
- 特定のバージョンタグを使う（node:22-alpine・node:latest は使わない）
- マルチステージビルドでイメージサイズを最小化
- 非 root ユーザーで実行する
- 依存関係ファイルを先にコピーする（レイヤーキャッシュ）
- .dockerignore で node_modules・.git・テストを除外
- HEALTHCHECK 命令を追加する
- docker-compose または k8s でリソース制限を設定

# 悪い例
- root で実行する
- :latest タグを使う
- 1 つの COPY レイヤーでリポジトリ全体をコピーする
- 本番イメージに開発依存関係をインストールする
- イメージにシークレットを保存する（env var またはシークレットマネージャーを使う）
```

## CI/CD パイプライン

### GitHub Actions（標準パイプライン）

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: 本番へデプロイ
        run: |
          # プラットフォーム固有のデプロイコマンド
          # Railway: railway up
          # Vercel: vercel --prod
          # K8s: kubectl set image deployment/app app=ghcr.io/${{ github.repository }}:${{ github.sha }}
          echo "Deploying ${{ github.sha }}"
```

### パイプラインステージ

```
PR オープン時:
  lint → typecheck → ユニットテスト → 統合テスト → プレビューデプロイ

main へのマージ時:
  lint → typecheck → ユニットテスト → 統合テスト → イメージビルド → ステージングデプロイ → スモークテスト → 本番デプロイ
```

## ヘルスチェック

### ヘルスチェックエンドポイント

```typescript
// シンプルなヘルスチェック
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 詳細なヘルスチェック（内部モニタリング用）
app.get("/health/detailed", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalApi: await checkExternalApi(),
  };

  const allHealthy = Object.values(checks).every(c => c.status === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    uptime: process.uptime(),
    checks,
  });
});

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await db.query("SELECT 1");
    return { status: "ok", latency_ms: 2 };
  } catch (err) {
    return { status: "error", message: "Database unreachable" };
  }
}
```

### Kubernetes プローブ

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 2

startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30    # 30 * 5s = 最大 150s の起動時間
```

## 環境設定

### Twelve-Factor App パターン

```bash
# 全設定を環境変数で管理 — コードに書かない
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0
API_KEY=${API_KEY}           # シークレットマネージャーから注入
LOG_LEVEL=info
PORT=3000

# 環境固有の動作
NODE_ENV=production          # または staging・development
APP_ENV=production           # 明示的なアプリ環境
```

### 設定バリデーション

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// 起動時にバリデーション — 設定が間違っていたら早期に失敗
export const env = envSchema.parse(process.env);
```

## ロールバック戦略

### 即時ロールバック

```bash
# Docker/Kubernetes: 前のイメージを指定
kubectl rollout undo deployment/app

# Vercel: 前のデプロイを昇格
vercel rollback

# Railway: 前のコミットを再デプロイ
railway up --commit <previous-sha>

# データベース: マイグレーションをロールバック（可逆な場合）
npx prisma migrate resolve --rolled-back <migration-name>
```

### ロールバックチェックリスト

- [ ] 前のイメージ/アーティファクトが利用可能でタグ付けされている
- [ ] データベースマイグレーションが後方互換（破壊的変更なし）
- [ ] フィーチャーフラグでデプロイなしに新機能を無効化できる
- [ ] エラーレート急増に対するモニタリングアラートが設定されている
- [ ] 本番リリース前にステージングでロールバックがテスト済み

## 本番リリース準備チェックリスト

本番へのデプロイ前に:

### アプリケーション
- [ ] 全テストが通過している（ユニット・統合・E2E）
- [ ] コードや設定ファイルにハードコードされたシークレットがない
- [ ] エラーハンドリングが全エッジケースをカバーしている
- [ ] ログが構造化されている（JSON）かつ PII を含んでいない
- [ ] ヘルスチェックエンドポイントが意味のあるステータスを返す

### インフラ
- [ ] Docker イメージが再現性よくビルドされる（バージョンが固定されている）
- [ ] 環境変数が文書化されており起動時にバリデーションされる
- [ ] リソース制限が設定されている（CPU・メモリ）
- [ ] 水平スケーリングが設定されている（最小/最大インスタンス数）
- [ ] 全エンドポイントで SSL/TLS が有効

### モニタリング
- [ ] アプリケーションメトリクスがエクスポートされている（リクエストレート・レイテンシ・エラー）
- [ ] エラーレートが閾値を超えた場合のアラートが設定されている
- [ ] ログ集約がセットアップされている（構造化ログ・検索可能）
- [ ] ヘルスエンドポイントの稼働時間モニタリングが設定されている

### セキュリティ
- [ ] 依存関係の CVE スキャン済み
- [ ] CORS が許可されたオリインのみに設定されている
- [ ] 公開エンドポイントにレート制限が有効
- [ ] 認証と認可が確認済み
- [ ] セキュリティヘッダーが設定されている（CSP・HSTS・X-Frame-Options）

### 運用
- [ ] ロールバック計画が文書化され、テスト済み
- [ ] 本番サイズのデータでデータベースマイグレーションがテスト済み
- [ ] 一般的な障害シナリオのランブック
- [ ] オンコールのローテーションとエスカレーションパスが定義されている
