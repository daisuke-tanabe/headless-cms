---
name: coding-standards
description: TypeScript・JavaScript・React・Node.js 開発に適用できるユニバーサルなコーディング規約・ベストプラクティス・パターン。
---

# コーディング規約とベストプラクティス

全プロジェクトに適用できるユニバーサルなコーディング規約。

## 発動タイミング

- 新しいプロジェクトやモジュールを開始するとき
- 品質と保守性の観点からコードをレビューするとき
- 既存コードを規約に従ってリファクタリングするとき
- 命名・フォーマット・構造の一貫性を維持するとき
- リント・フォーマット・型チェックのルールを設定するとき
- 新しい開発者にコーディング規約をオンボーディングするとき

## コード品質の原則

### 1. 可読性を最優先に
- コードは書くより読まれる機会が多い
- 変数名・関数名は明確に
- コメントより自己文書化コードを優先する
- フォーマットを一貫させる

### 2. KISS（Keep It Simple, Stupid）
- 機能する中で最もシンプルな解決策
- オーバーエンジニアリングを避ける
- 早期最適化はしない
- 理解しやすさ > 巧妙なコード

### 3. DRY（Don't Repeat Yourself）
- 共通ロジックを関数に抽出する
- 再利用可能なコンポーネントを作成する
- モジュール間でユーティリティを共有する
- コピペプログラミングを避ける

### 4. YAGNI（You Aren't Gonna Need It）
- 必要になるまで機能を作らない
- 投機的な汎用化を避ける
- 必要になった時だけ複雑さを加える
- シンプルに始め、必要になったらリファクタリングする

## TypeScript/JavaScript 規約

### 変数命名

```typescript
// ✅ 良い例: 説明的な名前
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ 悪い例: 不明瞭な名前
const q = 'election'
const flag = true
const x = 1000
```

### 関数命名

```typescript
// ✅ 良い例: 動詞-名詞パターン
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ 悪い例: 不明瞭または名詞のみ
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### イミュータビリティパターン（重要）

```typescript
// ✅ 常にスプレッド演算子を使用する
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ 直接変更は絶対にしない
user.name = 'New Name'  // NG
items.push(newItem)     // NG
```

### エラーハンドリング

```typescript
// ✅ 良い例: 包括的なエラーハンドリング
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// ❌ 悪い例: エラーハンドリングなし
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Async/Await のベストプラクティス

```typescript
// ✅ 良い例: 可能な場合は並列実行
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ 悪い例: 不要な逐次実行
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### 型安全性

```typescript
// ✅ 良い例: 適切な型
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // 実装
}

// ❌ 悪い例: 'any' の使用
function getMarket(id: any): Promise<any> {
  // 実装
}
```

## React ベストプラクティス

### コンポーネント構造

```typescript
// ✅ 良い例: 型付きの関数コンポーネント
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ 悪い例: 型なし・不明瞭な構造
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### カスタムフック

```typescript
// ✅ 良い例: 再利用可能なカスタムフック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 使用例
const debouncedQuery = useDebounce(searchQuery, 500)
```

### 状態管理

```typescript
// ✅ 良い例: 適切な状態更新
const [count, setCount] = useState(0)

// 前の状態に基づく状態には関数型更新を使用
setCount(prev => prev + 1)

// ❌ 悪い例: 直接的な状態参照
setCount(count + 1)  // 非同期シナリオで古い値になる可能性あり
```

### 条件付きレンダリング

```typescript
// ✅ 良い例: 明確な条件付きレンダリング
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ 悪い例: 三項演算子の地獄
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API 設計規約

### REST API 規則

```
GET    /api/markets              # 全マーケット一覧
GET    /api/markets/:id          # 特定マーケットの取得
POST   /api/markets              # 新規マーケット作成
PUT    /api/markets/:id          # マーケット更新（完全）
PATCH  /api/markets/:id          # マーケット更新（部分）
DELETE /api/markets/:id          # マーケット削除

# フィルタリングにはクエリパラメータ
GET /api/markets?status=active&limit=10&offset=0
```

### レスポンス形式

```typescript
// ✅ 良い例: 一貫したレスポンス構造
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 成功レスポンス
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// エラーレスポンス
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### 入力バリデーション

```typescript
import { z } from 'zod'

// ✅ 良い例: スキーマバリデーション
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // バリデーション済みデータで処理を継続
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## ファイル構成

### プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API ルート
│   ├── markets/           # マーケットページ
│   └── (auth)/           # 認証ページ（ルートグループ）
├── components/            # React コンポーネント
│   ├── ui/               # 汎用 UI コンポーネント
│   ├── forms/            # フォームコンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── hooks/                # カスタム React フック
├── lib/                  # ユーティリティと設定
│   ├── api/             # API クライアント
│   ├── utils/           # ヘルパー関数
│   └── constants/       # 定数
├── types/                # TypeScript の型
└── styles/              # グローバルスタイル
```

### ファイル命名

```
components/Button.tsx          # コンポーネントは PascalCase
hooks/useAuth.ts              # フックは 'use' プレフィックス付き camelCase
lib/formatDate.ts             # ユーティリティは camelCase
types/market.types.ts         # 型は .types サフィックス付き camelCase
```

## コメントとドキュメント

### コメントすべきとき

```typescript
// ✅ 良い例: なぜ、を説明する（何を、ではなく）
// 障害時に API を圧迫しないよう指数バックオフを使用する
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 大きな配列のパフォーマンスのため意図的にミューテーションを使用
items.push(newItem)

// ❌ 悪い例: 明らかなことを述べる
// カウンターを 1 増やす
count++

// 名前をユーザーの名前に設定する
name = user.name
```

### 公開 API への JSDoc

```typescript
/**
 * セマンティックな類似度を使ってマーケットを検索する。
 *
 * @param query - 自然言語の検索クエリ
 * @param limit - 最大結果数（デフォルト: 10）
 * @returns 類似度スコアでソートされたマーケットの配列
 * @throws {Error} OpenAI API が失敗するか Redis が利用不可の場合
 *
 * @example
 * ```typescript
 * const results = await searchMarkets('election', 5)
 * console.log(results[0].name) // "Trump vs Biden"
 * ```
 */
export async function searchMarkets(
  query: string,
  limit: number = 10
): Promise<Market[]> {
  // 実装
}
```

## パフォーマンスベストプラクティス

### メモ化

```typescript
import { useMemo, useCallback } from 'react'

// ✅ 良い例: 高コストな計算をメモ化
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ 良い例: コールバックをメモ化
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 遅延ロード

```typescript
import { lazy, Suspense } from 'react'

// ✅ 良い例: 重いコンポーネントを遅延ロード
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### データベースクエリ

```typescript
// ✅ 良い例: 必要なカラムだけを選択
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// ❌ 悪い例: 全てを選択
const { data } = await supabase
  .from('markets')
  .select('*')
```

## テスト規約

### テスト構造（AAA パターン）

```typescript
test('calculates similarity correctly', () => {
  // Arrange（準備）
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act（実行）
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert（検証）
  expect(similarity).toBe(0)
})
```

### テスト命名

```typescript
// ✅ 良い例: 説明的なテスト名
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

// ❌ 悪い例: 曖昧なテスト名
test('works', () => { })
test('test search', () => { })
```

## コードの臭いの検出

これらのアンチパターンに注意:

### 1. 長い関数
```typescript
// ❌ 悪い例: 50 行超の関数
function processMarketData() {
  // 100 行のコード
}

// ✅ 良い例: 小さな関数に分割
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 深いネスト
```typescript
// ❌ 悪い例: 5 段階以上のネスト
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // 処理
        }
      }
    }
  }
}

// ✅ 良い例: 早期リターン
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// 処理
```

### 3. マジックナンバー
```typescript
// ❌ 悪い例: 説明のない数値
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ 良い例: 名前付き定数
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

**注意**: コード品質は妥協できません。明確で保守性の高いコードが、迅速な開発と自信を持ったリファクタリングを可能にします。
