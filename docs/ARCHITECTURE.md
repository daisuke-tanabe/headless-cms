# Architecture Decision Record

## 1. アーキテクチャ概要

AI CMS は、AI（Claude）を活用した記事管理システムである。
モノレポ構成を採用し、pnpm workspace によるパッケージ管理を行う。

### モノレポ構成

| パッケージ | 役割 | 技術 |
|-----------|------|------|
| `apps/web` | React SPA（フロントエンド） | React 19, Vite, TanStack Query, Zustand |
| `apps/api` | API サーバー | Hono, Prisma, Claude API |
| `packages/shared` | 共有型定義・バリデーション・定数 | Zod |

### pnpm workspace

`pnpm-workspace.yaml` で `apps/*` と `packages/*` を管理する。
`@ai-cms/shared` を `workspace:*` で参照し、型定義とバリデーションスキーマをフロント・API 間で共有する。

---

## 2. 技術選定理由

### Hono

軽量・高速・型安全な Web フレームワーク。
RPC 機能（`hc`）によりフロント-API 間のエンドツーエンド型推論を実現する。
`hono/vercel` アダプタにより Vercel Serverless Functions にそのままデプロイ可能。
ローカル開発は `@hono/node-server` で Node.js サーバーとして起動する。

### Hono RPC (hc)

API 側で `export type AppType = typeof routes` を定義し、フロント側で `hc<AppType>(baseURL)` を呼ぶだけで型安全な API クライアントが得られる。
コード生成不要で、REST API のシンプルさと tRPC の型安全性を両立する。
ルート追加時に型が自動反映される。

### Prisma

型安全な ORM。Schema-first で開発を進め、`prisma generate` で型定義を自動生成する。
PostgreSQL をデータストアとして使用する。
マイグレーション管理（`prisma migrate`）とスキーマ可視化（`prisma studio`）を標準サポートする。

### Clerk

認証 SaaS。フロントエンド（`@clerk/clerk-react`）と API（`@hono/clerk-auth`）の統合が容易。
JWT 検証が自動化され、認証ロジックの自前実装が不要になる。
`getToken()` で取得したトークンを `Authorization: Bearer` ヘッダで API に送信し、API 側は Clerk ミドルウェアで検証する。

### TanStack Query

サーバー状態管理ライブラリ。キャッシュ、再取得、楽観的更新を宣言的に記述できる。
Hono RPC クライアントと組み合わせて型安全なデータフェッチを行う。

### Zustand

クライアント状態管理。軽量でボイラープレートが最小限。
Redux のような複雑なセットアップが不要で、React 外からもストアにアクセスできる。
AI アクションの結果（`pendingEditorContent` など）をルーティング遷移をまたいで受け渡す用途に適する。

### React Router v7

SPA ルーティング。`createBrowserRouter` を使用し、データローダやエラーバウンダリを活用する。
Vercel デプロイ時は `rewrites` で SPA フォールバックを設定する。

### nuqs

URL クエリパラメータの状態管理。ページネーション（`?page=2`）やフィルタリングの状態を URL に反映する。
ブックマークや共有リンクで状態を復元できる。

### ts-pattern

TypeScript パターンマッチライブラリ。`match()` と `.exhaustive()` により網羅性チェック付きの分岐を記述する。
Union 型や discriminated union の処理で安全性を向上させる。

### Biome

ESLint + Prettier を 1 ツールに統合した高速なリンター・フォーマッター。
設定は `biome.json` に集約し、インデントスタイル（tab）、行幅（100）、クォートスタイル（double）を統一する。

### Tailwind CSS v4

CSS-first の設定方式を採用。`@import "tailwindcss"` で読み込み、`tailwind.config.js` が不要になる。
Vite プラグイン（`@tailwindcss/vite`）で統合する。

### shadcn/ui

コピー&ペースト型の UI ライブラリ。`new-york` スタイルを採用。
コンポーネントはプロジェクト内に配置され、自由にカスタマイズ可能。
アイコンは `lucide-react` を使用する。

---

## 3. 主要パターン解説

### a. Hono RPC パターン

API 側でルートを定義し、その型をエクスポートする。
フロント側は `hc<AppType>` でクライアントを生成し、型安全に API を呼び出す。

```typescript
// apps/api/src/app.ts - API側
import { Hono } from "hono"

const app = new Hono().basePath("/api")

const routes = app.get("/health", (c) => {
  return c.json({ status: "ok" })
})

export type AppType = typeof routes
```

```typescript
// apps/web - フロント側
import { hc } from "hono/client"
import type { AppType } from "@ai-cms/api/src/app"

const client = hc<AppType>("/")

// 型安全なAPI呼び出し: レスポンス型が自動推論される
const res = await client.api.health.$get()
const data = await res.json() // { status: string }
```

コード生成が不要で、API にルートを追加するだけでフロント側の型が自動的に反映される。

### b. Single-turn Tool Use パターン

Claude API を 1 回だけ呼び出し、レスポンスの `tool_use` ブロックからアクションを組み立てる。
`tool_result` は返さず、ラウンドトリップを最小限に抑える。

```
User Message → Claude API (1回) → tool_use レスポンス → アクション実行
```

MVP ではシンプルさを優先し、マルチターン（`tool_result` を返して会話を継続する方式）は後続フェーズで検討する。

### c. pendingEditorContent パターン

AI の `open_editor` アクションをルーティング遷移をまたいで処理するパターン。

```
Claude tool_use: open_editor
  → executor.ts でアクション生成
  → Zustand store (editor-store) に pendingContent をセット
  → React Router でエディタページへ遷移
  → エディタコンポーネントがマウント時に pendingContent を読み取り
  → 読み取り後にクリア
```

URL パラメータより柔軟で、大きなコンテンツ（記事本文など）の受け渡しに適する。

### d. Soft Delete ミドルウェア

Prisma ミドルウェアで論理削除を実装する。

| 操作 | 変換 |
|------|------|
| `delete` | `update({ deletedAt: now() })` |
| `findMany` / `findFirst` | `where: { deletedAt: null }` を自動付与 |

データ復旧の可能性を確保し、物理削除はバッチ処理で後日実行する。
`deletedAt` カラムにインデックスを設定してクエリ性能を維持する。

```prisma
model Article {
  id        String    @id @default(uuid())
  slug      String    @unique
  title     String
  body      String
  authorId  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([authorId])
  @@index([deletedAt])
}
```

### e. Repository パターン

データアクセスを Repository 層に集約し、Prisma Client への直接依存をルートハンドラから分離する。

```
Route Handler → Repository → Prisma Client → PostgreSQL
```

- ルートハンドラはビジネスロジックに集中する
- Repository はデータアクセスの詳細をカプセル化する
- `authorId` による暗黙的スコーピングで、マルチテナント的なデータ分離を実現する
- テスト時は Repository をモックに差し替えられる

---

## 4. 統合ポイント

### フロント - API 型安全

```
apps/api: export type AppType = typeof routes
  → apps/web: hc<AppType>(baseURL)
  → 型安全なAPI呼び出し（レスポンス型自動推論）
```

### 認証トークンフロー

```
Clerk (フロント) getToken()
  → Authorization: Bearer <JWT>
  → @hono/clerk-auth ミドルウェア (API)
  → JWT検証 → getAuth(c) でユーザー情報取得
```

### AI Tool - UI アクション連携

```
Claude API レスポンス (tool_use)
  → executor.ts でアクション変換
  → ChatResponse.action として返却
  → use-action-executor.ts でUIアクション実行
```

### エディタ受け渡し

```
AI open_editor アクション
  → editor-store (Zustand) に pendingContent セット
  → ページ遷移
  → エディタがマウント時に読み取り → クリア
```

### 記事 ID 追跡

```
システムメッセージ（現在の記事IDなど）
  → conversation history に含めて Claude API に送信
  → Claude が記事を特定して操作可能に
```

### ページコンテキスト

```
ChatRequest.context
  → 現在の画面情報（ページ名、表示中の記事など）
  → Claude API に送信
  → AIが画面に応じた適切な応答を生成
```

---

## 5. ディレクトリ構造

```
ai-cms/
├── apps/
│   ├── api/                          # Hono APIサーバー
│   │   ├── api/
│   │   │   └── index.ts              # Vercel Serverless エントリポイント
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Prismaスキーマ定義
│   │   ├── src/
│   │   │   ├── app.ts                # Honoアプリ定義・ルート・AppType export
│   │   │   ├── index.ts              # ローカル開発用サーバー起動
│   │   │   ├── lib/                  # ユーティリティ (Prisma Client, Claude SDK等)
│   │   │   ├── middleware/           # Hono ミドルウェア (認証, soft delete等)
│   │   │   ├── repositories/         # データアクセス層
│   │   │   └── routes/               # ルートハンドラ (articles, chat等)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                          # React SPA フロントエンド
│       ├── src/
│       │   ├── app.tsx               # Appコンポーネント (ルーティング設定)
│       │   ├── main.tsx              # エントリポイント
│       │   ├── globals.css           # グローバルCSS (Tailwind)
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui コンポーネント
│       │   │   └── ...               # 機能別コンポーネント
│       │   ├── hooks/                # カスタムフック
│       │   ├── lib/
│       │   │   ├── utils.ts          # ユーティリティ (cn等)
│       │   │   └── api-client.ts     # Hono RPCクライアント (hc<AppType>)
│       │   ├── pages/                # ページコンポーネント
│       │   └── stores/               # Zustand ストア (editor-store等)
│       ├── components.json           # shadcn/ui 設定
│       ├── index.html                # HTMLテンプレート
│       ├── package.json
│       ├── vite.config.ts            # Vite設定 (proxy, Tailwind)
│       └── tsconfig.json
├── packages/
│   └── shared/                       # 共有パッケージ
│       ├── src/
│       │   ├── index.ts              # エクスポート集約
│       │   └── constants.ts          # 共有定数
│       ├── package.json
│       └── tsconfig.json
├── docs/                             # プロジェクトドキュメント
├── biome.json                        # Biome設定 (lint + format)
├── package.json                      # ルートpackage.json (workspace scripts)
├── pnpm-workspace.yaml               # pnpm workspace定義
├── tsconfig.base.json                # TypeScript共通設定
└── vercel.json                       # Vercelデプロイ設定
```
