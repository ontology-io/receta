# Function: trimEnd()

> **trimEnd**(`str`): `string`

Defined in: [string/sanitize/index.ts:212](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/sanitize/index.ts#L212)

Trims whitespace from the end of a string.

## Parameters

### str

`string`

The string to trim

## Returns

`string`

The string with trailing whitespace removed

## Example

```typescript
trimEnd('  hello  ')
// => '  hello'

trimEnd('test\n\t  ')
// => 'test'
```

## See

 - trim - trim both ends
 - trimStart - trim leading whitespace
