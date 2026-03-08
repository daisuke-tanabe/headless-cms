---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を TypeScript/JavaScript 固有の内容で拡張したものです。

## イミュータビリティ

スプレッド演算子を使ってイミュータブルな更新を行う:

```typescript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## エラーハンドリング

async/await と try-catch を使用する:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## 入力バリデーション

Zod を使ってスキーマベースのバリデーションを行う:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Console.log

- プロダクションコードに `console.log` を残してはならない
- 代わりに適切なロギングライブラリを使用する
- 自動検出についてはフックを参照
