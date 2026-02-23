# Function: withTiebreaker()

> **withTiebreaker**\<`T`\>(`primary`, `tiebreaker`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/combinators/index.ts:216](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/combinators/index.ts#L216)

Combines a primary comparator with a tiebreaker for when values are equal.

More explicit alternative to `compose` for two-level sorting.

## Type Parameters

### T

`T`

## Parameters

### primary

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

The primary comparator

### tiebreaker

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

The comparator to use when primary returns 0

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator with explicit tiebreaking

## Example

```typescript
interface Player {
  name: string
  score: number
  level: number
}

const players = [
  { name: 'Alice', score: 1000, level: 5 },
  { name: 'Bob', score: 1000, level: 3 },
  { name: 'Charlie', score: 800, level: 4 }
]

// Sort by score (descending), break ties by level (descending)
players.sort(
  withTiebreaker(
    descending(p => p.score),
    descending(p => p.level)
  )
)
// => [{ name: 'Alice', score: 1000, level: 5 },
//     { name: 'Bob', score: 1000, level: 3 },
//     { name: 'Charlie', score: 800, level: 4 }]
```

## See

compose - for multi-level sorting with more than 2 levels
