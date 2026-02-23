# Function: capitalize()

> **capitalize**(`str`, `options?`): `string`

Defined in: [string/case/index.ts:142](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/case/index.ts#L142)

Capitalizes the first character of a string.

## Parameters

### str

`string`

The string to capitalize

### options?

[`CaseOptions`](../../types/interfaces/CaseOptions.md)

Case conversion options

## Returns

`string`

The string with first character capitalized

## Example

```typescript
capitalize('hello world')
// => 'Hello world'

capitalize('HELLO')
// => 'HELLO' (only capitalizes first char, doesn't lowercase rest)

capitalize('')
// => ''
```

## See

titleCase - to capitalize all words
