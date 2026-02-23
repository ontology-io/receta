# Function: tryCatchAsync()

## Call Signature

> **tryCatchAsync**\<`T`\>(`fn`): `Promise`\<[`Result`](../../types/type-aliases/Result.md)\<`T`, `unknown`\>\>

Defined in: [result/constructors/index.ts:109](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/constructors/index.ts#L109)

Wraps an async function in a Result, catching any errors.

### Type Parameters

#### T

`T`

### Parameters

#### fn

() => `Promise`\<`T`\>

Async function that may throw

### Returns

`Promise`\<[`Result`](../../types/type-aliases/Result.md)\<`T`, `unknown`\>\>

Promise of Result containing either the value or error

### Example

```typescript
const fetchUser = async (id: string) =>
  tryCatchAsync(async () => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  })

const result = await fetchUser('123')
// => Ok({ name: 'John' }) or Err(NetworkError)
```

## Call Signature

> **tryCatchAsync**\<`T`, `E`\>(`fn`, `mapError`): `Promise`\<[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>\>

Defined in: [result/constructors/index.ts:131](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/constructors/index.ts#L131)

Wraps an async function in a Result with custom error mapping.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### fn

() => `Promise`\<`T`\>

Async function that may throw

#### mapError

(`error`) => `E`

Function to transform the caught error

### Returns

`Promise`\<[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>\>

Promise of Result containing either the value or mapped error

### Example

```typescript
const fetchUser = async (id: string) =>
  tryCatchAsync(
    async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    (e) => ({ code: 'FETCH_ERROR', message: String(e) })
  )
```
