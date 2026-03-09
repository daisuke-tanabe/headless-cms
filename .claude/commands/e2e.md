---
description: Generate and run end-to-end tests with Playwright. Creates test journeys, runs tests, captures screenshots/videos/traces, and uploads artifacts.
---

# E2E コマンド

このコマンドは **e2e-runner** エージェントを呼び出し、Playwright を使った E2E テストの生成・管理・実行を行います。

## このコマンドの機能

1. **テストジャーニーの生成** - ユーザーフロー用の Playwright テストを作成する
2. **E2E テストの実行** - 複数ブラウザでテストを実行する
3. **アーティファクトの取得** - 失敗時のスクリーンショット、動画、トレースを取得する
4. **結果のアップロード** - HTML レポートと JUnit XML をアップロードする
5. **不安定なテストの特定** - 不安定なテストを隔離する

## 使用場面

以下の場合に `/e2e` を使用してください:
- 重要なユーザージャーニーをテストするとき (ログイン、取引、支払い)
- 複数ステップのフローがエンドツーエンドで機能することを確認するとき
- UI のインタラクションとナビゲーションをテストするとき
- フロントエンドとバックエンドの統合を検証するとき
- 本番デプロイの準備をするとき

## 動作の仕組み

e2e-runner エージェントは以下を行います:

1. **ユーザーフローを分析し**、テストシナリオを特定する
2. Page Object Model パターンを使った **Playwright テストを生成する**
3. 複数ブラウザ (Chrome、Firefox、Safari) で**テストを実行する**
4. スクリーンショット、動画、トレースで**失敗を記録する**
5. 結果とアーティファクトを含む**レポートを生成する**
6. **不安定なテストを特定し**、修正を推奨する

## 使用例

```
ユーザー: /e2e マーケット検索と表示フローをテストして

エージェント (e2e-runner):
# E2E テスト生成: マーケット検索と表示フロー

## 特定されたテストシナリオ

**ユーザージャーニー:** マーケット検索 → 結果表示 → マーケットをクリック → 詳細表示

**テストカバレッジ:**
1. マーケットページへ遷移
2. セマンティック検索を実行
3. 検索結果を確認
4. 最初の結果をクリック
5. マーケット詳細ページの読み込みを確認
6. チャートのレンダリングを確認

## 生成されたテストコード

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. Navigate to markets page
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Verify page loaded
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. Perform semantic search
    await marketsPage.searchMarkets('election')

    // Wait for API response
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. Verify search results
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // Take screenshot of search results
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. Click on first result
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. Verify market details page loads
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(detailsPage.priceChart).toBeVisible()

    // Verify market name matches
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // Take screenshot of market details
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Search for non-existent market
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // Verify empty state
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Initial market count
    const initialCount = await marketsPage.marketCards.count()

    // Perform search
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // Verify filtered results
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // Clear search
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // Verify all markets shown again
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```

## テストの実行

```bash
# 生成されたテストを実行
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

生成されたアーティファクト:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## テストレポート

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E テスト結果                             ║
╠══════════════════════════════════════════════════════════════╣
║ ステータス: ✅ 全テスト通過                                   ║
║ 合計:       3 テスト                                         ║
║ 通過:       3 (100%)                                         ║
║ 失敗:       0                                                ║
║ 不安定:     0                                                ║
║ 所要時間:   9.1s                                             ║
╚══════════════════════════════════════════════════════════════╝

アーティファクト:
📸 スクリーンショット: 2 ファイル
📹 動画: 0 ファイル (失敗時のみ)
🔍 トレース: 0 ファイル (失敗時のみ)
📊 HTML レポート: playwright-report/index.html

レポート表示: npx playwright show-report
```

✅ E2E テストスイートの CI/CD 統合準備完了！
```

## テストアーティファクト

テスト実行時に以下のアーティファクトが取得されます:

**全テストで取得:**
- タイムラインと結果を含む HTML レポート
- CI 統合用の JUnit XML

**失敗時のみ取得:**
- 失敗状態のスクリーンショット
- テストの動画録画
- デバッグ用のトレースファイル (ステップ別のリプレイ)
- ネットワークログ
- コンソールログ

## アーティファクトの閲覧

```bash
# HTML レポートをブラウザで表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットは artifacts/ ディレクトリに保存される
open artifacts/search-results.png
```

## 不安定なテストの検出

テストが断続的に失敗する場合:

```
⚠️  不安定なテストが検出されました: tests/e2e/markets/trade.spec.ts

テストは 10 回中 7 回通過 (通過率 70%)

よくある失敗:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

推奨される修正:
1. 明示的な待機を追加: await page.waitForSelector('[data-testid="confirm-btn"]')
2. タイムアウトを増加: { timeout: 10000 }
3. コンポーネントのレース条件を確認
4. アニメーションによって要素が非表示になっていないか確認

隔離の推奨: 修正されるまで test.fixme() でマークする
```

## ブラウザ設定

テストはデフォルトで複数のブラウザで実行されます:
- ✅ Chromium (デスクトップ Chrome)
- ✅ Firefox (デスクトップ)
- ✅ WebKit (デスクトップ Safari)
- ✅ Mobile Chrome (任意)

ブラウザの調整は `playwright.config.ts` で設定してください。

## CI/CD 統合

CI パイプラインに追加:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 重要なフローの優先順位

以下の E2E テストを優先してください:

**重要 (常に通過する必要あり):**
1. ユーザーがウォレットを接続できる
2. ユーザーがマーケットを閲覧できる
3. ユーザーがマーケットを検索できる (セマンティック検索)
4. ユーザーがマーケット詳細を表示できる
5. ユーザーが取引を実行できる (テスト資金で)
6. マーケットが正しく解決される
7. ユーザーが資金を引き出せる

**重要:**
1. マーケット作成フロー
2. ユーザープロフィールの更新
3. リアルタイム価格更新
4. チャートのレンダリング
5. マーケットのフィルタリングとソート
6. モバイルレスポンシブレイアウト

## ベストプラクティス

**実施すること:**
- ✅ 保守性のために Page Object Model を使用する
- ✅ セレクターに data-testid 属性を使用する
- ✅ 任意のタイムアウトではなく API レスポンスを待つ
- ✅ 重要なユーザージャーニーをエンドツーエンドでテストする
- ✅ main にマージする前にテストを実行する
- ✅ テスト失敗時はアーティファクトを確認する

**実施しないこと:**
- ❌ 壊れやすいセレクターを使用する (CSS クラスは変更される可能性がある)
- ❌ 実装の詳細をテストする
- ❌ 本番環境に対してテストを実行する
- ❌ 不安定なテストを無視する
- ❌ 失敗時のアーティファクト確認をスキップする
- ❌ E2E ですべてのエッジケースをテストする (ユニットテストを使用すること)

## 重要な注意事項

**CRITICAL:**
- 実際のお金に関わる E2E テストはテストネット・ステージング環境でのみ実行すること
- 本番環境に対して取引テストを実行しないこと
- 金融テストには `test.skip(process.env.NODE_ENV === 'production')` を設定すること
- 少額のテスト資金を持つテスト用ウォレットのみを使用すること

## 他のコマンドとの連携

- テストすべき重要なジャーニーを特定するために `/plan` を使用する
- ユニットテスト (より高速で詳細) には `/tdd` を使用する
- インテグレーションとユーザージャーニーテストには `/e2e` を使用する
- テスト品質の確認には `/code-review` を使用する

## 関連エージェント

このコマンドは以下のパスにある `e2e-runner` エージェントを呼び出します:
`~/.claude/agents/e2e-runner.md`

## クイックコマンド

```bash
# 全 E2E テストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# ブラウザを表示して実行 (headed モード)
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report
```
