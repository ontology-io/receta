# Function: never()

> **never**\<`T`\>(): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/combinators/index.ts:225](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/combinators/index.ts#L225)

Creates a predicate that always returns false.

Useful as a default or fallback predicate for filtering out all items.

## Type Parameters

### T

`T`

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that always returns false

## Example

```typescript
import * as R from 'remeda'
import { never } from 'receta/predicate'

// Filter out all items
R.filter([1, 2, 3], never()) // => []

// Real-world: Disable filtering temporarily
const isDebugMode = process.env.DEBUG === 'true'
const predicate = isDebugMode ? never<Log>() : (log) => log.level === 'error'
```

## See

always - for a predicate that always returns true
