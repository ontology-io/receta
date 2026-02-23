# Function: parseTemplate()

> **parseTemplate**(`templateStr`): `string`[]

Defined in: [string/template/index.ts:91](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/template/index.ts#L91)

Extracts variable names from a template string.

Parses `{{variable}}` placeholders and returns an array of unique variable names.

## Parameters

### templateStr

`string`

The template string to parse

## Returns

`string`[]

Array of variable names found in the template

## Example

```typescript
parseTemplate('Hello {{name}}, you have {{count}} messages')
// => ['name', 'count']

parseTemplate('{{user}} sent {{user}} a message')
// => ['user'] (duplicates removed)

parseTemplate('No variables here')
// => []
```

## See

template - to interpolate variables into a template
