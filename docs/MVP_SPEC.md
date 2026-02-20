# AI CMS MVP 仕様書

## 1. プロジェクト概要

AI CMS は、AIチャットを通じて CMS 操作（記事の作成・編集・削除、ページ遷移）を代行する SaaS の MVP である。

ユーザーはチャットサイドバーから自然言語で指示を出し、AI がツール呼び出しを通じて CMS 操作を実行する。記事の作成・編集はエディタへの反映後にユーザーが確認して保存し、削除は承認 UI を経て実行される。

## 2. ユースケース

### 2.1 記事の作成

1. ユーザーが AI にタイトル・本文を指示する
2. AI が `create_article` ツールを呼び出す
3. エディタ画面に内容が反映される（`pendingEditorContent` 経由）
4. ユーザーが内容を確認し、保存ボタンを押す
5. API 経由で記事が保存される

### 2.2 記事の編集

1. ユーザーが AI に修正内容を指示する
2. AI が `update_article` ツールを呼び出す
3. エディタ上の内容が上書きされる（`pendingEditorContent` 経由）
4. ユーザーが内容を確認し、保存ボタンを押す
5. API 経由で記事が更新される

### 2.3 記事の削除

1. ユーザーが AI に削除を指示する
2. AI が `delete_article` ツールを呼び出す
3. チャット内に承認 UI が表示される
4. ユーザーが承認ボタンを押す
5. API 経由で論理削除が実行される

### 2.4 ページ遷移

1. ユーザーが AI に遷移先を指示する
2. AI が `navigate` ツールを呼び出す
3. 該当ページに遷移する

## 3. 画面構成

### 3.1 Landing Page

- プロダクト説明
- ログインボタン（Clerk 認証）

### 3.2 Dashboard

- Welcome メッセージ
- 記事数の表示

### 3.3 記事一覧

- 記事リスト（ページネーション: 20件/ページ）
- 新規作成ボタン

### 3.4 記事作成 / 編集

- タイトル入力（最大100字）
- 本文入力（最大100字）
- 文字数カウント表示
- 保存ボタン

### 3.5 記事詳細

- 記事の閲覧
- 編集ボタン
- 削除ボタン

### 3.6 チャットサイドバー

- 全画面から利用可能
- 開閉トグルで表示 / 非表示を切り替え可能
- チャット入力（最大100字）

## 4. AI アクション設計

### 4.1 ツール定義

AI に渡すツールは以下の6種類とする。

| ツール名 | 説明 | パラメータ |
|---|---|---|
| `navigate` | 指定ページへ遷移する | `path: string` |
| `get_articles` | 記事一覧を取得する | `page?: number` |
| `get_article` | 記事詳細を取得する | `id: string` |
| `create_article` | 記事を作成する | `title: string, body: string` |
| `update_article` | 記事を更新する | `id: string, title?: string, body?: string` |
| `delete_article` | 記事を削除する（要承認） | `id: string` |

### 4.2 Single-Turn Tool Use

- Claude API を1回呼び出し、レスポンスの `tool_use` ブロックからアクションを組み立てる
- 1ターンにつき1つのツール呼び出しを処理する

### 4.3 アクションタイプ

| アクションタイプ | 説明 | 承認 |
|---|---|---|
| `navigate` | ページ遷移を実行する | 不要 |
| `open_editor` | エディタに内容を反映する | 不要（保存時にユーザー確認） |
| `delete_article` | 記事を論理削除する | 必要（承認 UI を表示） |

### 4.4 pendingEditorContent パターン

- Zustand ストアで `pendingEditorContent` を管理する
- AI がエディタに反映すべき内容を `pendingEditorContent` にセットする
- エディタコンポーネントが `pendingEditorContent` を検知し、フォームに反映する
- 反映後、`pendingEditorContent` をクリアする

## 5. データモデル

### Article

| カラム | 型 | 説明 |
|---|---|---|
| `id` | `UUID` | 主キー |
| `slug` | `String` | ユニーク、nanoid(8) で生成 |
| `title` | `String` | 記事タイトル |
| `body` | `String` | 記事本文 |
| `authorId` | `String` | 作成者の ID |
| `createdAt` | `DateTime` | 作成日時 |
| `updatedAt` | `DateTime` | 更新日時 |
| `deletedAt` | `DateTime?` | 削除日時（null: 未削除、値あり: 論理削除済み） |

## 6. API 設計

すべてのエンドポイントは認証必須とする。

### 6.1 記事

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---|---|---|---|---|
| `GET` | `/api/articles` | 記事一覧（ページネーション） | `?page=1&limit=20` | `{ data: Article[], meta: { total, page, limit } }` |
| `GET` | `/api/articles/count` | 記事数 | - | `{ count: number }` |
| `GET` | `/api/articles/:id` | 記事詳細 | - | `{ data: Article }` |
| `POST` | `/api/articles` | 記事作成 | `{ title, body }` | `{ data: Article }` |
| `PATCH` | `/api/articles/:id` | 記事更新 | `{ title?, body? }` | `{ data: Article }` |
| `DELETE` | `/api/articles/:id` | 記事論理削除 | - | `{ data: Article }` |

### 6.2 チャット

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---|---|---|---|---|
| `POST` | `/api/chat` | チャットメッセージ送信 | `ChatRequest` | `ChatResponse` |

**ChatRequest:**

```
{
  message: string
  history: ChatMessage[]
}
```

**ChatResponse:**

```
{
  reply: string
  action?: Action
}
```

## 7. 技術スタック

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
| 認証プロバイダ | Clerk |

### AI

| カテゴリ | 技術 |
|---|---|
| LLM | Claude API（Anthropic SDK） |
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

## 8. チャットメッセージ型

### 8.1 Text Message

- ロール: `user` または `assistant`
- 通常のテキストメッセージ
- チャット UI に表示される

### 8.2 Approval Message

- 削除操作時に表示される承認 UI
- 「承認」「キャンセル」ボタンを含む
- ユーザーの操作後、結果がチャットに反映される

### 8.3 System Message

- `[システム]` プレフィックス付き
- チャット UI には表示しない
- 操作結果の通知など、AI のコンテキスト維持に使用する

## 9. 制約・制限

| 項目 | 制限値 |
|---|---|
| タイトル文字数 | 最大100字 |
| 本文文字数 | 最大100字 |
| チャット入力文字数 | 最大100字 |
| 会話履歴 | 最大10往復（20メッセージ） |
| ページネーション | 20件/ページ |
