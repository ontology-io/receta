# Function: lines()

> **lines**(`str`): `string`[]

Defined in: [string/extract/index.ts:90](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/extract/index.ts#L90)

Splits a string into an array of lines.

Handles different line ending styles (\n, \r\n, \r).

## Parameters

### str

`string`

The string to split

## Returns

`string`[]

Array of lines

## Example

```typescript
lines('hello\nworld')
// => ['hello', 'world']

lines('line1\r\nline2\r\nline3')
// => ['line1', 'line2', 'line3']

lines('single line')
// => ['single line']

// Use with pipe
pipe(
  multilineText,
  lines,
  R.filter(line => !isEmpty(line)),
  R.map(trim)
)
```

## See

words - to split by words
