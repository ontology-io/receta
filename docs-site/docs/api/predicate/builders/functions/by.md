# Function: by()

> **by**\<`T`, `U`\>(`selector`, `predicate`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:319](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/builders/index.ts#L319)

Creates a predicate by composing a selector function with a predicate.

Useful for testing derived values or nested properties.

## Type Parameters

### T

`T`

### U

`U`

## Parameters

### selector

(`value`) => `U`

Function to extract a value from the input

### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`U`\>

Predicate to apply to the extracted value

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that tests the selected value

## Example

```typescript
import * as R from 'remeda'
import { by, gt } from 'receta/predicate'

const users = [
  { name: 'Alice', tags: ['admin', 'user'] },
  { name: 'Bob', tags: ['user'] },
  { name: 'Charlie', tags: ['admin', 'moderator', 'user'] }
]

// Test derived values
R.filter(
  users,
  by((u) => u.tags.length, gt(1))
)
// => Alice and Charlie (have multiple tags)

// Real-world: Filter by computed values
const products = [
  { name: 'A', price: 100, discount: 0.1 },
  { name: 'B', price: 50, discount: 0.2 },
  { name: 'C', price: 150, discount: 0 }
]
R.filter(
  products,
  by((p) => p.price * (1 - p.discount), gt(80))
)
// => products with final price > 80
```

## See

 - prop - for simple property access
 - where - for multiple property testing
