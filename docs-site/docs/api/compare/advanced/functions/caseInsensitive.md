# Function: caseInsensitive()

> **caseInsensitive**\<`T`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/advanced/index.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/advanced/index.ts#L37)

Creates a case-insensitive string comparator.

Convenience wrapper for `byString` with `caseSensitive: false`.

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `string`\>

Function to extract the string value

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A case-insensitive comparator

## Example

```typescript
interface File {
  name: string
  extension: string
}

const files = [
  { name: 'README.md', extension: 'md' },
  { name: 'index.ts', extension: 'ts' },
  { name: 'App.tsx', extension: 'tsx' },
  { name: 'package.json', extension: 'json' }
]

// Case-sensitive (default) - uppercase comes first
files.sort(byString(f => f.name))
// => [App.tsx, README.md, index.ts, package.json]

// Case-insensitive - alphabetical regardless of case
files.sort(caseInsensitive(f => f.name))
// => [App.tsx, index.ts, package.json, README.md]
```

## See

 - byString - for more string comparison options
 - natural - for natural string sorting (handles numbers)
