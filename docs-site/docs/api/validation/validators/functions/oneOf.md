# Function: oneOf()

> **oneOf**\<`T`\>(`allowed`, `errorMessage?`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `string`\>

Defined in: [validation/validators/index.ts:397](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/validators/index.ts#L397)

Validates value is one of the allowed values.

## Type Parameters

### T

`T`

## Parameters

### allowed

readonly `T`[]

Array of allowed values

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `string`\>

Validator that checks value is in allowed list

## Example

```typescript
oneOf(['admin', 'user', 'guest'])('admin') // => Valid('admin')
oneOf(['admin', 'user', 'guest'])('superadmin') // => Invalid(['Must be one of: admin, user, guest'])

// With custom error
oneOf([1, 2, 3], 'Invalid option')(2) // => Valid(2)
oneOf([1, 2, 3], 'Invalid option')(4) // => Invalid(['Invalid option'])
```
