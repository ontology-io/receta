# Function: isNumeric()

> **isNumeric**(`str`): `boolean`

Defined in: [string/validators/index.ts:171](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/validators/index.ts#L171)

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
