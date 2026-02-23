# Function: stripHtml()

> **stripHtml**(`str`): `string`

Defined in: [string/sanitize/index.ts:34](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/sanitize/index.ts#L34)

Removes all HTML tags from a string.

Strips all HTML tags, leaving only the text content. Does not decode
HTML entities - use unescapeHtml for that.

## Parameters

### str

`string`

The string containing HTML

## Returns

`string`

The string with all HTML tags removed

## Example

```typescript
stripHtml('<p>Hello <strong>world</strong>!</p>')
// => 'Hello world!'

stripHtml('<script>alert("xss")</script>Safe text')
// => 'Safe text'

stripHtml('No tags here')
// => 'No tags here'

// Use for user-generated content
pipe(
  userComment,
  stripHtml,
  truncate({ length: 100 })
)
```

## See

escapeHtml - to escape HTML special characters
