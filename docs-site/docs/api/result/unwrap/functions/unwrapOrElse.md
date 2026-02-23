# Function: unwrapOrElse()

## Call Signature

> **unwrapOrElse**\<`T`, `E`\>(`result`, `fn`): `T`

Defined in: [result/unwrap/index.ts:94](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/unwrap/index.ts#L94)

Extracts the value from an Ok Result or computes a fallback from the error.

Unlike `unwrapOr`, this allows you to compute the default value lazily
and access the error for decision-making.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to unwrap

#### fn

(`error`) => `T`

Function to compute fallback from error

### Returns

`T`

The value from Ok or the computed fallback

### Example

```typescript
// Data-first
unwrapOrElse(ok(42), () => 0) // => 42
unwrapOrElse(err('fail'), e => {
  console.error(e)
  return 0
}) // logs 'fail', returns 0

// Data-last (in pipe)
pipe(
  fetchUser(id),
  unwrapOrElse(error => {
    logError(error)
    return guestUser
  })
)
```

### See

unwrapOr - for static default values

## Call Signature

> **unwrapOrElse**\<`T`, `E`\>(`fn`): (`result`) => `T`

Defined in: [result/unwrap/index.ts:95](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/unwrap/index.ts#L95)

Extracts the value from an Ok Result or computes a fallback from the error.

Unlike `unwrapOr`, this allows you to compute the default value lazily
and access the error for decision-making.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### fn

(`error`) => `T`

Function to compute fallback from error

### Returns

The value from Ok or the computed fallback

> (`result`): `T`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Returns

`T`

### Example

```typescript
// Data-first
unwrapOrElse(ok(42), () => 0) // => 42
unwrapOrElse(err('fail'), e => {
  console.error(e)
  return 0
}) // logs 'fail', returns 0

// Data-last (in pipe)
pipe(
  fetchUser(id),
  unwrapOrElse(error => {
    logError(error)
    return guestUser
  })
)
```

### See

unwrapOr - for static default values
