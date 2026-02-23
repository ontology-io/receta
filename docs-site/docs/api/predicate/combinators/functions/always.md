# Function: always()

> **always**\<`T`\>(): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/combinators/index.ts:201](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/combinators/index.ts#L201)

Creates a predicate that always returns true.

Useful as a default or fallback predicate.

## Type Parameters

### T

`T`

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that always returns true

## Example

```typescript
import * as R from 'remeda'
import { always } from 'receta/predicate'

// Keep all items
R.filter([1, 2, 3], always()) // => [1, 2, 3]

// Real-world: Default case in conditional filtering
const shouldFilter = Math.random() > 0.5
const predicate = shouldFilter ? (n: number) => n > 5 : always<number>()
R.filter([1, 5, 10], predicate)
```

## See

never - for a predicate that always returns false
