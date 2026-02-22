# CLAUDE.md

## プロジェクト概要

AI CMS — AIチャットでCMS操作（記事の作成・編集・削除・ページ遷移）を代行するSaaS MVP。

## 技術スタック

- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router v7, TanStack Query, Zustand
- **Backend**: Hono (RPC), Prisma, PostgreSQL (Supabase)
- **認証**: Clerk
- **AI**: Claude API (Anthropic SDK)
- **Lint/Format**: Biome
- **デプロイ**: Vercel

## ディレクトリ構成

```
src/
├── client/    # React フロントエンド
├── server/    # Hono API サーバー
└── shared/    # 共通型定義・バリデーション
```

## パスエイリアス

| エイリアス | 解決先 | 用途 |
|---|---|---|
| `@/*` | `src/client/*` | クライアント内 import |
| `~/shared` | `src/shared/index.ts` | shared への import |
| `~/server/*` | `src/server/*` | サーバー型 import (api-client.ts) |

サーバーコード内では相対パスを使用（例: `from "../../shared/index.js"`）

## コードメトリクス設定

`/code-metrics` スキルが参照するプロジェクト固有の設定。

| 設定 | 値 |
|------|-----|
| ソースディレクトリ | `src` |
| 対象拡張子 (glob) | `*.ts`, `*.tsx` |
| 対象拡張子 (comma) | `ts,tsx` |
| 除外パス | `components/ui/` |
| 依存関係ツール | `madge` |

### 凝集度の除外パターン

Module Cohesion 分析で誤検知を避けるためスキップするパターン:

- **Factory function + `ReturnType` type pair** (DI pattern)
- **Component + Props type** (React)
- **Zod schema + `z.infer` type**
- **Barrel files** (`index.ts` re-exports)
- **Constant files** (constants for the same domain)

### レイヤーアーキテクチャルール

| Source | Must NOT Import | Exception | Severity |
|--------|----------------|-----------|----------|
| `src/client/**` | `src/server/**` | `~/server/app` (RPC type-only) | CRITICAL |
| `src/client/**` | `@prisma/client` | -- | CRITICAL |
| `src/server/**` | `react`, `react-dom` | -- | CRITICAL |
| `src/shared/**` | `src/client/**`, `src/server/**` | -- | CRITICAL |
| `src/server/routes/**` | `@prisma/client` | -- | HIGH |
| `src/server/services/**` | `src/server/routes/**` | -- | HIGH |

CRITICAL 違反はマージをブロック。HIGH 違反は次リリースまでに対処。

## 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 型チェック
pnpm typecheck

# 開発サーバー起動（client + server）
pnpm dev

# ビルド
pnpm build

# Lint
pnpm lint

# フォーマット
pnpm format
```

## DB操作コマンド

```bash
# Prisma Client 生成（DB接続不要）
pnpm db:generate

# スキーマをDBに反映（要DATABASE_URL）
pnpm db:push

# マイグレーション作成（要DATABASE_URL）
pnpm db:migrate:dev

# マイグレーション適用（本番用）
pnpm db:migrate:deploy

# Prisma Studio（GUIでDB閲覧）
pnpm db:studio
```

## テストコマンド

```bash
# テスト実行（後続フェーズで設定予定）
# pnpm test
# pnpm test:coverage
```

## コンテキスト管理

- 50% のコンテキスト消費で /compact を実行する
- 複雑なタスクは 50% 以内で完了するサブタスクに分割する
- 各タスク完了後にこまめにコミットする
