# Function: nullsFirst()

> **nullsFirst**\<`T`\>(`comparator`): [`Comparator`](../../types/type-aliases/Comparator.md)\<[`Nullable`](../../types/type-aliases/Nullable.md)\<`T`\>\>

Defined in: [compare/combinators/index.ts:120](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/combinators/index.ts#L120)

Wraps a comparator to place null/undefined values first.

When comparing two null/undefined values, they are considered equal.
When comparing null/undefined with a non-null value, null comes first.

## Type Parameters

### T

`T`

## Parameters

### comparator

[`Comparator`](../../types/type-aliases/Comparator.md)\<[`Nullable`](../../types/type-aliases/Nullable.md)\<`T`\>\>

The comparator for non-null values

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<[`Nullable`](../../types/type-aliases/Nullable.md)\<`T`\>\>

A comparator that places nulls first

## Example

```typescript
interface User {
  name: string
  lastLogin: Date | null
}

const users = [
  { name: 'Alice', lastLogin: new Date('2024-01-15') },
  { name: 'Bob', lastLogin: null },
  { name: 'Charlie', lastLogin: new Date('2024-01-10') },
  { name: 'Dave', lastLogin: null }
]

// Sort by last login, nulls first
users.sort(nullsFirst(ascending(u => u.lastLogin ?? new Date(0))))
// => [{ name: 'Bob', lastLogin: null },
//     { name: 'Dave', lastLogin: null },
//     { name: 'Charlie', lastLogin: 2024-01-10 },
//     { name: 'Alice', lastLogin: 2024-01-15 }]
```

## See

nullsLast - to place nulls at the end
