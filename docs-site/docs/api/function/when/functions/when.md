# Function: when()

## Call Signature

> **when**\<`T`\>(`predicate`, `fn`): (`value`) => `T`

Defined in: [function/when/index.ts:51](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/when/index.ts#L51)

Creates a function that conditionally applies a transformation.

Returns a function that tests its input against the predicate. If the predicate
passes, applies the given function; otherwise returns the input unchanged.

This is useful for conditional transformations where you want to preserve
the original value when the condition is not met.

### Type Parameters

#### T

`T`

### Parameters

#### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

#### fn

[`Mapper`](../../types/type-aliases/Mapper.md)\<`T`, `T`\>

### Returns

> (`value`): `T`

#### Parameters

##### value

`T`

#### Returns

`T`

### Examples

```typescript
const ensurePositive = when(
  (n: number) => n < 0,
  (n) => Math.abs(n)
)

ensurePositive(-5)  // => 5
ensurePositive(3)   // => 3
ensurePositive(0)   // => 0
```

```typescript
// Data-first
const result = when(
  (str: string) => str.length === 0,
  () => 'default',
  ''
)
// => 'default'
```

```typescript
// In a pipe for conditional transformations
pipe(
  getUserInput(),
  when(
    (input) => input.trim().length === 0,
    () => 'Anonymous'
  ),
  processUsername
)
```

### See

unless - for the inverse condition

## Call Signature

> **when**\<`T`\>(`predicate`, `fn`, `value`): `T`

Defined in: [function/when/index.ts:52](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/when/index.ts#L52)

Creates a function that conditionally applies a transformation.

Returns a function that tests its input against the predicate. If the predicate
passes, applies the given function; otherwise returns the input unchanged.

This is useful for conditional transformations where you want to preserve
the original value when the condition is not met.

### Type Parameters

#### T

`T`

### Parameters

#### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

#### fn

[`Mapper`](../../types/type-aliases/Mapper.md)\<`T`, `T`\>

#### value

`T`

### Returns

`T`

### Examples

```typescript
const ensurePositive = when(
  (n: number) => n < 0,
  (n) => Math.abs(n)
)

ensurePositive(-5)  // => 5
ensurePositive(3)   // => 3
ensurePositive(0)   // => 0
```

```typescript
// Data-first
const result = when(
  (str: string) => str.length === 0,
  () => 'default',
  ''
)
// => 'default'
```

```typescript
// In a pipe for conditional transformations
pipe(
  getUserInput(),
  when(
    (input) => input.trim().length === 0,
    () => 'Anonymous'
  ),
  processUsername
)
```

### See

unless - for the inverse condition
