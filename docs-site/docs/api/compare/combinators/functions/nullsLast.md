# Function: nullsLast()

> **nullsLast**\<`T`\>(`comparator`): [`Comparator`](../../types/type-aliases/Comparator.md)\<[`Nullable`](../../types/type-aliases/Nullable.md)\<`T`\>\>

Defined in: [compare/combinators/index.ts:166](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/combinators/index.ts#L166)

Wraps a comparator to place null/undefined values last.

When comparing two null/undefined values, they are considered equal.
When comparing null/undefined with a non-null value, null comes last.

## Type Parameters

### T

`T`

## Parameters

### comparator

[`Comparator`](../../types/type-aliases/Comparator.md)\<[`Nullable`](../../types/type-aliases/Nullable.md)\<`T`\>\>

The comparator for non-null values

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<[`Nullable`](../../types/type-aliases/Nullable.md)\<`T`\>\>

A comparator that places nulls last

## Example

```typescript
interface Product {
  name: string
  discount: number | null
}

const products = [
  { name: 'Keyboard', discount: 10 },
  { name: 'Mouse', discount: null },
  { name: 'Monitor', discount: 20 },
  { name: 'Webcam', discount: null }
]

// Sort by discount descending, nulls last
products.sort(nullsLast(descending(p => p.discount ?? 0)))
// => [{ name: 'Monitor', discount: 20 },
//     { name: 'Keyboard', discount: 10 },
//     { name: 'Mouse', discount: null },
//     { name: 'Webcam', discount: null }]
```

## See

nullsFirst - to place nulls at the beginning
