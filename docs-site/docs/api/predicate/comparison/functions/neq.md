# Function: neq()

> **neq**\<`T`\>(`expected`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:150](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/comparison/index.ts#L150)

Creates a predicate that tests if a value does not equal another value.

Uses strict inequality (!==).

## Type Parameters

### T

`T`

## Parameters

### expected

`T`

The value to compare against

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value !== expected

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 2, 3, 2, 1]
R.filter(numbers, neq(2)) // => [1, 3, 1]
```

## See

eq - for equality comparison
