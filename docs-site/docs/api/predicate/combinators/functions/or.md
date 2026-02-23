# Function: or()

> **or**\<`T`\>(...`predicates`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/combinators/index.ts:90](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/combinators/index.ts#L90)

Combines multiple predicates with logical OR.

Returns a predicate that is true if any predicate returns true.
Short-circuits on the first true result.

## Type Parameters

### T

`T`

## Parameters

### predicates

...[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>[]

The predicates to combine

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if any predicate returns true

## Example

```typescript
import * as R from 'remeda'
import { eq, or } from 'receta/predicate'

// Match multiple values
const numbers = [1, 2, 3, 4, 5]
R.filter(numbers, or(eq(1), eq(3), eq(5))) // => [1, 3, 5]

// Real-world: Filter by multiple statuses
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'shipped' },
  { id: 3, status: 'delivered' },
  { id: 4, status: 'cancelled' }
]
R.filter(
  orders,
  (o) => or(
    eq('pending'),
    eq('shipped')
  )(o.status)
) // => pending and shipped orders
```

## See

 - and - for logical AND
 - not - for logical NOT
 - oneOf - for checking against a list of values
