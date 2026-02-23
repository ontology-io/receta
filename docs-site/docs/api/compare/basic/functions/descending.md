# Function: descending()

> **descending**\<`T`, `C`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/basic/index.ts:86](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/basic/index.ts#L86)

Creates a comparator that sorts in descending order based on an extracted value.

Works with numbers, strings, dates, and any comparable values.

## Type Parameters

### T

`T`

### C

`C` *extends* `string` \| `number` \| `Date`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `C`\>

Function to extract the comparable value

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator function for descending order

## Example

```typescript
interface Transaction {
  amount: number
  date: Date
}

const transactions = [
  { amount: 100, date: new Date('2024-01-01') },
  { amount: 500, date: new Date('2024-01-03') },
  { amount: 200, date: new Date('2024-01-02') }
]

// Sort by amount descending (highest first)
transactions.sort(descending(t => t.amount))
// => [{ amount: 500, ... }, { amount: 200, ... }, { amount: 100, ... }]

// Sort by date descending (most recent first)
transactions.sort(descending(t => t.date))
// => [2024-01-03, 2024-01-02, 2024-01-01]
```

## See

 - ascending - for ascending order
 - byKey - for sorting by object key directly
