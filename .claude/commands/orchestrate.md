# Orchestrate コマンド

複雑なタスクのための順次エージェントワークフロー。

## 使い方

`/orchestrate [workflow-type] [task-description]`

## ワークフロータイプ

### feature
フル機能実装ワークフロー:
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
バグ調査・修正ワークフロー:
```
planner -> tdd-guide -> code-reviewer
```

### refactor
安全なリファクタリングワークフロー:
```
architect -> code-reviewer -> tdd-guide
```

### security
セキュリティ重点レビュー:
```
security-reviewer -> code-reviewer -> architect
```

## 実行パターン

ワークフロー内の各エージェントに対して:

1. **エージェントを呼び出す** (前のエージェントのコンテキストを渡す)
2. **出力を収集する** (構造化されたハンドオフドキュメントとして)
3. **次のエージェントに渡す** (チェーン内の次へ)
4. **結果を集約する** (最終レポートにまとめる)

## ハンドオフドキュメントのフォーマット

エージェント間のハンドオフドキュメントを作成してください:

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### コンテキスト
[実施した内容のサマリー]

### 調査結果
[重要な発見や決定事項]

### 変更されたファイル
[触れたファイルの一覧]

### 未解決の質問
[次のエージェントへの未解決事項]

### 推奨事項
[次のステップの提案]
```

## 例: Feature ワークフロー

```
/orchestrate feature "Add user authentication"
```

実行内容:

1. **Planner エージェント**
   - 要件を分析する
   - 実装計画を作成する
   - 依存関係を特定する
   - 出力: `HANDOFF: planner -> tdd-guide`

2. **TDD Guide エージェント**
   - planner のハンドオフを読む
   - まずテストを書く
   - テストを通過させるように実装する
   - 出力: `HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewer エージェント**
   - 実装をレビューする
   - 問題を確認する
   - 改善点を提案する
   - 出力: `HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewer エージェント**
   - セキュリティ監査を行う
   - 脆弱性を確認する
   - 最終承認を行う
   - 出力: 最終レポート

## 最終レポートのフォーマット

```
ORCHESTRATION REPORT
====================
ワークフロー: feature
タスク: Add user authentication
エージェント: planner -> tdd-guide -> code-reviewer -> security-reviewer

サマリー
-------
[1 段落のサマリー]

エージェント出力
-------------
Planner: [サマリー]
TDD Guide: [サマリー]
Code Reviewer: [サマリー]
Security Reviewer: [サマリー]

変更されたファイル
-------------
[変更された全ファイルの一覧]

テスト結果
------------
[テスト通過・失敗のサマリー]

セキュリティステータス
---------------
[セキュリティの調査結果]

推奨事項
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 並列実行

独立したチェックの場合、エージェントを並列実行してください:

```markdown
### 並列フェーズ
同時に実行:
- code-reviewer (品質)
- security-reviewer (セキュリティ)
- architect (設計)

### 結果のマージ
出力を単一のレポートにまとめる
```

## 引数

$ARGUMENTS に指定できる値:
- `feature <description>` - フル機能ワークフロー
- `bugfix <description>` - バグ修正ワークフロー
- `refactor <description>` - リファクタリングワークフロー
- `security <description>` - セキュリティレビューワークフロー
- `custom <agents> <description>` - カスタムエージェントシーケンス

## カスタムワークフローの例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"
```

## ヒント

1. 複雑な機能には**まず planner を使用する**
2. マージ前には**必ず code-reviewer を含める**
3. 認証・支払い・個人情報には **security-reviewer を使用する**
4. **ハンドオフは簡潔に** - 次のエージェントが必要な情報に絞る
5. 必要に応じてエージェント間で**検証を実行する**
