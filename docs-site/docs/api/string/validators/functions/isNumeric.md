# Function: isNumeric()

> **isNumeric**(`str`): `boolean`

Defined in: [string/validators/index.ts:171](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/validators/index.ts#L171)

Validates if a string contains only numeric characters.

## Parameters

### str

`string`

The string to check

## Returns

`boolean`

True if the string contains only digits

## Example

```typescript
isNumeric('12345')
// => true

isNumeric('123.45')
// => false

isNumeric('12a34')
// => false
```
