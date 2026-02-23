# Function: isEmail()

> **isEmail**(`str`): [`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Defined in: [string/validators/index.ts:74](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/validators/index.ts#L74)

Validates if a string is a valid email address.

Returns Some with the email if valid, None otherwise.
Uses a practical regex that covers most common email formats.

## Parameters

### str

`string`

The string to validate

## Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Option containing the email if valid

## Example

```typescript
isEmail('user@example.com')
// => Some('user@example.com')

isEmail('invalid.email')
// => None

isEmail('user+tag@domain.co.uk')
// => Some('user+tag@domain.co.uk')

// Use in forms
const email = pipe(
  formData.email,
  isEmail,
  unwrapOr('Invalid email')
)
```

## See

isUrl - for URL validation
