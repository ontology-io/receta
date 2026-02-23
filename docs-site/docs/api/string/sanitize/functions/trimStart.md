# Function: trimStart()

> **trimStart**(`str`): `string`

Defined in: [string/sanitize/index.ts:190](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/sanitize/index.ts#L190)

Trims whitespace from the start of a string.

## Parameters

### str

`string`

The string to trim

## Returns

`string`

The string with leading whitespace removed

## Example

```typescript
trimStart('  hello  ')
// => 'hello  '

trimStart('\n\t  test')
// => 'test'
```

## See

 - trim - trim both ends
 - trimEnd - trim trailing whitespace
