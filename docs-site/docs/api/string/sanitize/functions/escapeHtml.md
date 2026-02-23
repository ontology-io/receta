# Function: escapeHtml()

## Call Signature

> **escapeHtml**(`str`, `options?`): `string`

Defined in: [string/sanitize/index.ts:78](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/sanitize/index.ts#L78)

Escapes HTML special characters.

Converts characters that have special meaning in HTML to their entity equivalents:
- & → &amp;
- < → &lt;
- > → &gt;
- " → &quot;
- ' → &#x27; (if escapeSingleQuote is true)

### Parameters

#### str

`string`

The string to escape

#### options?

[`EscapeHtmlOptions`](../../types/interfaces/EscapeHtmlOptions.md)

Escape options

### Returns

`string`

The escaped string safe for HTML

### Example

```typescript
// Data-first
escapeHtml('<script>alert("XSS")</script>')
// => '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

escapeHtml("It's a test", { escapeSingleQuote: true })
// => 'It&#x27;s a test'

// Data-last (in pipe)
pipe(
  userInput,
  escapeHtml({ escapeSingleQuote: true })
)

// Use in user-generated content
const safeComment = escapeHtml(userComment)
```

### See

 - stripHtml - to remove HTML tags entirely
 - unescapeHtml - to decode HTML entities

## Call Signature

> **escapeHtml**(`options`): (`str`) => `string`

Defined in: [string/sanitize/index.ts:79](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/sanitize/index.ts#L79)

Escapes HTML special characters.

Converts characters that have special meaning in HTML to their entity equivalents:
- & → &amp;
- < → &lt;
- > → &gt;
- " → &quot;
- ' → &#x27; (if escapeSingleQuote is true)

### Parameters

#### options

[`EscapeHtmlOptions`](../../types/interfaces/EscapeHtmlOptions.md)

Escape options

### Returns

The escaped string safe for HTML

> (`str`): `string`

#### Parameters

##### str

`string`

#### Returns

`string`

### Example

```typescript
// Data-first
escapeHtml('<script>alert("XSS")</script>')
// => '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

escapeHtml("It's a test", { escapeSingleQuote: true })
// => 'It&#x27;s a test'

// Data-last (in pipe)
pipe(
  userInput,
  escapeHtml({ escapeSingleQuote: true })
)

// Use in user-generated content
const safeComment = escapeHtml(userComment)
```

### See

 - stripHtml - to remove HTML tags entirely
 - unescapeHtml - to decode HTML entities
