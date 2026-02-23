# Function: localeCompare()

> **localeCompare**\<`T`\>(`fn`, `locale`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/advanced/index.ts:95](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/advanced/index.ts#L95)

Creates a locale-aware string comparator.

Uses the browser/Node.js locale system for culturally appropriate sorting.
Handles accented characters, special characters, and language-specific rules.

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `string`\>

Function to extract the string value

### locale

`string`

BCP 47 language tag (e.g., 'en-US', 'de-DE', 'fr-FR')

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A locale-aware comparator

## Example

```typescript
interface City {
  name: string
  country: string
}

const cities = [
  { name: 'Zürich', country: 'Switzerland' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'München', country: 'Germany' },
  { name: 'Åarhus', country: 'Denmark' }
]

// German locale (handles umlauts correctly)
cities.sort(localeCompare(c => c.name, 'de-DE'))
// => [Åarhus, Berlin, München, Zürich]

// French locale
const names = [
  { name: 'Étienne' },
  { name: 'Eric' },
  { name: 'Émile' }
]
names.sort(localeCompare(n => n.name, 'fr-FR'))
// => [Émile, Eric, Étienne]

// English locale
const words = [
  { word: 'résumé' },
  { word: 'resume' },
  { word: 'result' }
]
words.sort(localeCompare(w => w.word, 'en-US'))
```

## See

 - byString - for more string comparison options
 - caseInsensitive - for simple case-insensitive sorting
