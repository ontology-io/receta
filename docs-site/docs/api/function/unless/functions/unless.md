# Function: unless()

## Call Signature

> **unless**\<`T`\>(`predicate`, `fn`): (`value`) => `T`

Defined in: [function/unless/index.ts:50](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/unless/index.ts#L50)

Creates a function that conditionally applies a transformation (inverse of when).

Returns a function that tests its input against the predicate. If the predicate
fails, applies the given function; otherwise returns the input unchanged.

This is the inverse of `when` - it applies the transformation when the
condition is NOT met.

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
const ensureArray = unless(
  Array.isArray,
  (value) => [value]
)

ensureArray([1, 2, 3])  // => [1, 2, 3]
ensureArray(5)          // => [5]
ensureArray('hello')    // => ['hello']
```

```typescript
// Data-first
const result = unless(
  (str: string) => str.startsWith('http'),
  (str) => `https://${str}`,
  'example.com'
)
// => 'https://example.com'
```

```typescript
// In a pipe
pipe(
  getConfig(),
  unless(
    (config) => 'apiKey' in config,
    (config) => ({ ...config, apiKey: process.env.API_KEY })
  )
)
```

### See

when - for the normal condition

## Call Signature

> **unless**\<`T`\>(`predicate`, `fn`, `value`): `T`

Defined in: [function/unless/index.ts:51](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/unless/index.ts#L51)

Creates a function that conditionally applies a transformation (inverse of when).

Returns a function that tests its input against the predicate. If the predicate
fails, applies the given function; otherwise returns the input unchanged.

This is the inverse of `when` - it applies the transformation when the
condition is NOT met.

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
const ensureArray = unless(
  Array.isArray,
  (value) => [value]
)

ensureArray([1, 2, 3])  // => [1, 2, 3]
ensureArray(5)          // => [5]
ensureArray('hello')    // => ['hello']
```

```typescript
// Data-first
const result = unless(
  (str: string) => str.startsWith('http'),
  (str) => `https://${str}`,
  'example.com'
)
// => 'https://example.com'
```

```typescript
// In a pipe
pipe(
  getConfig(),
  unless(
    (config) => 'apiKey' in config,
    (config) => ({ ...config, apiKey: process.env.API_KEY })
  )
)
```

### See

when - for the normal condition
