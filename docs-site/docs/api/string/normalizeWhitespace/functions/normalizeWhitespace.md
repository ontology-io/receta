# Function: normalizeWhitespace()

> **normalizeWhitespace**(`str`): `string`

Defined in: [string/normalizeWhitespace/index.ts:49](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/normalizeWhitespace/index.ts#L49)

Normalizes whitespace in a string by replacing multiple consecutive whitespace
characters with a single space and trimming leading/trailing whitespace.

This includes:
- Multiple spaces → single space
- Tabs → single space
- Newlines → single space
- Mixed whitespace → single space
- Leading/trailing whitespace → removed

Useful for cleaning up user input, normalizing text for search/comparison,
and formatting data from external sources.

## Parameters

### str

`string`

The string to normalize

## Returns

`string`

The normalized string with single spaces between words

## Example

```typescript
normalizeWhitespace('Hello    world')
// => 'Hello world'

normalizeWhitespace('  foo\t\tbar  ')
// => 'foo bar'

normalizeWhitespace('line1\n\nline2\n\n\nline3')
// => 'line1 line2 line3'

normalizeWhitespace('mixed   \t\n  whitespace')
// => 'mixed whitespace'

normalizeWhitespace('')
// => ''

// Useful for search normalization
const searchQuery = normalizeWhitespace(userInput)

// Or data cleanup
const cleanedData = pipe(
  rawText,
  normalizeWhitespace,
  trim
)
```

## See

 - trim - for removing leading/trailing whitespace only
 - stripHtml - for removing HTML tags and normalizing text
