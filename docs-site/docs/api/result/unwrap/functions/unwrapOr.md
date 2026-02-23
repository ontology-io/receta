# Function: unwrapOr()

## Call Signature

> **unwrapOr**\<`T`, `E`\>(`result`, `defaultValue`): `T`

Defined in: [result/unwrap/index.ts:53](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/unwrap/index.ts#L53)

Extracts the value from an Ok Result or returns a default.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to unwrap

#### defaultValue

`T`

Value to return if Result is Err

### Returns

`T`

The value from Ok or the default

### Example

```typescript
// Data-first
unwrapOr(ok(42), 0) // => 42
unwrapOr(err('fail'), 0) // => 0

// Data-last (in pipe)
pipe(
  parseNumber('abc'),
  unwrapOr(0)
) // => 0
```

### See

unwrapOrElse - for lazy default computation

## Call Signature

> **unwrapOr**\<`T`\>(`defaultValue`): \<`E`\>(`result`) => `T`

Defined in: [result/unwrap/index.ts:54](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/unwrap/index.ts#L54)

Extracts the value from an Ok Result or returns a default.

### Type Parameters

#### T

`T`

### Parameters

#### defaultValue

`T`

Value to return if Result is Err

### Returns

The value from Ok or the default

> \<`E`\>(`result`): `T`

#### Type Parameters

##### E

`E`

#### Parameters

##### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

#### Returns

`T`

### Example

```typescript
// Data-first
unwrapOr(ok(42), 0) // => 42
unwrapOr(err('fail'), 0) // => 0

// Data-last (in pipe)
pipe(
  parseNumber('abc'),
  unwrapOr(0)
) // => 0
```

### See

unwrapOrElse - for lazy default computation
