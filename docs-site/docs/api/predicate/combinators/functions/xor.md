# Function: xor()

> **xor**\<`T`\>(...`predicates`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/combinators/index.ts:166](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/combinators/index.ts#L166)

Combines multiple predicates with logical XOR (exclusive or).

Returns a predicate that is true if exactly one predicate returns true.

## Type Parameters

### T

`T`

## Parameters

### predicates

...[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>[]

The predicates to combine (must have at least 2)

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if exactly one predicate returns true

## Example

```typescript
import * as R from 'remeda'
import { gt, lt, xor } from 'receta/predicate'

const numbers = [1, 5, 10, 15, 20]
// Keep numbers that are either < 8 OR > 12, but not both
R.filter(numbers, xor(lt(8), gt(12))) // => [1, 5, 15, 20]
// 10 is excluded because it's neither < 8 nor > 12

// Real-world: Exclusive features (must have one but not both)
const products = [
  { id: 1, premium: true, trial: false },  // valid
  { id: 2, premium: false, trial: true },  // valid
  { id: 3, premium: true, trial: true },   // invalid (both)
  { id: 4, premium: false, trial: false }  // invalid (neither)
]
R.filter(
  products,
  xor((p) => p.premium, (p) => p.trial)
) // => products 1 and 2
```

## See

 - or - for inclusive OR
 - and - for logical AND
