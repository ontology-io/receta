# Function: trimStart()

> **trimStart**(`str`): `string`

Defined in: [string/sanitize/index.ts:190](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/sanitize/index.ts#L190)

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
