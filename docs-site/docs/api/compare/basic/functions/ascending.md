# Function: ascending()

> **ascending**\<`T`, `C`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/basic/index.ts:37](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/basic/index.ts#L37)

Creates a comparator that sorts in ascending order based on an extracted value.

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

A comparator function for ascending order

## Example

```typescript
interface User {
  name: string
  age: number
}

const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
]

// Sort by age ascending
users.sort(ascending(u => u.age))
// => [{ name: 'Bob', age: 25 }, { name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }]

// Sort by name ascending
users.sort(ascending(u => u.name))
// => [{ name: 'Alice', ... }, { name: 'Bob', ... }, { name: 'Charlie', ... }]
```

## See

 - descending - for descending order
 - byKey - for sorting by object key directly
