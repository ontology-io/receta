# Function: tapNone()

## Call Signature

> **tapNone**\<`T`\>(`option`, `fn`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/tap/index.ts:77](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/tap/index.ts#L77)

Performs a side effect when the Option is None.

If the Option is None, calls the function.
Returns the original Option unchanged.

Useful for logging missing values or debugging.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to tap

#### fn

() => `void`

Side effect function

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The original Option

### Example

```typescript
// Data-first
tapNone(none(), () => console.log('No value'))
// Logs: "No value"
// => None

// Data-last (in pipe)
pipe(
  findUser(id),
  tapNone(() => console.log('User not found')),
  unwrapOr(guestUser)
)
```

### See

tap - for side effects on Some

## Call Signature

> **tapNone**\<`T`\>(`fn`): (`option`) => [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/tap/index.ts:78](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/tap/index.ts#L78)

Performs a side effect when the Option is None.

If the Option is None, calls the function.
Returns the original Option unchanged.

Useful for logging missing values or debugging.

### Type Parameters

#### T

`T`

### Parameters

#### fn

() => `void`

Side effect function

### Returns

The original Option

> (`option`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Parameters

##### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

#### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

### Example

```typescript
// Data-first
tapNone(none(), () => console.log('No value'))
// Logs: "No value"
// => None

// Data-last (in pipe)
pipe(
  findUser(id),
  tapNone(() => console.log('User not found')),
  unwrapOr(guestUser)
)
```

### See

tap - for side effects on Some
