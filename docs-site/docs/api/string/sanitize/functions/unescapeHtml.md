# Function: unescapeHtml()

> **unescapeHtml**(`str`): `string`

Defined in: [string/sanitize/index.ts:128](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/sanitize/index.ts#L128)

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
