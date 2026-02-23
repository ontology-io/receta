# Function: not()

> **not**\<`T`\>(`predicate`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/combinators/index.ts:127](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/combinators/index.ts#L127)

Negates a predicate.

Returns a predicate that returns the opposite boolean value.

## Type Parameters

### T

`T`

## Parameters

### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

The predicate to negate

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns the opposite of the input predicate

## Example

```typescript
import * as R from 'remeda'
import { eq, not, isEmpty } from 'receta/predicate'

const numbers = [1, 2, 3, 2, 1]
R.filter(numbers, not(eq(2))) // => [1, 3, 1]

// Real-world: Filter non-empty strings
const names = ['Alice', '', 'Bob', '', 'Charlie']
R.filter(names, not(isEmpty)) // => ['Alice', 'Bob', 'Charlie']

// Complex negation
const users = [
  { name: 'Alice', admin: true },
  { name: 'Bob', admin: false },
  { name: 'Charlie', admin: false }
]
R.filter(users, not((u) => u.admin)) // => non-admin users
```

## See

 - and - for logical AND
 - or - for logical OR
