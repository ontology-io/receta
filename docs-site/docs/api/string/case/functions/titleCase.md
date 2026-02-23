# Function: titleCase()

> **titleCase**(`str`, `options?`): `string`

Defined in: [string/case/index.ts:171](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/case/index.ts#L171)

Converts a string to Title Case.

Capitalizes the first letter of each word. Words are separated by spaces.

## Parameters

### str

`string`

The string to convert

### options?

[`CaseOptions`](../../types/interfaces/CaseOptions.md)

Case conversion options

## Returns

`string`

The string in Title Case

## Example

```typescript
titleCase('hello world')
// => 'Hello World'

titleCase('the quick brown fox')
// => 'The Quick Brown Fox'

titleCase('user-profile-page')
// => 'User-profile-page' (only capitalizes after spaces)
```

## See

capitalize - to capitalize only the first character
