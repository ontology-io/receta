# Function: reverse()

> **reverse**\<`T`\>(`comparator`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/combinators/index.ts:83](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/combinators/index.ts#L83)

Reverses the order of a comparator.

Useful for inverting existing comparators without rewriting logic.

## Type Parameters

### T

`T`

## Parameters

### comparator

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

The comparator to reverse

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A reversed comparator

## Example

```typescript
const users = [
  { name: 'Alice', score: 100 },
  { name: 'Bob', score: 200 },
  { name: 'Charlie', score: 150 }
]

// Sort by score ascending
const scoreAsc = ascending(u => u.score)
users.sort(scoreAsc) // => [100, 200, 150] -> [100, 150, 200]

// Reverse it for descending
users.sort(reverse(scoreAsc)) // => [200, 150, 100]

// Equivalent to:
users.sort(descending(u => u.score))
```

## See

 - ascending - consider using descending instead
 - descending - consider using ascending instead
