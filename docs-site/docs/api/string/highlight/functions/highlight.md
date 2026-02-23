# Function: highlight()

## Call Signature

> **highlight**(`text`, `query`, `options?`): `string`

Defined in: [string/highlight/index.ts:95](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L95)

Highlights matching substrings by wrapping them in HTML tags.

Searches for the query string within the text and wraps all matches in HTML tags
(default: `<mark>`). Useful for search results, autocomplete, and text highlighting.

By default, escapes HTML to prevent XSS attacks. Set `escapeHtml: false` if the
input is already trusted/sanitized.

### Parameters

#### text

`string`

The text to search within

#### query

`string`

The substring to highlight

#### options?

[`HighlightOptions`](../interfaces/HighlightOptions.md)

Highlighting options

### Returns

`string`

The text with matches wrapped in HTML tags

### Example

```typescript
// Data-first
highlight('Hello world', 'world')
// => 'Hello <mark>world</mark>'

highlight('JavaScript and TypeScript', 'script')
// => 'Java<mark>Script</mark> and Type<mark>Script</mark>'

// Case-insensitive (default)
highlight('Hello WORLD', 'world')
// => 'Hello <mark>WORLD</mark>'

// Custom tag and class
highlight('Search term here', 'term', {
  tag: 'span',
  className: 'highlight'
})
// => 'Search <span class="highlight">term</span> here'

// Case-sensitive
highlight('Hello World', 'world', { caseInsensitive: false })
// => 'Hello World' (no match due to case)

// Empty query returns original text
highlight('Hello world', '')
// => 'Hello world'

// HTML escaping (default, prevents XSS)
highlight('<script>alert("xss")</script>', 'script')
// => '&lt;<mark>script</mark>&gt;alert(&quot;xss&quot;)&lt;/<mark>script</mark>&gt;'

// Data-last (in pipe)
pipe(
  searchResults.map(r => r.title),
  R.map(highlight(searchQuery, { className: 'search-highlight' }))
)
```

### See

 - escapeRegex - for escaping regex special characters
 - escapeHtml - for HTML escaping

## Call Signature

> **highlight**(`query`, `options?`): (`text`) => `string`

Defined in: [string/highlight/index.ts:96](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L96)

Highlights matching substrings by wrapping them in HTML tags.

Searches for the query string within the text and wraps all matches in HTML tags
(default: `<mark>`). Useful for search results, autocomplete, and text highlighting.

By default, escapes HTML to prevent XSS attacks. Set `escapeHtml: false` if the
input is already trusted/sanitized.

### Parameters

#### query

`string`

The substring to highlight

#### options?

[`HighlightOptions`](../interfaces/HighlightOptions.md)

Highlighting options

### Returns

The text with matches wrapped in HTML tags

> (`text`): `string`

#### Parameters

##### text

`string`

#### Returns

`string`

### Example

```typescript
// Data-first
highlight('Hello world', 'world')
// => 'Hello <mark>world</mark>'

highlight('JavaScript and TypeScript', 'script')
// => 'Java<mark>Script</mark> and Type<mark>Script</mark>'

// Case-insensitive (default)
highlight('Hello WORLD', 'world')
// => 'Hello <mark>WORLD</mark>'

// Custom tag and class
highlight('Search term here', 'term', {
  tag: 'span',
  className: 'highlight'
})
// => 'Search <span class="highlight">term</span> here'

// Case-sensitive
highlight('Hello World', 'world', { caseInsensitive: false })
// => 'Hello World' (no match due to case)

// Empty query returns original text
highlight('Hello world', '')
// => 'Hello world'

// HTML escaping (default, prevents XSS)
highlight('<script>alert("xss")</script>', 'script')
// => '&lt;<mark>script</mark>&gt;alert(&quot;xss&quot;)&lt;/<mark>script</mark>&gt;'

// Data-last (in pipe)
pipe(
  searchResults.map(r => r.title),
  R.map(highlight(searchQuery, { className: 'search-highlight' }))
)
```

### See

 - escapeRegex - for escaping regex special characters
 - escapeHtml - for HTML escaping
