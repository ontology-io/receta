# Function: between()

> **between**\<`T`\>(`min`, `max`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:179](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L179)

Creates a predicate that tests if a value is within a range (inclusive).

## Type Parameters

### T

`T` *extends* `number` \| `bigint`

## Parameters

### min

`T`

The minimum value (inclusive)

### max

`T`

The maximum value (inclusive)

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if min <= value <= max

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 5, 10, 15, 20, 25]
R.filter(numbers, between(10, 20)) // => [10, 15, 20]

// Real-world: Filter products by price range
const products = [
  { name: 'Budget', price: 5 },
  { name: 'Standard', price: 15 },
  { name: 'Premium', price: 50 }
]
R.filter(products, (p) => between(10, 30)(p.price))
// => [{ name: 'Standard', price: 15 }]
```

## See

 - gt - for greater than comparison
 - lt - for less than comparison
