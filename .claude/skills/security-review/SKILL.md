---
name: security-review
description: 認証の追加・ユーザー入力の処理・シークレットの取り扱い・API エンドポイントの作成・決済/機密機能の実装時に使用する。包括的なセキュリティチェックリストとパターンを提供する。
---

# セキュリティレビュースキル

このスキルは全てのコードがセキュリティのベストプラクティスに従い、潜在的な脆弱性を特定することを確実にする。

## 発動タイミング

- 認証または認可を実装するとき
- ユーザー入力やファイルアップロードを処理するとき
- 新しい API エンドポイントを作成するとき
- シークレットまたはクレデンシャルを扱うとき
- 決済機能を実装するとき
- 機密データを保存または送信するとき
- サードパーティ API を統合するとき

## セキュリティチェックリスト

### 1. シークレット管理

#### してはいけないこと
```typescript
const apiKey = "sk-proj-xxxxx"  // ハードコードされたシークレット
const dbPassword = "password123" // ソースコードに記載
```

#### 常にすべきこと
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// シークレットの存在を確認
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### 確認ステップ
- [ ] ハードコードされた API キー・トークン・パスワードがない
- [ ] 全シークレットが環境変数に保存されている
- [ ] `.env.local` が .gitignore に追加されている
- [ ] git 履歴にシークレットが含まれていない
- [ ] 本番シークレットがホスティングプラットフォームに設定されている（Vercel・Railway）

### 2. 入力バリデーション

#### ユーザー入力を常にバリデーションする
```typescript
import { z } from 'zod'

// バリデーションスキーマを定義
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 処理前にバリデーション
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### ファイルアップロードのバリデーション
```typescript
function validateFileUpload(file: File) {
  // サイズチェック（最大 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // タイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // 拡張子チェック
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### 確認ステップ
- [ ] 全ユーザー入力がスキーマでバリデーションされている
- [ ] ファイルアップロードが制限されている（サイズ・タイプ・拡張子）
- [ ] クエリでユーザー入力を直接使用していない
- [ ] ホワイトリストバリデーション（ブラックリストではない）
- [ ] エラーメッセージが機密情報を漏らしていない

### 3. SQL インジェクション防止

#### SQL を連結してはいけない
```typescript
// 危険 - SQL インジェクションの脆弱性
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### 常にパラメータ化クエリを使用する
```typescript
// 安全 - パラメータ化クエリ
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// または生 SQL で
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 確認ステップ
- [ ] 全データベースクエリがパラメータ化クエリを使用している
- [ ] SQL への文字列連結がない
- [ ] ORM/クエリビルダーが正しく使用されている
- [ ] Supabase クエリが適切にサニタイズされている

### 4. 認証と認可

#### JWT トークン処理
```typescript
// ❌ 誤り: localStorage（XSS に脆弱）
localStorage.setItem('token', token)

// ✅ 正しい: httpOnly Cookie
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 認可チェック
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 常に最初に認可を確認する
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // 削除を実行
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security（Supabase）
```sql
-- 全テーブルで RLS を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 確認ステップ
- [ ] トークンが httpOnly Cookie に保存されている（localStorage ではない）
- [ ] 機密操作の前に認可チェックがある
- [ ] Supabase で Row Level Security が有効
- [ ] ロールベースアクセス制御が実装されている
- [ ] セッション管理がセキュア

### 5. XSS 防止

#### HTML をサニタイズする
```typescript
import DOMPurify from 'isomorphic-dompurify'

// ユーザー提供の HTML は常にサニタイズする
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 確認ステップ
- [ ] ユーザー提供の HTML がサニタイズされている
- [ ] CSP ヘッダーが設定されている
- [ ] バリデーションされていない動的コンテンツのレンダリングがない
- [ ] React 組み込みの XSS 保護が活用されている

### 6. CSRF 防止

#### CSRF トークン
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // リクエストを処理
}
```

#### SameSite Cookie
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 確認ステップ
- [ ] 状態を変更する操作に CSRF トークンがある
- [ ] 全 Cookie に SameSite=Strict が設定されている
- [ ] ダブルサブミット Cookie パターンが実装されている

### 7. レート制限

#### API レート制限
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分
  max: 100, // ウィンドウあたり 100 リクエスト
  message: 'Too many requests'
})

// ルートに適用
app.use('/api/', limiter)
```

#### コストの高い操作
```typescript
// 検索への積極的なレート制限
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分
  max: 10, // 1 分あたり 10 リクエスト
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### 確認ステップ
- [ ] 全 API エンドポイントにレート制限がある
- [ ] コストの高い操作により厳しい制限がある
- [ ] IP ベースのレート制限がある
- [ ] ユーザーベースのレート制限がある（認証済み）

### 8. 機密データの露出

#### ログ出力
```typescript
// ❌ 誤り: 機密データをログに出力
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ 正しい: 機密データをマスクする
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### エラーメッセージ
```typescript
// ❌ 誤り: 内部詳細を露出
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ 正しい: 汎用エラーメッセージ
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### 確認ステップ
- [ ] ログにパスワード・トークン・シークレットが含まれていない
- [ ] ユーザー向けエラーメッセージが汎用的
- [ ] 詳細なエラーはサーバーログのみ
- [ ] スタックトレースがユーザーに公開されていない

### 9. ブロックチェーンセキュリティ（Solana）

#### ウォレット検証
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### トランザクション検証
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 受取人を確認
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // 金額を確認
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // ユーザーが十分な残高を持っているか確認
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### 確認ステップ
- [ ] ウォレットの署名が検証されている
- [ ] トランザクションの詳細がバリデーションされている
- [ ] トランザクション前の残高チェックがある
- [ ] 盲目的なトランザクション署名がない

### 10. 依存関係のセキュリティ

#### 定期的な更新
```bash
# 脆弱性を確認
npm audit

# 自動修正可能な問題を修正
npm audit fix

# 依存関係を更新
npm update

# 古いパッケージを確認
npm outdated
```

#### ロックファイル
```bash
# ロックファイルは常にコミットする
git add package-lock.json

# 再現可能なビルドのために CI/CD で使用
npm ci  # npm install の代わりに
```

#### 確認ステップ
- [ ] 依存関係が最新
- [ ] 既知の脆弱性がない（npm audit クリーン）
- [ ] ロックファイルがコミットされている
- [ ] GitHub で Dependabot が有効
- [ ] 定期的なセキュリティ更新がある

## セキュリティテスト

### 自動セキュリティテスト
```typescript
// 認証テスト
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// 認可テスト
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// 入力バリデーションテスト
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// レート制限テスト
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## デプロイ前セキュリティチェックリスト

本番へのデプロイ前に:

- [ ] **シークレット**: ハードコードされたシークレットなし・全て env var に保存
- [ ] **入力バリデーション**: 全ユーザー入力がバリデーションされている
- [ ] **SQL インジェクション**: 全クエリがパラメータ化されている
- [ ] **XSS**: ユーザーコンテンツがサニタイズされている
- [ ] **CSRF**: 保護が有効
- [ ] **認証**: 適切なトークン処理
- [ ] **認可**: ロールチェックが実装されている
- [ ] **レート制限**: 全エンドポイントで有効
- [ ] **HTTPS**: 本番環境で強制されている
- [ ] **セキュリティヘッダー**: CSP・X-Frame-Options が設定されている
- [ ] **エラーハンドリング**: エラーに機密データが含まれていない
- [ ] **ログ**: 機密データがログに含まれていない
- [ ] **依存関係**: 最新・脆弱性なし
- [ ] **Row Level Security**: Supabase で有効
- [ ] **CORS**: 適切に設定されている
- [ ] **ファイルアップロード**: バリデーションされている（サイズ・タイプ）
- [ ] **ウォレット署名**: 検証されている（ブロックチェーンの場合）

## 参考リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**注意**: セキュリティはオプションではありません。1 つの脆弱性がプラットフォーム全体を危険にさらす可能性があります。迷った場合は、より慎重な方向を選んでください。
