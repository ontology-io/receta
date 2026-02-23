# Function: and()

> **and**\<`T`\>(...`predicates`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/combinators/index.ts:47](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/combinators/index.ts#L47)

Combines multiple predicates with logical AND.

Returns a predicate that is true only if all predicates return true.
Short-circuits on the first false result.

## Type Parameters

### T

`T`

## Parameters

### predicates

...[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>[]

The predicates to combine

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if all predicates return true

## Example

```typescript
import * as R from 'remeda'
import { gt, lt, and } from 'receta/predicate'

// Combine comparisons
const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, and(gt(5), lt(15))) // => [10]

// Multiple conditions
const users = [
  { age: 25, active: true, verified: true },
  { age: 30, active: false, verified: true },
  { age: 35, active: true, verified: false }
]
R.filter(
  users,
  and(
    (u) => u.age >= 25,
    (u) => u.active,
    (u) => u.verified
  )
) // => [{ age: 25, active: true, verified: true }]
```

## See

 - or - for logical OR
 - not - for logical NOT
