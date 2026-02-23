# Function: isHexColor()

> **isHexColor**(`str`): [`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Defined in: [string/validators/index.ts:198](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/validators/index.ts#L198)

Validates if a string is a valid hexadecimal color.

Supports 3, 6, and 8 character hex colors with optional # prefix.

## Parameters

### str

`string`

The string to validate

## Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Option containing the hex color if valid

## Example

```typescript
isHexColor('#ff0000')
// => Some('#ff0000')

isHexColor('fff')
// => Some('fff')

isHexColor('#ff00ff80')
// => Some('#ff00ff80') (with alpha)

isHexColor('not-a-color')
// => None
```
