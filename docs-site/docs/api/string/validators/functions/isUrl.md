# Function: isUrl()

> **isUrl**(`str`): [`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Defined in: [string/validators/index.ts:118](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/validators/index.ts#L118)

Validates if a string is a valid URL.

Returns Some with the URL if valid, None otherwise.
Supports http, https, and protocol-relative URLs.

## Parameters

### str

`string`

The string to validate

## Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Option containing the URL if valid

## Example

```typescript
isUrl('https://example.com')
// => Some('https://example.com')

isUrl('not a url')
// => None

isUrl('http://localhost:3000/path')
// => Some('http://localhost:3000/path')

// Use in validation
const website = pipe(
  formData.website,
  isUrl,
  match({
    onSome: (url) => url,
    onNone: () => 'Invalid URL'
  })
)
```

## See

isEmail - for email validation
