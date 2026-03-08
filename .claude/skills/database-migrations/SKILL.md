---
name: database-migrations
description: データベースマイグレーションのベストプラクティス。PostgreSQL・MySQL・主要 ORM（Prisma・Drizzle・Django・TypeORM・golang-migrate）でのスキーマ変更・データマイグレーション・ロールバック・ゼロダウンタイムデプロイを対象とする。
---

# データベースマイグレーションパターン

本番システムにおける安全かつ可逆的なデータベーススキーマ変更。

## 発動タイミング

- データベーステーブルを作成または変更するとき
- カラムやインデックスを追加・削除するとき
- データマイグレーション（バックフィル・変換）を実行するとき
- ゼロダウンタイムのスキーマ変更を計画するとき
- 新規プロジェクトにマイグレーションツールをセットアップするとき

## コア原則

1. **全ての変更はマイグレーション** — 本番データベースを手動で変更しない
2. **本番ではマイグレーションは前進のみ** — ロールバックは新しい前進マイグレーションで行う
3. **スキーマ変更とデータ変更は分ける** — 1 つのマイグレーションに DDL と DML を混ぜない
4. **本番サイズのデータでテストする** — 100 件では動くマイグレーションが 1000 万件ではロックを引き起こすことがある
5. **デプロイ済みのマイグレーションは不変** — 本番で実行済みのマイグレーションは編集しない

## マイグレーション安全チェックリスト

マイグレーションを適用する前に:

- [ ] UP と DOWN の両方がある（または明示的に不可逆とマークされている）
- [ ] 大きなテーブルへのフルテーブルロックがない（並行操作を使用する）
- [ ] 新しいカラムにはデフォルト値があるか NULL 許可（NOT NULL をデフォルトなしで追加しない）
- [ ] インデックスは並行作成（既存テーブルに CREATE TABLE と同時に作成しない）
- [ ] データのバックフィルはスキーマ変更とは別のマイグレーション
- [ ] 本番データのコピーでテスト済み
- [ ] ロールバック計画が文書化されている

## PostgreSQL パターン

### カラムの安全な追加

```sql
-- 良い例: NULL 許可カラム・ロックなし
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- 良い例: デフォルト値付きカラム（Postgres 11 以降は即時・テーブル再書き込み不要）
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- 悪い例: 既存テーブルへのデフォルトなし NOT NULL（フルリライトが必要）
ALTER TABLE users ADD COLUMN role TEXT NOT NULL;
-- これはテーブルをロックして全行を書き直す
```

### ダウンタイムなしのインデックス追加

```sql
-- 悪い例: 大きなテーブルへの書き込みをブロック
CREATE INDEX idx_users_email ON users (email);

-- 良い例: ノンブロッキング・並行書き込みを許可
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);

-- 注意: CONCURRENTLY はトランザクションブロック内で実行できない
-- ほとんどのマイグレーションツールでは特別な処理が必要
```

### カラムのリネーム（ゼロダウンタイム）

本番では直接リネームしない。エクスパンド-コントラクトパターンを使用する:

```sql
-- ステップ 1: 新しいカラムを追加（マイグレーション 001）
ALTER TABLE users ADD COLUMN display_name TEXT;

-- ステップ 2: データをバックフィル（マイグレーション 002・データマイグレーション）
UPDATE users SET display_name = username WHERE display_name IS NULL;

-- ステップ 3: 両方のカラムを読み書きするようにアプリケーションコードを更新
-- アプリケーション変更をデプロイ

-- ステップ 4: 古いカラムへの書き込みを停止し削除（マイグレーション 003）
ALTER TABLE users DROP COLUMN username;
```

### カラムの安全な削除

```sql
-- ステップ 1: カラムへの全アプリケーション参照を削除
-- ステップ 2: カラム参照なしのアプリケーションをデプロイ
-- ステップ 3: 次のマイグレーションでカラムを削除
ALTER TABLE orders DROP COLUMN legacy_status;

-- Django の場合: SeparateDatabaseAndState を使ってモデルから削除
-- DROP COLUMN を生成せず（次のマイグレーションで削除）
```

### 大規模データマイグレーション

```sql
-- 悪い例: 1 つのトランザクションで全行を更新（テーブルをロック）
UPDATE users SET normalized_email = LOWER(email);

-- 良い例: 進捗付きバッチ更新
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET normalized_email = LOWER(email)
    WHERE id IN (
      SELECT id FROM users
      WHERE normalized_email IS NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % rows', rows_updated;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

## Prisma（TypeScript/Node.js）

### ワークフロー

```bash
# スキーマ変更からマイグレーションを作成
npx prisma migrate dev --name add_user_avatar

# 本番でペンディング中のマイグレーションを適用
npx prisma migrate deploy

# データベースをリセット（開発環境のみ）
npx prisma migrate reset

# スキーマ変更後にクライアントを生成
npx prisma generate
```

### スキーマ例

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  orders    Order[]

  @@map("users")
  @@index([email])
}
```

### カスタム SQL マイグレーション

Prisma で表現できない操作（並行インデックス・データバックフィル）の場合:

```bash
# 空のマイグレーションを作成し、SQL を手動で編集
npx prisma migrate dev --create-only --name add_email_index
```

```sql
-- migrations/20240115_add_email_index/migration.sql
-- Prisma は CONCURRENTLY を生成できないため手動で記述
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email);
```

## Drizzle（TypeScript/Node.js）

### ワークフロー

```bash
# スキーマ変更からマイグレーションを生成
npx drizzle-kit generate

# マイグレーションを適用
npx drizzle-kit migrate

# スキーマを直接プッシュ（開発環境のみ・マイグレーションファイルなし）
npx drizzle-kit push
```

### スキーマ例

```typescript
import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

## Django（Python）

### ワークフロー

```bash
# モデル変更からマイグレーションを生成
python manage.py makemigrations

# マイグレーションを適用
python manage.py migrate

# マイグレーション状態を表示
python manage.py showmigrations

# カスタム SQL 用の空マイグレーションを生成
python manage.py makemigrations --empty app_name -n description
```

### データマイグレーション

```python
from django.db import migrations

def backfill_display_names(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    batch_size = 5000
    users = User.objects.filter(display_name="")
    while users.exists():
        batch = list(users[:batch_size])
        for user in batch:
            user.display_name = user.username
        User.objects.bulk_update(batch, ["display_name"], batch_size=batch_size)

def reverse_backfill(apps, schema_editor):
    pass  # データマイグレーション・逆処理は不要

class Migration(migrations.Migration):
    dependencies = [("accounts", "0015_add_display_name")]

    operations = [
        migrations.RunPython(backfill_display_names, reverse_backfill),
    ]
```

### SeparateDatabaseAndState

すぐにデータベースから削除せず、Django モデルからカラムを削除する:

```python
class Migration(migrations.Migration):
    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(model_name="user", name="legacy_field"),
            ],
            database_operations=[],  # まだ DB には触れない
        ),
    ]
```

## golang-migrate（Go）

### ワークフロー

```bash
# マイグレーションペアを作成
migrate create -ext sql -dir migrations -seq add_user_avatar

# ペンディング中の全マイグレーションを適用
migrate -path migrations -database "$DATABASE_URL" up

# 直前のマイグレーションをロールバック
migrate -path migrations -database "$DATABASE_URL" down 1

# バージョンを強制設定（ダーティ状態を修正）
migrate -path migrations -database "$DATABASE_URL" force VERSION
```

### マイグレーションファイル

```sql
-- migrations/000003_add_user_avatar.up.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
CREATE INDEX CONCURRENTLY idx_users_avatar ON users (avatar_url) WHERE avatar_url IS NOT NULL;

-- migrations/000003_add_user_avatar.down.sql
DROP INDEX IF EXISTS idx_users_avatar;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
```

## ゼロダウンタイムマイグレーション戦略

重大な本番変更にはエクスパンド-コントラクトパターンに従う:

```
フェーズ 1: エクスパンド
  - 新しいカラム/テーブルを追加（NULL 許可またはデフォルト値あり）
  - デプロイ: アプリが古い値と新しい値の両方に書き込む
  - 既存データをバックフィル

フェーズ 2: マイグレーション
  - デプロイ: アプリが新しい値から読み取り・両方に書き込む
  - データの一貫性を確認

フェーズ 3: コントラクト
  - デプロイ: アプリが新しい値のみを使用
  - 別のマイグレーションで古いカラム/テーブルを削除
```

### タイムライン例

```
Day 1: マイグレーションで new_status カラムを追加（NULL 許可）
Day 1: アプリ v2 をデプロイ — status と new_status の両方に書き込む
Day 2: 既存行のバックフィルマイグレーションを実行
Day 3: アプリ v3 をデプロイ — new_status のみから読み取る
Day 7: マイグレーションで古い status カラムを削除
```

## アンチパターン

| アンチパターン | なぜ失敗するか | より良いアプローチ |
|-------------|-------------|-----------------|
| 本番での手動 SQL | 監査証跡なし・再現不可 | 常にマイグレーションファイルを使用 |
| デプロイ済みマイグレーションの編集 | 環境間でドリフトが生じる | 代わりに新しいマイグレーションを作成 |
| デフォルトなしの NOT NULL | テーブルをロックして全行を書き直す | NULL 許可で追加・バックフィル後に制約追加 |
| 大きなテーブルへのインラインインデックス | ビルド中に書き込みをブロック | CREATE INDEX CONCURRENTLY |
| スキーマとデータを 1 つのマイグレーションに | ロールバックが難しい・長いトランザクション | マイグレーションを分ける |
| コード削除前にカラムを削除 | 欠落カラムでアプリケーションエラー | まずコードを削除・次のデプロイでカラムを削除 |
