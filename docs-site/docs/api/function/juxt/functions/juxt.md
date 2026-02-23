# Function: juxt()

## Call Signature

> **juxt**\<`Fns`\>(`fns`): (...`args`) => [`ReturnTypes`](../../types/type-aliases/ReturnTypes.md)\<`Fns`\>

Defined in: [function/juxt/index.ts:67](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/juxt/index.ts#L67)

Creates a function that applies multiple functions to the same input and returns all results as an array.

The `juxt` combinator (short for "juxtaposition") applies each function to the input value
and collects all results in an array, preserving the order.

This is useful when you need to apply multiple transformations to the same value
and keep all the results.

### Type Parameters

#### Fns

`Fns` *extends* readonly (...`args`) => `any`[]

### Parameters

#### fns

`Fns`

### Returns

> (...`args`): [`ReturnTypes`](../../types/type-aliases/ReturnTypes.md)\<`Fns`\>

#### Parameters

##### args

...`Parameters`\<`Fns`\[`0`\]\>

#### Returns

[`ReturnTypes`](../../types/type-aliases/ReturnTypes.md)\<`Fns`\>

### Examples

```typescript
const analyze = juxt([
  (nums: number[]) => nums.length,
  (nums: number[]) => Math.min(...nums),
  (nums: number[]) => Math.max(...nums),
  (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
])

analyze([1, 2, 3, 4, 5])
// => [5, 1, 5, 3]
//    [length, min, max, average]
```

```typescript
// Extract multiple fields from an object
interface User { id: string; name: string; email: string; role: string }

const getUserSummary = juxt([
  (user: User) => user.id,
  (user: User) => user.name,
  (user: User) => user.role
])

getUserSummary({ id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' })
// => ['1', 'Alice', 'admin']
```

```typescript
// Data-first
const result = juxt([
  (s: string) => s.toUpperCase(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.length
], 'Hello')
// => ['HELLO', 'hello', 5]
```

```typescript
// In a pipe
pipe(
  getUserInput(),
  juxt([
    (input) => input.trim(),
    (input) => input.length,
    (input) => input.split(' ').length
  ])
)
// => [trimmedInput, totalLength, wordCount]
```

## Call Signature

> **juxt**\<`Fns`\>(`fns`, ...`args`): [`ReturnTypes`](../../types/type-aliases/ReturnTypes.md)\<`Fns`\>

Defined in: [function/juxt/index.ts:70](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/juxt/index.ts#L70)

Creates a function that applies multiple functions to the same input and returns all results as an array.

The `juxt` combinator (short for "juxtaposition") applies each function to the input value
and collects all results in an array, preserving the order.

This is useful when you need to apply multiple transformations to the same value
and keep all the results.

### Type Parameters

#### Fns

`Fns` *extends* readonly (...`args`) => `any`[]

### Parameters

#### fns

`Fns`

#### args

...`Parameters`\<`Fns`\[`0`\]\>

### Returns

[`ReturnTypes`](../../types/type-aliases/ReturnTypes.md)\<`Fns`\>

### Examples

```typescript
const analyze = juxt([
  (nums: number[]) => nums.length,
  (nums: number[]) => Math.min(...nums),
  (nums: number[]) => Math.max(...nums),
  (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
])

analyze([1, 2, 3, 4, 5])
// => [5, 1, 5, 3]
//    [length, min, max, average]
```

```typescript
// Extract multiple fields from an object
interface User { id: string; name: string; email: string; role: string }

const getUserSummary = juxt([
  (user: User) => user.id,
  (user: User) => user.name,
  (user: User) => user.role
])

getUserSummary({ id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' })
// => ['1', 'Alice', 'admin']
```

```typescript
// Data-first
const result = juxt([
  (s: string) => s.toUpperCase(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.length
], 'Hello')
// => ['HELLO', 'hello', 5]
```

```typescript
// In a pipe
pipe(
  getUserInput(),
  juxt([
    (input) => input.trim(),
    (input) => input.length,
    (input) => input.split(' ').length
  ])
)
// => [trimmedInput, totalLength, wordCount]
```
