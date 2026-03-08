# エージェントオーケストレーション

## 利用可能なエージェント

`~/.claude/agents/` に配置:

| エージェント | 目的 | 使用タイミング |
|-------|---------|-------------|
| planner | 実装計画の策定 | 複雑な機能開発、リファクタリング |
| architect | システム設計 | アーキテクチャの意思決定 |
| tdd-guide | テスト駆動開発 | 新機能開発、バグ修正 |
| code-reviewer | コードレビュー | コード作成後 |
| security-reviewer | セキュリティ分析 | コミット前 |
| build-error-resolver | ビルドエラーの修正 | ビルド失敗時 |
| e2e-runner | E2E テスト | 重要なユーザーフロー |
| refactor-cleaner | デッドコードのクリーンアップ | コードメンテナンス |
| doc-updater | ドキュメント作成 | ドキュメント更新時 |

## エージェントの即時使用

ユーザーへの確認不要:
1. 複雑な機能リクエスト → **planner** エージェントを使用
2. コードの作成・変更直後 → **code-reviewer** エージェントを使用
3. バグ修正または新機能開発 → **tdd-guide** エージェントを使用
4. アーキテクチャの意思決定 → **architect** エージェントを使用

## 並行タスク実行

独立した処理には常に並行タスク実行を使用すること:

```markdown
# 良い例: 並行実行
3つのエージェントを並行して起動:
1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utilities

# 悪い例: 不要な逐次実行
First agent 1, then agent 2, then agent 3
```

## 多角的分析

複雑な問題には、役割を分けたサブエージェントを使用:
- 事実確認レビュアー
- シニアエンジニア
- セキュリティエキスパート
- 一貫性レビュアー
- 冗長性チェッカー
