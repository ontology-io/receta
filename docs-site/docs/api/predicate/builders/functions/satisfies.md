# Function: satisfies()

> **satisfies**\<`T`\>(`predicate`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:273](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/builders/index.ts#L273)

Creates a predicate that tests if a value satisfies a custom condition.

This is just an identity function that makes code more readable.

## Type Parameters

### T

`T`

## Parameters

### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

The predicate function

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

The same predicate (for readability)

## Example

```typescript
import * as R from 'remeda'
import { satisfies } from 'receta/predicate'

const numbers = [1, 2, 3, 4, 5]
R.filter(numbers, satisfies((n) => n % 2 === 0)) // => [2, 4]

// Makes complex predicates more readable
const users = [
  { name: 'Alice', age: 25, premium: true },
  { name: 'Bob', age: 17, premium: false },
  { name: 'Charlie', age: 30, premium: true }
]
R.filter(
  users,
  satisfies((u) => u.age >= 18 && u.premium)
)
```

## See

where - for structured object testing
