# Update Codemaps

コードベースの構造を分析し、トークン効率の良いアーキテクチャドキュメントを生成します。

## ステップ 1: プロジェクト構造のスキャン

1. プロジェクトの種類を特定する (モノレポ、単一アプリ、ライブラリ、マイクロサービス)
2. 全ソースディレクトリを見つける (src/、lib/、app/、packages/)
3. エントリーポイントをマッピングする (main.ts、index.ts、app.py、main.go 等)

## ステップ 2: コードマップの生成

`docs/CODEMAPS/` (または `.reports/codemaps/`) にコードマップを作成または更新してください:

| ファイル | 内容 |
|------|----------|
| `architecture.md` | 高レベルのシステム図、サービス境界、データフロー |
| `backend.md` | API ルート、ミドルウェアチェーン、サービス → リポジトリのマッピング |
| `frontend.md` | ページツリー、コンポーネント階層、状態管理フロー |
| `data.md` | データベーステーブル、リレーション、マイグレーション履歴 |
| `dependencies.md` | 外部サービス、サードパーティ統合、共有ライブラリ |

### コードマップのフォーマット

各コードマップはトークン効率を重視し、AI のコンテキスト消費に最適化してください:

```markdown
# Backend Architecture

## Routes
POST /api/users → UserController.create → UserService.create → UserRepo.insert
GET  /api/users/:id → UserController.get → UserService.findById → UserRepo.findById

## Key Files
src/services/user.ts (business logic, 120 lines)
src/repos/user.ts (database access, 80 lines)

## Dependencies
- PostgreSQL (primary data store)
- Redis (session cache, rate limiting)
- Stripe (payment processing)
```

## ステップ 3: 差分検出

1. 以前のコードマップが存在する場合は、差分のパーセンテージを計算する
2. 変更が 30% を超える場合は、差分を表示してから上書き前にユーザーの承認を要求する
3. 変更が 30% 以下の場合は、その場で更新する

## ステップ 4: メタデータの追加

各コードマップに新鮮さのヘッダーを追加してください:

```markdown
<!-- Generated: 2026-02-11 | Files scanned: 142 | Token estimate: ~800 -->
```

## ステップ 5: 分析レポートの保存

`.reports/codemap-diff.txt` にサマリーを記録してください:
- 前回のスキャン以降に追加・削除・変更されたファイル
- 新たに検出された依存関係
- アーキテクチャの変更 (新しいルート、新しいサービス等)
- 90 日以上更新されていないドキュメントの陳腐化警告

## ヒント

- **高レベルの構造**に集中し、実装の詳細は省く
- 完全なコードブロックより**ファイルパスと関数シグネチャ**を優先する
- 効率的なコンテキストロードのために各コードマップを **1000 トークン以下**に保つ
- 冗長な説明の代わりに ASCII 図でデータフローを表現する
- 大きな機能追加やリファクタリングセッションの後に実行する
