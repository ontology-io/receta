# Function: escapeRegex()

> **escapeRegex**(`str`): `string`

Defined in: [string/escapeRegex/index.ts:38](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/escapeRegex/index.ts#L38)

Escapes special regex characters in a string to make it safe for use in RegExp.

Escapes all regex metacharacters: . * + ? ^ $ { } ( ) | [ ] \

This is useful when you need to use user input or arbitrary strings as literal
patterns in regular expressions, preventing unintended regex behavior.

## Parameters

### str

`string`

The string to escape

## Returns

`string`

The escaped string safe for RegExp

## Example

```typescript
escapeRegex('Hello.')
// => 'Hello\\.'

escapeRegex('$100 (USD)')
// => '\\$100 \\(USD\\)'

escapeRegex('[a-z]+')
// => '\\[a-z\\]\\+'

// Using in regex pattern
const userInput = 'example.com'
const pattern = new RegExp(escapeRegex(userInput))
pattern.test('example.com') // => true
pattern.test('exampleXcom') // => false (. is literal, not wildcard)

// Search and replace with user input
const searchTerm = '$100'
const text = 'Price is $100 today'
const regex = new RegExp(escapeRegex(searchTerm), 'g')
text.replace(regex, '$200') // => 'Price is $200 today'
```

## See

highlight - for highlighting matched text in strings
