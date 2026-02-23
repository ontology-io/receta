# Function: lt()

> **lt**\<`T`\>(`threshold`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:82](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L82)

Creates a predicate that tests if a value is less than a threshold.

## Type Parameters

### T

`T` *extends* `number` \| `bigint`

## Parameters

### threshold

`T`

The maximum value (exclusive)

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value < threshold

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, lt(10)) // => [1, 5]

// Useful for filtering by age, price, etc.
const products = [
  { name: 'A', price: 5 },
  { name: 'B', price: 15 },
  { name: 'C', price: 25 }
]
R.filter(products, (p) => lt(20)(p.price)) // => products A and B
```

## See

 - lte - for inclusive comparison (<=)
 - gt - for greater than comparison
 - between - for range comparison
