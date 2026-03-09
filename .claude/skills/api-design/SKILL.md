---
name: api-design
description: REST API設計パターン。リソース命名・ステータスコード・ページネーション・フィルタリング・エラーレスポンス・バージョニング・レート制限を含む本番向け API のベストプラクティス。
---

# API設計パターン

一貫性があり、開発者に優しい REST API を設計するための規約とベストプラクティス。

## 発動タイミング

- 新しい API エンドポイントを設計するとき
- 既存の API 契約をレビューするとき
- ページネーション・フィルタリング・ソートを追加するとき
- API のエラーハンドリングを実装するとき
- API バージョニング戦略を計画するとき
- 公開 API やパートナー向け API を構築するとき

## リソース設計

### URL 構造

```
# リソースは名詞・複数形・小文字・kebab-case
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# 関係性にはサブリソースを使用
GET    /api/v1/users/:id/orders
POST   /api/v1/users/:id/orders

# CRUD にマッピングできないアクション（動詞は最小限に）
POST   /api/v1/orders/:id/cancel
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

### 命名規則

```
# 良い例
/api/v1/team-members          # 複数単語のリソースは kebab-case
/api/v1/orders?status=active  # フィルタリングにはクエリパラメータ
/api/v1/users/123/orders      # 所有関係にはネストされたリソース

# 悪い例
/api/v1/getUsers              # URL に動詞を含めない
/api/v1/user                  # 単数形は使わない（複数形を使う）
/api/v1/team_members          # URL に snake_case は使わない
/api/v1/users/123/getOrders   # ネストされたリソースに動詞は不可
```

## HTTP メソッドとステータスコード

### メソッドのセマンティクス

| メソッド | 冪等性 | 安全性 | 用途 |
|--------|-----------|------|---------|
| GET | あり | あり | リソースの取得 |
| POST | なし | なし | リソースの作成・アクションの実行 |
| PUT | あり | なし | リソースの完全置換 |
| PATCH | なし* | なし | リソースの部分更新 |
| DELETE | あり | なし | リソースの削除 |

*PATCH は適切な実装により冪等にできる

### ステータスコード一覧

```
# 成功
200 OK                    — GET・PUT・PATCH（レスポンスボディあり）
201 Created               — POST（Location ヘッダーを含める）
204 No Content            — DELETE・PUT（レスポンスボディなし）

# クライアントエラー
400 Bad Request           — バリデーション失敗・不正な JSON
401 Unauthorized          — 認証情報がないか無効
403 Forbidden             — 認証済みだが権限なし
404 Not Found             — リソースが存在しない
409 Conflict              — 重複エントリ・状態の競合
422 Unprocessable Entity  — セマンティクス上不正（正常な JSON だがデータが不正）
429 Too Many Requests     — レート制限超過

# サーバーエラー
500 Internal Server Error — 予期しない障害（詳細を公開しない）
502 Bad Gateway           — 上流サービスの障害
503 Service Unavailable   — 一時的な過負荷・Retry-After を含める
```

### よくある間違い

```
# 悪い例: 全てに 200 を返す
{ "status": 200, "success": false, "error": "Not found" }

# 良い例: HTTP ステータスコードを正しく使う
HTTP/1.1 404 Not Found
{ "error": { "code": "not_found", "message": "User not found" } }

# 悪い例: バリデーションエラーに 500 を返す
# 良い例: 400 または 422 とフィールドレベルの詳細

# 悪い例: 作成成功に 200 を返す
# 良い例: Location ヘッダー付きの 201
HTTP/1.1 201 Created
Location: /api/v1/users/abc-123
```

## レスポンス形式

### 成功レスポンス

```json
{
  "data": {
    "id": "abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### コレクションレスポンス（ページネーション付き）

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/api/v1/users?page=1&per_page=20",
    "next": "/api/v1/users?page=2&per_page=20",
    "last": "/api/v1/users?page=8&per_page=20"
  }
}
```

### エラーレスポンス

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      },
      {
        "field": "age",
        "message": "Must be between 0 and 150",
        "code": "out_of_range"
      }
    ]
  }
}
```

### レスポンスエンベロープのバリアント

```typescript
// オプション A: data ラッパー付きエンベロープ（公開 API に推奨）
interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  links?: PaginationLinks;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: FieldError[];
  };
}

// オプション B: フラットなレスポンス（シンプル・内部 API に多い）
// 成功: リソースをそのまま返す
// エラー: エラーオブジェクトを返す
// HTTP ステータスコードで区別する
```

## ページネーション

### オフセットベース（シンプル）

```
GET /api/v1/users?page=2&per_page=20

# 実装
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

**メリット:** 実装が簡単・「N ページ目にジャンプ」が可能
**デメリット:** 大きなオフセットでは遅い（OFFSET 100000）・同時挿入時に不整合が起きる

### カーソルベース（スケーラブル）

```
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20

# 実装
SELECT * FROM users
WHERE id > :cursor_id
ORDER BY id ASC
LIMIT 21;  -- has_next を判定するため 1 件多く取得
```

```json
{
  "data": [...],
  "meta": {
    "has_next": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

**メリット:** 位置に関わらず一定のパフォーマンス・同時挿入でも安定
**デメリット:** 任意のページへのジャンプ不可・カーソルが不透明

### 使い分けの基準

| ユースケース | ページネーションの種類 |
|----------|----------------|
| 管理画面・小さなデータセット（10K 件未満） | オフセット |
| 無限スクロール・フィード・大規模データセット | カーソル |
| 公開 API | カーソル（デフォルト）＋オフセット（オプション） |
| 検索結果 | オフセット（ユーザーがページ番号を期待するため） |

## フィルタリング・ソート・検索

### フィルタリング

```
# 単純な等値一致
GET /api/v1/orders?status=active&customer_id=abc-123

# 比較演算子（ブラケット記法を使用）
GET /api/v1/products?price[gte]=10&price[lte]=100
GET /api/v1/orders?created_at[after]=2025-01-01

# 複数値（カンマ区切り）
GET /api/v1/products?category=electronics,clothing

# ネストされたフィールド（ドット記法）
GET /api/v1/orders?customer.country=US
```

### ソート

```
# 単一フィールド（降順は - プレフィックス）
GET /api/v1/products?sort=-created_at

# 複数フィールド（カンマ区切り）
GET /api/v1/products?sort=-featured,price,-created_at
```

### 全文検索

```
# 検索クエリパラメータ
GET /api/v1/products?q=wireless+headphones

# フィールド指定検索
GET /api/v1/users?email=alice
```

### スパースフィールドセット

```
# 指定フィールドのみ返す（ペイロードを削減）
GET /api/v1/users?fields=id,name,email
GET /api/v1/orders?fields=id,total,status&include=customer.name
```

## 認証と認可

### トークンベース認証

```
# Authorization ヘッダーに Bearer トークン
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# API キー（サーバー間通信用）
GET /api/v1/data
X-API-Key: sk_live_abc123
```

### 認可パターン

```typescript
// リソースレベル: 所有権を確認
app.get("/api/v1/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: { code: "not_found" } });
  if (order.userId !== req.user.id) return res.status(403).json({ error: { code: "forbidden" } });
  return res.json({ data: order });
});

// ロールベース: 権限を確認
app.delete("/api/v1/users/:id", requireRole("admin"), async (req, res) => {
  await User.delete(req.params.id);
  return res.status(204).send();
});
```

## レート制限

### ヘッダー

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000

# 制限超過時
HTTP/1.1 429 Too Many Requests
Retry-After: 60
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

### レート制限ティア

| ティア | 制限 | ウィンドウ | ユースケース |
|------|-------|--------|----------|
| 匿名 | 30/分 | IP ごと | 公開エンドポイント |
| 認証済み | 100/分 | ユーザーごと | 標準 API アクセス |
| プレミアム | 1000/分 | API キーごと | 有料 API プラン |
| 内部 | 10000/分 | サービスごと | サービス間通信 |

## バージョニング

### URL パスバージョニング（推奨）

```
/api/v1/users
/api/v2/users
```

**メリット:** 明示的・ルーティングが簡単・キャッシュ可能
**デメリット:** バージョン間で URL が変わる

### ヘッダーバージョニング

```
GET /api/users
Accept: application/vnd.myapp.v2+json
```

**メリット:** URL がクリーン
**デメリット:** テストしにくい・忘れやすい

### バージョニング戦略

```
1. /api/v1/ から始める — 必要になるまでバージョンを切らない
2. 同時にサポートするのは最大 2 バージョン（現行 + 前バージョン）
3. 廃止スケジュール:
   - 廃止予告（公開 API は 6 ヶ月前に通知）
   - Sunset ヘッダーを付与: Sunset: Sat, 01 Jan 2026 00:00:00 GMT
   - 廃止日以降は 410 Gone を返す
4. 後方互換な変更は新バージョン不要:
   - レスポンスへの新フィールド追加
   - 新しいオプションクエリパラメータの追加
   - 新エンドポイントの追加
5. 破壊的変更は新バージョンが必要:
   - フィールドの削除・リネーム
   - フィールドの型変更
   - URL 構造の変更
   - 認証方式の変更
```

## 実装パターン

### TypeScript (Next.js API Route)

```typescript
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({
      error: {
        code: "validation_error",
        message: "Request validation failed",
        details: parsed.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message,
          code: i.code,
        })),
      },
    }, { status: 422 });
  }

  const user = await createUser(parsed.data);

  return NextResponse.json(
    { data: user },
    {
      status: 201,
      headers: { Location: `/api/v1/users/${user.id}` },
    },
  );
}
```

### Python (Django REST Framework)

```python
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response

class CreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=100)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "created_at"]

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateUserSerializer
        return UserSerializer

    def create(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.create(**serializer.validated_data)
        return Response(
            {"data": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
            headers={"Location": f"/api/v1/users/{user.id}"},
        )
```

### Go (net/http)

```go
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid_json", "Invalid request body")
        return
    }

    if err := req.Validate(); err != nil {
        writeError(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
        return
    }

    user, err := h.service.Create(r.Context(), req)
    if err != nil {
        switch {
        case errors.Is(err, domain.ErrEmailTaken):
            writeError(w, http.StatusConflict, "email_taken", "Email already registered")
        default:
            writeError(w, http.StatusInternalServerError, "internal_error", "Internal error")
        }
        return
    }

    w.Header().Set("Location", fmt.Sprintf("/api/v1/users/%s", user.ID))
    writeJSON(w, http.StatusCreated, map[string]any{"data": user})
}
```

## API 設計チェックリスト

新しいエンドポイントをリリースする前に:

- [ ] リソース URL が命名規則に従っている（複数形・kebab-case・動詞なし）
- [ ] 正しい HTTP メソッドを使用している（読み取りは GET・作成は POST など）
- [ ] 適切なステータスコードを返している（全てに 200 を使わない）
- [ ] スキーマ（Zod・Pydantic・Bean Validation）でバリデーションしている
- [ ] エラーレスポンスがコードとメッセージを含む標準形式に従っている
- [ ] リストエンドポイントにページネーションを実装している（カーソルまたはオフセット）
- [ ] 認証を要求している（または明示的に公開として設定している）
- [ ] 認可を確認している（ユーザーは自分のリソースにのみアクセス可能）
- [ ] レート制限を設定している
- [ ] レスポンスに内部情報が漏れていない（スタックトレース・SQL エラーなど）
- [ ] 既存エンドポイントと命名が一貫している（camelCase vs snake_case）
- [ ] ドキュメントを更新している（OpenAPI/Swagger スペック）
