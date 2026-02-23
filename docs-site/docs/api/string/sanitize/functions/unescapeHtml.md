# Function: unescapeHtml()

> **unescapeHtml**(`str`): `string`

Defined in: [string/sanitize/index.ts:128](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/sanitize/index.ts#L128)

Decodes HTML entities to their character equivalents.

## Parameters

### str

`string`

The string containing HTML entities

## Returns

`string`

The decoded string

## Example

```typescript
unescapeHtml('&lt;script&gt;')
// => '<script>'

unescapeHtml('&quot;Hello&quot;')
// => '"Hello"'

unescapeHtml('&amp; &lt; &gt;')
// => '& < >'
```

## See

escapeHtml - to encode special characters
