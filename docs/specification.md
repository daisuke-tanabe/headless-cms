# AI CMS 仕様書

## 1. プロジェクト概要

AI CMS は、AIチャットを通じて CMS 操作（記事の作成・編集・削除）を代行する SaaS の MVP である。

ユーザーはチャットサイドバーから自然言語で指示を出し、AI がツール呼び出しを通じて CMS 操作を実行する。記事の作成・編集はエディタへの反映後にユーザーが確認して保存し、削除は承認 UI を経て実行される。

## 2. 技術スタック

### Frontend

| カテゴリ | 技術 |
|---|---|
| UI ライブラリ | React 19 |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS v4 |
| UI コンポーネント | shadcn/ui |
| ルーティング | React Router v7 |
| サーバー状態管理 | TanStack Query |
| クライアント状態管理 | Zustand |
| URL 状態管理 | nuqs |
| フォーム | react-hook-form |

### Backend

| カテゴリ | 技術 |
|---|---|
| API フレームワーク | Hono |
| ORM | Prisma |
| データベース | PostgreSQL（Supabase） |

### 認証

| カテゴリ | 技術 |
|---|---|
| 認証プロバイダ | Clerk（Organizations 対応） |

### AI

| カテゴリ | 技術 |
|---|---|
| LLM | Claude API（Anthropic SDK） |
| モデル | `claude-sonnet-4-20250514` |
| パターン | Single-Turn Tool Use |

### インフラ

| カテゴリ | 技術 |
|---|---|
| ホスティング | Vercel（フロントエンド + Serverless API） |

### 開発環境

| カテゴリ | 技術 |
|---|---|
| モノレポ | pnpm workspace |
| Lint / Format | Biome |

## 3. アーキテクチャ

### ディレクトリ構成

| ディレクトリ | 役割 | 技術 |
|---|---|---|
| `src/client` | React SPA（フロントエンド） | React 19, Vite, TanStack Query, Zustand |
| `src/server` | API サーバー | Hono, Prisma, Claude API |
| `src/shared` | 共有型定義・バリデーション・定数 | Zod |

### パスエイリアス

| エイリアス | 解決先 | 用途 |
|---|---|---|
| `@/*` | `src/client/*` | クライアント内 import |
| `~/shared` | `src/shared/index.ts` | shared への import |
| `~/server/*` | `src/server/*` | サーバー型 import（api-client.ts） |

サーバーコード内では相対パスを使用（例: `from "../../shared/index.js"`）。

### 技術選定理由

| 技術 | 選定理由 |
|---|---|
| Hono | 軽量・高速・型安全。RPC（`hc`）でフロント-API 間のエンドツーエンド型推論を実現。`hono/vercel` で Vercel にそのままデプロイ可能 |
| Prisma | Schema-first の型安全 ORM。`prisma generate` で型定義を自動生成 |
| Clerk | フロントエンド（`@clerk/clerk-react`）と API（`@hono/clerk-auth`）の統合が容易。Organizations 対応でマルチテナント的なスコーピングを実現 |
| TanStack Query | キャッシュ・再取得・楽観的更新を宣言的に記述。Hono RPC と型安全に連携 |
| Zustand | 軽量で React 外からもアクセス可能。AI アクション結果のルーティング遷移間受け渡しに適する |
| nuqs | URL クエリパラメータの状態管理。ページネーションの状態を URL に反映 |
| ts-pattern | `match().exhaustive()` で網羅性チェック付きの分岐を記述 |

## 4. 画面構成

### ルート一覧

| パス | 画面 | レイアウト |
|---|---|---|
| `/` | Landing Page | RootLayout |
| `/dashboard` | Dashboard | AuthenticatedLayout |
| `/articles` | 記事一覧 | AuthenticatedLayout |
| `/articles/new` | 記事作成 | EditorLayout |
| `/articles/:id` | 記事編集 | EditorLayout |
| `/settings` | API キー管理 | AuthenticatedLayout |

### 4.1 Landing Page

- プロダクト説明
- ログインボタン（Clerk 認証）

### 4.2 Dashboard

- Welcome メッセージ
- 記事数の表示

### 4.3 記事一覧

- 記事リスト（ページネーション: 20件/ページ）
- 新規作成ボタン

### 4.4 記事作成 / 編集（EditorLayout）

- タイトル入力（最大100字）
- 本文入力（最大100字）
- 文字数カウント表示
- 保存ボタン

### 4.5 Settings（API キー管理）

- API キー一覧表示（prefix、最終使用日時、作成日時）
- API キー発行ボタン（生成時のみ rawKey を表示）
- API キー削除ボタン

### 4.6 チャットサイドバー

- 全画面から利用可能
- 開閉トグルで表示 / 非表示を切り替え可能
- チャット入力（最大100字）

## 5. ユースケース

### 5.1 記事の作成

1. ユーザーが AI にタイトル・本文を指示する
2. AI が `create_article` ツールを呼び出す
3. エディタ画面に内容が反映される（`pendingEditorContent` 経由）
4. ユーザーが内容を確認し、保存ボタンを押す
5. API 経由で記事が保存される

### 5.2 記事の編集

1. ユーザーが AI に修正内容を指示する
2. AI が `update_article` ツールを呼び出す
3. エディタ上の内容が上書きされる（`pendingEditorContent` 経由）
4. ユーザーが内容を確認し、保存ボタンを押す
5. API 経由で記事が更新される

### 5.3 記事の削除

1. ユーザーが AI に削除を指示する
2. AI が `delete_article` ツールを呼び出す
3. チャット内に承認 UI が表示される
4. ユーザーが承認ボタンを押す
5. API 経由で論理削除が実行される

## 6. データモデル

### Article

| カラム | 型 | DB カラム名 | 説明 |
|---|---|---|---|
| `id` | `String` | `id` | 主キー、UUIDv7（`@default(uuid(7))`） |
| `slug` | `String` | `slug` | ユニーク、nanoid(8) で生成 |
| `title` | `String` | `title` | 記事タイトル |
| `body` | `String` | `body` | 記事本文 |
| `orgId` | `String` | `org_id` | 組織 ID（Clerk Organizations） |
| `authorId` | `String` | `author_id` | 作成者の ID |
| `createdAt` | `DateTime` | `created_at` | 作成日時 |
| `updatedAt` | `DateTime` | `updated_at` | 更新日時 |
| `deletedAt` | `DateTime?` | `deleted_at` | 削除日時（null: 未削除、値あり: 論理削除済み） |

インデックス: `@@index([orgId])`, `@@index([deletedAt])`
テーブル名: `articles`（`@@map("articles")`）

### ApiKey

| カラム | 型 | DB カラム名 | 説明 |
|---|---|---|---|
| `id` | `String` | `id` | 主キー、UUIDv7（`@default(uuid(7))`） |
| `prefix` | `String` | `prefix` | キーのプレフィックス（表示用） |
| `hashedKey` | `String` | `hashed_key` | ハッシュ化されたキー（ユニーク） |
| `orgId` | `String` | `org_id` | 組織 ID |
| `userId` | `String` | `user_id` | 作成者の ID |
| `lastUsedAt` | `DateTime?` | `last_used_at` | 最終使用日時 |
| `createdAt` | `DateTime` | `created_at` | 作成日時 |

インデックス: `@@index([orgId])`, `@@index([hashedKey])`
テーブル名: `api_keys`（`@@map("api_keys")`）

## 7. API 設計

すべてのエンドポイント（`/api/health` を除く）は認証必須とする。

### 7.1 ヘルスチェック

| メソッド | パス | 説明 | レスポンス |
|---|---|---|---|
| `GET` | `/api/health` | ヘルスチェック | `{ status: "ok" }` |

### 7.2 記事 API

認証: Clerk JWT（`Authorization: Bearer`）+ Organization 必須

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---|---|---|---|---|
| `GET` | `/api/articles` | 記事一覧（ページネーション） | `?page=1&limit=20` | `{ data: Article[], meta: { total, page, limit, totalPages } }` |
| `GET` | `/api/articles/count` | 記事数 | - | `{ data: { count: number } }` |
| `GET` | `/api/articles/:id` | 記事詳細 | - | `{ data: Article }` |
| `POST` | `/api/articles` | 記事作成 | `{ title, body }` | `{ data: Article }` (201) |
| `PATCH` | `/api/articles/:id` | 記事更新 | `{ title?, body? }` | `{ data: Article }` |
| `DELETE` | `/api/articles/:id` | 記事論理削除 | - | `{ data: { success: true } }` |

### 7.3 チャット API

認証: Clerk JWT + Organization 必須

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---|---|---|---|---|
| `POST` | `/api/chat` | チャットメッセージ送信 | `ChatRequest` | `ChatResponse` |

**ChatRequest:**

```typescript
type ChatRequest = {
  message: string               // 最大100文字
  history: {
    role: "user" | "assistant"
    content: string             // 最大2000文字
  }[]                           // 最大20件
  context: PageContext
}
```

**PageContext（discriminated union）:**

```typescript
type PageContext =
  | { page: "dashboard" }
  | { page: "articles"; pageNum: number }
  | { page: "article_new"; editor: { title: string; body: string } }
  | { page: "article_edit"; article: { id: string; title: string; body: string } }
```

**ChatResponse:**

```typescript
type ChatResponse = {
  message: string
  action: ChatAction | null
}
```

### 7.4 API キー API

認証: Clerk JWT + Organization 必須

| メソッド | パス | 説明 | レスポンス |
|---|---|---|---|
| `GET` | `/api/api-keys` | API キー一覧 | `{ data: ApiKeyInfo[] }` |
| `POST` | `/api/api-keys` | API キー発行 | `{ data: { ...ApiKeyInfo, key: string } }` (201) |
| `DELETE` | `/api/api-keys/:id` | API キー削除 | `{ data: { success: true } }` |

**ApiKeyInfo:**

```typescript
type ApiKeyInfo = {
  id: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
}
```

### 7.5 公開 API（v1）

認証: API キー（`Authorization: Bearer <api-key>`）
CORS: 全オリジン許可、GET のみ

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---|---|---|---|---|
| `GET` | `/api/v1/articles` | 記事一覧 | `?page=1&limit=20` | `{ data: Article[], meta: { total, page, limit, totalPages } }` |
| `GET` | `/api/v1/articles/:slug` | 記事詳細（slug） | - | `{ data: Article }` |

## 8. AI アクション設計

### 8.1 ツール定義

AI に渡すツールは以下の5種類とする。

| ツール名 | 説明 | パラメータ |
|---|---|---|
| `get_articles` | 記事一覧を取得する | `page?: number` |
| `get_article` | 記事詳細を取得する | `id: string` |
| `create_article` | 記事を作成する | `title: string, body: string` |
| `update_article` | 記事を更新する | `id: string, title?: string, body?: string` |
| `delete_article` | 記事を削除する（要承認） | `id: string` |

### 8.2 Single-Turn Tool Use

- Claude API（`claude-sonnet-4-20250514`）を1回呼び出し、レスポンスの `tool_use` ブロックからアクションを組み立てる
- `tool_result` は返さず、ラウンドトリップを最小限に抑える
- 1ターンにつき1つのツール呼び出しを処理する

```
User Message + PageContext → Claude API (1回) → tool_use レスポンス → アクション実行
```

### 8.3 ChatAction 型

```typescript
type ChatAction =
  | {
      type: "open_editor"
      to: string                           // 遷移先パス
      mode: "create" | "edit"
      data: { id?: string; title?: string; body?: string }
    }
  | {
      type: "delete_article"
      data: { id: string; title: string }
      requiresApproval: true
    }
```

| アクションタイプ | 説明 | 承認 |
|---|---|---|
| `open_editor` | エディタに内容を反映する | 不要（保存時にユーザー確認） |
| `delete_article` | 記事を論理削除する | 必要（承認 UI を表示） |

### 8.4 pendingEditorContent パターン

- Zustand ストアで `pendingEditorContent` を管理する
- AI がエディタに反映すべき内容を `pendingEditorContent` にセットする
- React Router でエディタページへ遷移する
- エディタコンポーネントがマウント時に `pendingEditorContent` を読み取り、フォームに反映する
- 反映後、`pendingEditorContent` をクリアする

```
Claude tool_use: open_editor
  → executor.ts でアクション生成
  → Zustand store (editor-store) に pendingContent をセット
  → React Router でエディタページへ遷移
  → エディタコンポーネントがマウント時に pendingContent を読み取り
  → 読み取り後にクリア
```

## 9. 主要パターン

### a. Hono RPC パターン

API 側でルートを定義し、その型をエクスポートする。
フロント側は `hc<AppType>` でクライアントを生成し、型安全に API を呼び出す。

```typescript
// src/server/app.ts - API側
const routes = app
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/articles", articlesRoute)
  .route("/chat", chatRoute)
  // ...

export type AppType = typeof routes
```

```typescript
// src/client/lib/api-client.ts - フロント側
import { hc } from "hono/client"
import type { AppType } from "~/server/app"

const client = hc<AppType>("/")
```

コード生成不要で、API にルートを追加するだけでフロント側の型が自動的に反映される。

### b. Soft Delete

Prisma ミドルウェアで論理削除を実装する。

| 操作 | 変換 |
|---|---|
| `delete` | `update({ deletedAt: now() })` |
| `findMany` / `findFirst` | `where: { deletedAt: null }` を自動付与 |

データ復旧の可能性を確保し、物理削除はバッチ処理で後日実行する。

### c. Repository パターン

データアクセスを Repository 層に集約し、Prisma Client への直接依存をルートハンドラから分離する。

```
Route Handler → Repository → Prisma Client → PostgreSQL
```

- ルートハンドラはビジネスロジックに集中する
- Repository はデータアクセスの詳細をカプセル化する
- `orgId` による暗黙的スコーピングで、マルチテナント的なデータ分離を実現する
- テスト時は Repository をモックに差し替えられる

## 10. 統合ポイント

### フロント - API 型安全

```
src/server: export type AppType = typeof routes
  → src/client: hc<AppType>(baseURL)
  → 型安全なAPI呼び出し（レスポンス型自動推論）
```

### 認証トークンフロー

```
Clerk (フロント) getToken()
  → Authorization: Bearer <JWT>
  → @hono/clerk-auth ミドルウェア (API)
  → JWT検証 → getAuth(c) でユーザー情報取得
  → orgId / userId を取得してスコーピング
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

### ページコンテキスト

```
ChatRequest.context (PageContext)
  → 現在の画面情報（ページ名、表示中の記事など）
  → Claude API のシステムプロンプトに組み込み
  → AIが画面に応じた適切な応答を生成
```

## 11. チャットメッセージ型

### 11.1 Text Message

- ロール: `user` または `assistant`
- 通常のテキストメッセージ
- チャット UI に表示される

### 11.2 Approval Message

- 削除操作時に表示される承認 UI
- 「承認」「キャンセル」ボタンを含む
- ステータス: `pending` | `approved` | `cancelled`
- ユーザーの操作後、結果がチャットに反映される

### 11.3 System Message

- `[システム]` プレフィックス付き
- チャット UI には表示しない
- 操作結果の通知など、AI のコンテキスト維持に使用する

```typescript
type ChatMessage =
  | { type: "text"; role: "user" | "assistant"; content: string }
  | { type: "approval"; articleId: string; articleTitle: string; status: "pending" | "approved" | "cancelled" }
```

## 12. 制約・制限

| 項目 | 制限値 |
|---|---|
| タイトル文字数 | 最大100字 |
| 本文文字数 | 最大100字 |
| チャット入力文字数 | 最大100字 |
| 会話履歴 | 最大20件（`MAX_HISTORY_LENGTH`） |
| 会話履歴コンテンツ長 | 最大2000文字（`MAX_HISTORY_CONTENT_LENGTH`） |
| ページネーション | 20件/ページ |
| AI max_tokens | 1024 |
