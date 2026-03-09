---
name: verification-loop
description: "Claude Code セッションのための包括的な検証システム。"
---

# 検証ループスキル

Claude Code セッションのための包括的な検証システム。

## 使用するタイミング

このスキルを呼び出すタイミング:
- 機能や重要なコード変更を完了した後
- PR を作成する前
- 品質ゲートが通過することを確認したいとき
- リファクタリング後

## 検証フェーズ

### フェーズ 1: ビルド検証
```bash
# プロジェクトがビルドできるか確認
npm run build 2>&1 | tail -20
# または
pnpm build 2>&1 | tail -20
```

ビルドが失敗した場合は、STOP して修正してから続ける。

### フェーズ 2: 型チェック
```bash
# TypeScript プロジェクト
npx tsc --noEmit 2>&1 | head -30

# Python プロジェクト
pyright . 2>&1 | head -30
```

全ての型エラーをレポートする。重大なエラーは続ける前に修正する。

### フェーズ 3: リントチェック
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### フェーズ 4: テストスイート
```bash
# カバレッジ付きでテストを実行
npm run test -- --coverage 2>&1 | tail -50

# カバレッジ閾値を確認
# 目標: 最低 80%
```

レポート:
- 合計テスト数: X
- パス: X
- 失敗: X
- カバレッジ: X%

### フェーズ 5: セキュリティスキャン
```bash
# シークレットを確認
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# console.log を確認
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### フェーズ 6: 差分レビュー
```bash
# 何が変更されたかを表示
git diff --stat
git diff HEAD~1 --name-only
```

変更された各ファイルをレビューして確認する:
- 意図しない変更がないか
- エラーハンドリングが欠けていないか
- 潜在的なエッジケースがないか

## 出力フォーマット

全フェーズを実行した後、検証レポートを作成する:

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

Issues to Fix:
1. ...
2. ...
```

## 継続モード

長いセッションでは、15 分ごとまたは大きな変更後に検証を実行する:

```markdown
メンタルチェックポイントを設定する:
- 各関数を完成させた後
- コンポーネントを完成させた後
- 次のタスクに移る前

実行: /verify
```

## フックとの統合

このスキルは PostToolUse フックを補完するが、より深い検証を提供する。
フックは問題を即座に検出する。このスキルは包括的なレビューを提供する。
