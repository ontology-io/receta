# Function: natural()

> **natural**\<`T`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/basic/index.ts:142](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/basic/index.ts#L142)

Creates a comparator for natural string sorting.

Natural sorting handles numbers within strings intelligently:
- "file2.txt" comes before "file10.txt" (not after as with lexicographic sort)
- Properly handles mixed alphanumeric strings

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `string`\>

Function to extract the string value

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator function for natural string sorting

## Example

```typescript
const files = ['file10.txt', 'file2.txt', 'file1.txt', 'file20.txt']

// Lexicographic sort (incorrect for numbers)
files.sort() // => ['file1.txt', 'file10.txt', 'file2.txt', 'file20.txt']

// Natural sort (correct for numbers)
files.sort(natural(x => x))
// => ['file1.txt', 'file2.txt', 'file10.txt', 'file20.txt']

// With objects
interface File {
  name: string
  size: number
}

const fileObjects = [
  { name: 'image10.png', size: 1024 },
  { name: 'image2.png', size: 2048 },
  { name: 'image1.png', size: 512 }
]

fileObjects.sort(natural(f => f.name))
// => [{ name: 'image1.png', ... }, { name: 'image2.png', ... }, { name: 'image10.png', ... }]
```

## See

 - ascending - for standard ascending sort
 - caseInsensitive - for case-insensitive comparison
