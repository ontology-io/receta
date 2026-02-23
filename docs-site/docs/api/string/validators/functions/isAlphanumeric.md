# Function: isAlphanumeric()

> **isAlphanumeric**(`str`): `boolean`

Defined in: [string/validators/index.ts:149](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/validators/index.ts#L149)

Validates if a string contains only alphanumeric characters.

## Parameters

### str

`string`

The string to check

## Returns

`boolean`

True if the string contains only letters and numbers

## Example

```typescript
isAlphanumeric('hello123')
// => true

isAlphanumeric('hello-world')
// => false

isAlphanumeric('123')
// => true
```
