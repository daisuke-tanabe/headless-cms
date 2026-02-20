# CLAUDE.md

## プロジェクト概要

AI CMS — AIチャットでCMS操作（記事の作成・編集・削除・ページ遷移）を代行するSaaS MVP。

## 技術スタック

- **モノレポ**: pnpm workspace (`apps/web`, `apps/api`, `packages/shared`)
- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router v7, TanStack Query, Zustand
- **Backend**: Hono (RPC), Prisma, PostgreSQL (Supabase)
- **認証**: Clerk
- **AI**: Claude API (Anthropic SDK)
- **Lint/Format**: Biome
- **デプロイ**: Vercel

## 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 全パッケージの型チェック
pnpm typecheck

# 開発サーバー起動（web + api）
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
pnpm --filter @ai-cms/api db:generate

# スキーマをDBに反映（要DATABASE_URL）
pnpm --filter @ai-cms/api db:push

# マイグレーション作成（要DATABASE_URL）
pnpm --filter @ai-cms/api db:migrate:dev

# マイグレーション適用（本番用）
pnpm --filter @ai-cms/api db:migrate:deploy

# Prisma Studio（GUIでDB閲覧）
pnpm --filter @ai-cms/api db:studio
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
