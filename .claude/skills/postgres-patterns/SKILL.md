---
name: postgres-patterns
description: クエリ最適化・スキーマ設計・インデックス・セキュリティに関する PostgreSQL データベースパターン。Supabase のベストプラクティスに基づく。
---

# PostgreSQL パターン

PostgreSQL のベストプラクティスのクイックリファレンス。詳細なガイダンスは `database-reviewer` エージェントを使用する。

## 発動タイミング

- SQL クエリまたはマイグレーションを書くとき
- データベーススキーマを設計するとき
- 遅いクエリのトラブルシューティングをするとき
- Row Level Security を実装するとき
- コネクションプーリングをセットアップするとき

## クイックリファレンス

### インデックスチートシート

| クエリパターン | インデックス種別 | 例 |
|--------------|------------|---------|
| `WHERE col = value` | B-tree（デフォルト） | `CREATE INDEX idx ON t (col)` |
| `WHERE col > value` | B-tree | `CREATE INDEX idx ON t (col)` |
| `WHERE a = x AND b > y` | 複合 | `CREATE INDEX idx ON t (a, b)` |
| `WHERE jsonb @> '{}'` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| `WHERE tsv @@ query` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| 時系列範囲 | BRIN | `CREATE INDEX idx ON t USING brin (col)` |

### データ型クイックリファレンス

| ユースケース | 正しい型 | 避けるべき型 |
|----------|-------------|-------|
| ID | `bigint` | `int`・ランダム UUID |
| 文字列 | `text` | `varchar(255)` |
| タイムスタンプ | `timestamptz` | `timestamp` |
| 金額 | `numeric(10,2)` | `float` |
| フラグ | `boolean` | `varchar`・`int` |

### よくあるパターン

**複合インデックスの順序:**
```sql
-- 等値カラムを先に・範囲カラムを後に
CREATE INDEX idx ON orders (status, created_at);
-- 有効なクエリ: WHERE status = 'pending' AND created_at > '2024-01-01'
```

**カバリングインデックス:**
```sql
CREATE INDEX idx ON users (email) INCLUDE (name, created_at);
-- SELECT email, name, created_at のテーブルルックアップを回避
```

**パーシャルインデックス:**
```sql
CREATE INDEX idx ON users (email) WHERE deleted_at IS NULL;
-- 小さなインデックス・アクティブなユーザーのみを含む
```

**RLS ポリシー（最適化済み）:**
```sql
CREATE POLICY policy ON orders
  USING ((SELECT auth.uid()) = user_id);  -- SELECT でラップする！
```

**UPSERT:**
```sql
INSERT INTO settings (user_id, key, value)
VALUES (123, 'theme', 'dark')
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value;
```

**カーソルページネーション:**
```sql
SELECT * FROM products WHERE id > $last_id ORDER BY id LIMIT 20;
-- O(1) vs OFFSET の O(n)
```

**キュー処理:**
```sql
UPDATE jobs SET status = 'processing'
WHERE id = (
  SELECT id FROM jobs WHERE status = 'pending'
  ORDER BY created_at LIMIT 1
  FOR UPDATE SKIP LOCKED
) RETURNING *;
```

### アンチパターン検出

```sql
-- インデックスのない外部キーを検索
SELECT conrelid::regclass, a.attname
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );

-- 遅いクエリを検索
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- テーブルの膨張を確認
SELECT relname, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### 設定テンプレート

```sql
-- コネクション制限（RAM に合わせて調整）
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '8MB';

-- タイムアウト
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '30s';

-- モニタリング
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- セキュリティデフォルト
REVOKE ALL ON SCHEMA public FROM public;

SELECT pg_reload_conf();
```

## 関連リソース

- エージェント: `database-reviewer` - データベース全体のレビューワークフロー
- スキル: `clickhouse-io` - ClickHouse アナリティクスパターン
- スキル: `backend-patterns` - API とバックエンドパターン

---

*[Supabase Agent Skills](https://github.com/supabase/agent-skills)（MIT ライセンス）をもとに作成*
