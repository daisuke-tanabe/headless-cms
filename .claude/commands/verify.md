# Verification コマンド

現在のコードベースの状態に対して包括的な検証を実行します。

## 手順

以下の順番で検証を実行してください:

1. **ビルドチェック**
   - プロジェクトのビルドコマンドを実行する
   - 失敗した場合は、エラーを報告して STOP する

2. **型チェック**
   - TypeScript / 型チェッカーを実行する
   - すべてのエラーを file:line 形式で報告する

3. **Lint チェック**
   - Linter を実行する
   - 警告とエラーを報告する

4. **テストスイート**
   - 全テストを実行する
   - 通過・失敗の件数を報告する
   - カバレッジのパーセンテージを報告する

5. **console.log 監査**
   - ソースファイル内の console.log を検索する
   - 場所を報告する

6. **Git ステータス**
   - コミットされていない変更を表示する
   - 最後のコミット以降に変更されたファイルを表示する

## 出力

簡潔な検証レポートを作成してください:

```
VERIFICATION: [PASS/FAIL]

Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage]
Secrets:  [OK/X found]
Logs:     [OK/X console.logs]

Ready for PR: [YES/NO]
```

重大な問題がある場合は、修正提案とともに一覧表示してください。

## 引数

$ARGUMENTS に指定できる値:
- `quick` - ビルド + 型チェックのみ
- `full` - 全チェック (デフォルト)
- `pre-commit` - コミットに関連するチェック
- `pre-pr` - 全チェック + セキュリティスキャン
