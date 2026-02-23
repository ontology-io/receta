# Function: trim()

> **trim**(`str`): `string`

Defined in: [string/sanitize/index.ts:168](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/sanitize/index.ts#L168)

Trims whitespace from both ends of a string.

Enhanced version of String.prototype.trim that's pipe-friendly.

## Parameters

### str

`string`

The string to trim

## Returns

`string`

The trimmed string

## Example

```typescript
trim('  hello  ')
// => 'hello'

trim('\n\t  test  \n')
// => 'test'

// Use in pipes
pipe(
  userInput,
  trim,
  truncate({ length: 50 })
)
```

## See

 - trimStart - trim only leading whitespace
 - trimEnd - trim only trailing whitespace
