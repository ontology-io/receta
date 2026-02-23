# Function: ap()

## Call Signature

> **ap**\<`T`, `U`\>(`fns`): (`values`) => `U`[]

Defined in: [function/ap/index.ts:54](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/ap/index.ts#L54)

Applies an array of functions to an array of values (applicative apply).

Creates all possible combinations by applying each function to each value,
returning a flat array of results.

This is useful for applying multiple transformations across multiple values,
though in practice `juxt` or `converge` are often more intuitive.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### fns

readonly (`value`) => `U`[]

### Returns

> (`values`): `U`[]

#### Parameters

##### values

readonly `T`[]

#### Returns

`U`[]

### Examples

```typescript
const fns = [
  (n: number) => n + 1,
  (n: number) => n * 2,
  (n: number) => n * n
]

ap(fns, [1, 2, 3])
// => [
//   2, 3, 4,      // addOne to each
//   2, 4, 6,      // double each
//   1, 4, 9       // square each
// ]
```

```typescript
// Apply multiple validators to multiple inputs
const validators = [
  (s: string) => s.length > 0,
  (s: string) => s.length < 100,
  (s: string) => /^[a-z]+$/i.test(s)
]

ap(validators, ['hello', '', 'test123'])
// => [
//   true, false, true,    // length > 0
//   true, true, true,     // length < 100
//   true, false, false    // only letters
// ]
```

```typescript
// Data-first
const fns = [(n: number) => n + 10, (n: number) => n * 10]
const result = ap(fns, [1, 2, 3])
// => [11, 12, 13, 10, 20, 30]
```

## Call Signature

> **ap**\<`T`, `U`\>(`fns`, `values`): `U`[]

Defined in: [function/ap/index.ts:55](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/ap/index.ts#L55)

Applies an array of functions to an array of values (applicative apply).

Creates all possible combinations by applying each function to each value,
returning a flat array of results.

This is useful for applying multiple transformations across multiple values,
though in practice `juxt` or `converge` are often more intuitive.

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### fns

readonly (`value`) => `U`[]

#### values

readonly `T`[]

### Returns

`U`[]

### Examples

```typescript
const fns = [
  (n: number) => n + 1,
  (n: number) => n * 2,
  (n: number) => n * n
]

ap(fns, [1, 2, 3])
// => [
//   2, 3, 4,      // addOne to each
//   2, 4, 6,      // double each
//   1, 4, 9       // square each
// ]
```

```typescript
// Apply multiple validators to multiple inputs
const validators = [
  (s: string) => s.length > 0,
  (s: string) => s.length < 100,
  (s: string) => /^[a-z]+$/i.test(s)
]

ap(validators, ['hello', '', 'test123'])
// => [
//   true, false, true,    // length > 0
//   true, true, true,     // length < 100
//   true, false, false    // only letters
// ]
```

```typescript
// Data-first
const fns = [(n: number) => n + 10, (n: number) => n * 10]
const result = ap(fns, [1, 2, 3])
// => [11, 12, 13, 10, 20, 30]
```
