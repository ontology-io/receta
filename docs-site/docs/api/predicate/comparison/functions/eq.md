# Function: eq()

> **eq**\<`T`\>(`expected`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:130](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L130)

Creates a predicate that tests if a value equals another value.

Uses strict equality (===).

## Type Parameters

### T

`T`

## Parameters

### expected

`T`

The value to compare against

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value === expected

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 2, 3, 2, 1]
R.filter(numbers, eq(2)) // => [2, 2]

const users = [
  { id: 1, status: 'active' },
  { id: 2, status: 'inactive' },
  { id: 3, status: 'active' }
]
R.filter(users, (u) => eq('active')(u.status)) // => active users
```

## See

neq - for inequality comparison
