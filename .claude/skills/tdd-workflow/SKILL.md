---
name: tdd-workflow
description: 新機能の実装・バグ修正・リファクタリング時に使用する。ユニット・統合・E2E テストを含む 80% 以上のカバレッジでテスト駆動開発を強制する。
---

# テスト駆動開発ワークフロー

このスキルは全てのコード開発が TDD の原則に従い、包括的なテストカバレッジを持つことを確実にする。

## 発動タイミング

- 新機能や機能を実装するとき
- バグや問題を修正するとき
- 既存コードをリファクタリングするとき
- API エンドポイントを追加するとき
- 新しいコンポーネントを作成するとき

## コア原則

### 1. テストをコードより先に書く
常にテストを先に書き、その後テストをパスさせるためのコードを実装する。

### 2. カバレッジ要件
- 最低 80% のカバレッジ（ユニット + 統合 + E2E）
- 全エッジケースをカバー
- エラーシナリオをテスト
- 境界条件を検証

### 3. テストの種類

#### ユニットテスト
- 個別の関数とユーティリティ
- コンポーネントロジック
- 純粋関数
- ヘルパーとユーティリティ

#### 統合テスト
- API エンドポイント
- データベース操作
- サービスの相互作用
- 外部 API 呼び出し

#### E2E テスト（Playwright）
- 重要なユーザーフロー
- 完全なワークフロー
- ブラウザ自動化
- UI インタラクション

## TDD ワークフローの手順

### ステップ 1: ユーザージャーニーを書く
```
[役割] として、[アクション] をしたい。なぜなら [メリット] だから。

例:
ユーザーとして、マーケットをセマンティックに検索したい。
なぜなら、正確なキーワードがなくても関連するマーケットを見つけられるから。
```

### ステップ 2: テストケースを生成する
各ユーザージャーニーに対して、包括的なテストケースを作成する:

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // テスト実装
  })

  it('handles empty query gracefully', async () => {
    // エッジケースのテスト
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // フォールバック動作のテスト
  })

  it('sorts results by similarity score', async () => {
    // ソートロジックのテスト
  })
})
```

### ステップ 3: テストを実行する（失敗するはず）
```bash
npm test
# テストは失敗するはず — まだ実装していない
```

### ステップ 4: コードを実装する
テストをパスさせるための最小限のコードを書く:

```typescript
// テストに導かれた実装
export async function searchMarkets(query: string) {
  // ここに実装
}
```

### ステップ 5: テストを再実行する
```bash
npm test
# テストはパスするはず
```

### ステップ 6: リファクタリングする
テストがグリーンな状態を保ちながらコード品質を改善する:
- 重複を除去する
- 命名を改善する
- パフォーマンスを最適化する
- 可読性を高める

### ステップ 7: カバレッジを確認する
```bash
npm run test:coverage
# 80% 以上のカバレッジを達成していることを確認
```

## テストパターン

### ユニットテストパターン（Jest/Vitest）
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API 統合テストパターン
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    // データベース障害をモック
    const request = new NextRequest('http://localhost/api/markets')
    // エラーハンドリングをテスト
  })
})
```

### E2E テストパターン（Playwright）
```typescript
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  // マーケットページに移動
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // ページが読み込まれたことを確認
  await expect(page.locator('h1')).toContainText('Markets')

  // マーケットを検索
  await page.fill('input[placeholder="Search markets"]', 'election')

  // デバウンスと結果を待つ
  await page.waitForTimeout(600)

  // 検索結果が表示されることを確認
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // 結果に検索語が含まれることを確認
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })

  // ステータスでフィルタリング
  await page.click('button:has-text("Active")')

  // フィルタリングされた結果を確認
  await expect(results).toHaveCount(3)
})

test('user can create a new market', async ({ page }) => {
  // 最初にログイン
  await page.goto('/creator-dashboard')

  // マーケット作成フォームを入力
  await page.fill('input[name="name"]', 'Test Market')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.fill('input[name="endDate"]', '2025-12-31')

  // フォームを送信
  await page.click('button[type="submit"]')

  // 成功メッセージを確認
  await expect(page.locator('text=Market created successfully')).toBeVisible()

  // マーケットページへのリダイレクトを確認
  await expect(page).toHaveURL(/\/markets\/test-market/)
})
```

## テストファイル構成

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # ユニットテスト
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts         # 統合テスト
└── e2e/
    ├── markets.spec.ts               # E2E テスト
    ├── trading.spec.ts
    └── auth.spec.ts
```

## 外部サービスのモック

### Supabase モック
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis モック
```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### OpenAI モック
```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // 1536 次元のエンベディングをモック
  ))
}))
```

## テストカバレッジの確認

### カバレッジレポートを実行する
```bash
npm run test:coverage
```

### カバレッジ閾値
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 避けるべきよくあるテストの間違い

### 実装の詳細をテストしてはいけない
```typescript
// 内部状態はテストしない
expect(component.state.count).toBe(5)
```

### ユーザーが見える動作をテストする
```typescript
// ユーザーが見るものをテスト
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 壊れやすいセレクターを使ってはいけない
```typescript
// 変更に弱い
await page.click('.css-class-xyz')
```

### セマンティックなセレクターを使う
```typescript
// 変更に強い
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')
```

### テストを互いに依存させてはいけない
```typescript
// テストが互いに依存している
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* 前のテストに依存 */ })
```

### 独立したテストを書く
```typescript
// 各テストが自分でデータをセットアップする
test('creates user', () => {
  const user = createTestUser()
  // テストロジック
})

test('updates user', () => {
  const user = createTestUser()
  // 更新ロジック
})
```

## 継続的テスト

### 開発中のウォッチモード
```bash
npm test -- --watch
# ファイル変更時にテストが自動実行される
```

### プリコミットフック
```bash
# 毎回のコミット前に実行される
npm test && npm run lint
```

### CI/CD 統合
```yaml
# GitHub Actions
- name: テストを実行
  run: npm test -- --coverage
- name: カバレッジをアップロード
  uses: codecov/codecov-action@v3
```

## ベストプラクティス

1. **テストを先に書く** — 常に TDD
2. **1 テストにつき 1 アサーション** — 単一の動作にフォーカス
3. **説明的なテスト名** — 何をテストしているか説明する
4. **Arrange-Act-Assert** — 明確なテスト構造
5. **外部依存関係をモック** — ユニットテストを分離する
6. **エッジケースをテスト** — Null・未定義・空・大きな値
7. **エラーパスをテスト** — ハッピーパスだけでなく
8. **テストを高速に保つ** — ユニットテストは 50ms 以下
9. **テスト後にクリーンアップ** — 副作用を残さない
10. **カバレッジレポートを確認** — ギャップを特定する

## 成功の指標

- 80% 以上のコードカバレッジを達成
- 全テストがパス（グリーン）
- スキップまたは無効化されたテストがない
- 高速なテスト実行（ユニットテストは 30 秒以下）
- E2E テストが重要なユーザーフローをカバー
- テストが本番前にバグを検出している

---

**注意**: テストはオプションではありません。テストは自信を持ったリファクタリング・迅速な開発・本番の信頼性を可能にするセーフティネットです。
