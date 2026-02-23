# Function: tap()

## Call Signature

> **tap**\<`T`\>(`option`, `fn`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/tap/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/tap/index.ts#L35)

Performs a side effect on Some value without modifying the Option.

If the Option is Some, calls the function with the value.
Returns the original Option unchanged.

Useful for logging, debugging, or other side effects.

### Type Parameters

#### T

`T`

### Parameters

#### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to tap

#### fn

(`value`) => `void`

Side effect function

### Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The original Option

### Example

```typescript
// Data-first
tap(some(42), x => console.log('Value:', x))
// Logs: "Value: 42"
// => Some(42)

// Data-last (in pipe)
pipe(
  findUser(id),
  tap(user => console.log('Found user:', user.name)),
  map(user => user.email)
)
```

### See

 - tapNone - for side effects on None
 - map - for transforming values

## Call Signature

> **tap**\<`T`\>(`fn`): (`option`) => [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/tap/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/tap/index.ts#L36)

Performs a side effect on Some value without modifying the Option.

If the Option is Some, calls the function with the value.
Returns the original Option unchanged.

Useful for logging, debugging, or other side effects.

### Type Parameters

#### T

`T`

### Parameters

#### fn

(`value`) => `void`

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
tap(some(42), x => console.log('Value:', x))
// Logs: "Value: 42"
// => Some(42)

// Data-last (in pipe)
pipe(
  findUser(id),
  tap(user => console.log('Found user:', user.name)),
  map(user => user.email)
)
```

### See

 - tapNone - for side effects on None
 - map - for transforming values
