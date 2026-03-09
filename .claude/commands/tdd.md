---
description: Enforce test-driven development workflow. Scaffold interfaces, generate tests FIRST, then implement minimal code to pass. Ensure 80%+ coverage.
---

# TDD コマンド

このコマンドは **tdd-guide** エージェントを呼び出し、テスト駆動開発の手法を強制します。

## このコマンドの機能

1. **インターフェースのスキャフォールド** - まず型・インターフェースを定義する
2. **テストを先に生成** - 失敗するテストを書く (RED)
3. **最小限のコードを実装** - テストを通過するだけのコードを書く (GREEN)
4. **リファクタリング** - テストが緑のままコードを改善する (REFACTOR)
5. **カバレッジの確認** - テストカバレッジ 80% 以上を確保する

## 使用場面

以下の場合に `/tdd` を使用してください:
- 新しい機能を実装するとき
- 新しい関数・コンポーネントを追加するとき
- バグを修正するとき (まずバグを再現するテストを書く)
- 既存のコードをリファクタリングするとき
- 重要なビジネスロジックを構築するとき

## 動作の仕組み

tdd-guide エージェントは以下を行います:

1. **入出力のインターフェース**を定義する
2. **失敗するテストを書く** (コードがまだ存在しないため)
3. **テストを実行し**、正しい理由で失敗することを確認する
4. **テストを通過させる最小限の実装**を書く
5. **テストを実行し**、通過することを確認する
6. テストが緑のまま**コードをリファクタリング**する
7. **カバレッジを確認し**、80% 未満の場合はテストを追加する

## TDD サイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    通過させる最小限のコードを書く
REFACTOR: コードを改善し、テストを通過し続ける
REPEAT:   次の機能・シナリオへ
```

## 使用例

```
ユーザー: /tdd マーケット流動性スコアを計算する関数が必要

エージェント (tdd-guide):
# TDD セッション: マーケット流動性スコア計算機

## ステップ 1: インターフェース定義 (SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

## ステップ 2: 失敗するテストを書く (RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## ステップ 3: テスト実行 - 失敗を確認

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ テストが期待通り失敗しています。実装の準備ができました。

## ステップ 4: 最小限のコードを実装 (GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // Handle zero volume edge case
  if (market.totalVolume === 0) {
    return 0
  }

  // Calculate component scores (0-100 scale)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // Recent activity bonus
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // Weighted average
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // Clamp to 0-100
}
```

## ステップ 5: テスト実行 - 通過を確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 全テスト通過！

## ステップ 6: リファクタリング (IMPROVE)

```typescript
// lib/liquidity.ts - 定数と可読性を改善してリファクタリング
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## ステップ 7: テストが引き続き通過することを確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ リファクタリング完了、テストも引き続き通過！

## ステップ 8: カバレッジ確認

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD セッション完了！
```

## TDD ベストプラクティス

**実施すること:**
- ✅ 実装の**前に**必ずテストを書く
- ✅ テストを実行し、実装前に**失敗することを確認**する
- ✅ テストを通過させる**最小限のコード**を書く
- ✅ テストが緑になってから**リファクタリング**する
- ✅ エッジケースとエラーシナリオを追加する
- ✅ カバレッジ 80% 以上を目指す (重要なコードは 100%)

**実施しないこと:**
- ❌ テストの前に実装を書く
- ❌ 変更のたびにテストを実行しない
- ❌ 一度に大量のコードを書く
- ❌ 失敗するテストを無視する
- ❌ 実装の詳細をテストする (振る舞いをテストすること)
- ❌ すべてをモックする (インテグレーションテストを優先)

## 含めるべきテストの種類

**ユニットテスト** (関数レベル):
- ハッピーパスのシナリオ
- エッジケース (空、null、最大値)
- エラー条件
- 境界値

**インテグレーションテスト** (コンポーネントレベル):
- API エンドポイント
- データベース操作
- 外部サービス呼び出し
- フックを持つ React コンポーネント

**E2E テスト** (`/e2e` コマンドを使用):
- 重要なユーザーフロー
- 複数ステップのプロセス
- フルスタックインテグレーション

## カバレッジ要件

- 全コードで**最低 80%**
- 以下には **100% 必須**:
  - 金融計算
  - 認証ロジック
  - セキュリティクリティカルなコード
  - コアビジネスロジック

## 重要な注意事項

**必須**: テストは実装の**前に**書かなければなりません。TDD サイクルは:

1. **RED** - 失敗するテストを書く
2. **GREEN** - 通過させるために実装する
3. **REFACTOR** - コードを改善する

RED フェーズを飛ばしてはいけません。テストの前にコードを書いてはいけません。

## 他のコマンドとの連携

- 何を作るかを理解するために先に `/plan` を使用する
- テストとともに実装するために `/tdd` を使用する
- ビルドエラーが発生した場合は `/build-fix` を使用する
- 実装のレビューには `/code-review` を使用する
- カバレッジの確認には `/test-coverage` を使用する

## 関連エージェント

このコマンドは以下のパスにある `tdd-guide` エージェントを呼び出します:
`~/.claude/agents/tdd-guide.md`

以下のスキルも参照できます:
`~/.claude/skills/tdd-workflow/`
