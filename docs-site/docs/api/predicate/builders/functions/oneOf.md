# Function: oneOf()

> **oneOf**\<`T`\>(`values`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:110](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/builders/index.ts#L110)

Creates a predicate that tests if a value is in a list.

Uses strict equality (===) for comparison.

## Type Parameters

### T

`T`

## Parameters

### values

readonly `T`[]

The list of values to check against

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value is in the list

## Example

```typescript
import * as R from 'remeda'
import { oneOf } from 'receta/predicate'

const numbers = [1, 2, 3, 4, 5]
R.filter(numbers, oneOf([1, 3, 5])) // => [1, 3, 5]

// Real-world: Filter by allowed statuses
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'shipped' },
  { id: 3, status: 'cancelled' },
  { id: 4, status: 'delivered' }
]
R.filter(
  orders,
  (o) => oneOf(['pending', 'shipped'])(o.status)
) // => pending and shipped orders

// More concise with prop
import { prop } from 'receta/predicate'
R.filter(orders, prop('status', oneOf(['pending', 'shipped'])))
```

## See

 - eq - for single value comparison
 - or - for combining multiple predicates
