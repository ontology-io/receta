# Function: byString()

> **byString**\<`T`\>(`fn`, `options?`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/typed/index.ts:142](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/typed/index.ts#L142)

Creates a comparator for string values with optional configuration.

Supports case-sensitive/insensitive comparison and locale-aware sorting.

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `string`\>

Function to extract the string value

### options?

[`StringCompareOptions`](../../types/interfaces/StringCompareOptions.md) = `{}`

String comparison options

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator for strings

## Example

```typescript
interface User {
  firstName: string
  lastName: string
  email: string
}

const users = [
  { firstName: 'alice', lastName: 'Smith', email: 'alice@example.com' },
  { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' },
  { firstName: 'Charlie', lastName: 'Adams', email: 'charlie@example.com' }
]

// Case-sensitive sort (default)
users.sort(byString(u => u.firstName))
// => [Bob, Charlie, alice] (uppercase comes first)

// Case-insensitive sort
users.sort(byString(u => u.firstName, { caseSensitive: false }))
// => [alice, Bob, Charlie]

// Locale-aware sort
const germanNames = [
  { name: 'Müller' },
  { name: 'Mueller' },
  { name: 'Möller' }
]
germanNames.sort(byString(n => n.name, { locale: 'de-DE' }))
```

## See

 - caseInsensitive - convenience function for case-insensitive sorting
 - localeCompare - convenience function for locale-aware sorting
