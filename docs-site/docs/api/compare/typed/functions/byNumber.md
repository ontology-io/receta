# Function: byNumber()

> **byNumber**\<`T`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/typed/index.ts:85](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/typed/index.ts#L85)

Creates a comparator for numeric values.

Handles all numeric types including integers, floats, and special values
(NaN, Infinity). NaN values are treated as equal and sorted to the end.

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `number`\>

Function to extract the numeric value

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator for numbers

## Example

```typescript
interface Metric {
  name: string
  value: number
  change: number
}

const metrics = [
  { name: 'CPU', value: 45.2, change: 1.5 },
  { name: 'Memory', value: 78.9, change: -2.3 },
  { name: 'Disk', value: 23.1, change: 0.8 }
]

// Sort by value (lowest first)
metrics.sort(byNumber(m => m.value))
// => [Disk (23.1), CPU (45.2), Memory (78.9)]

// Sort by change (highest first)
metrics.sort(reverse(byNumber(m => m.change)))
// => [CPU (+1.5), Disk (+0.8), Memory (-2.3)]
```

## See

 - ascending - for generic ascending sort
 - descending - for generic descending sort
