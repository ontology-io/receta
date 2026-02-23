# Function: url()

> **url**(`errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Defined in: [validation/validators/index.ts:148](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/validators/index.ts#L148)

Validates URL format.

## Parameters

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`string`, `string`, `string`\>

Validator that checks URL format

## Example

```typescript
url()('https://example.com') // => Valid('https://example.com')
url()('not-a-url') // => Invalid(['Invalid URL'])
```
