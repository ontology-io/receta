# Function: tryCatchAsync()

## Call Signature

> **tryCatchAsync**\<`T`\>(`fn`): `Promise`\<[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `unknown`\>\>

Defined in: [validation/constructors/index.ts:258](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/constructors/index.ts#L258)

Async version of tryCatch.

Wraps a potentially rejecting Promise in a Validation.

### Type Parameters

#### T

`T`

### Parameters

#### fn

() => `Promise`\<`T`\>

Async function that may throw

### Returns

`Promise`\<[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `unknown`\>\>

Promise of Validation containing either the return value or error

### Example

```typescript
// Fetch with validation
const fetchUser = async (id: string): Promise<Validation<User, unknown>> =>
  tryCatchAsync(() => fetch(`/api/users/${id}`).then(r => r.json()))

// With error mapping
const fetchUser = async (id: string): Promise<Validation<User, string>> =>
  tryCatchAsync(
    () => fetch(`/api/users/${id}`).then(r => r.json()),
    (e) => `Failed to fetch user: ${e}`
  )
```

## Call Signature

> **tryCatchAsync**\<`T`, `E`\>(`fn`, `mapError`): `Promise`\<[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>\>

Defined in: [validation/constructors/index.ts:283](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/constructors/index.ts#L283)

Async version of tryCatch with error mapping.

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

`Promise`\<[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>\>

Promise of Validation containing either the return value or mapped error

### Example

```typescript
// Real-world: API call with validation
const createUser = async (data: unknown): Promise<Validation<User, string>> =>
  pipe(
    await tryCatchAsync(
      () => fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(r => r.json()),
      (e) => `Network error: ${e}`
    ),
    flatMap(validateUserData)
  )
```
