# Function: truncate()

## Call Signature

> **truncate**(`str`, `options`): `string`

Defined in: [string/truncate/index.ts:39](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/truncate/index.ts#L39)

Truncates a string to a maximum length.

If the string exceeds the maximum length, it's truncated and an ellipsis
is appended. Can optionally truncate at word boundaries to avoid cutting words.

### Parameters

#### str

`string`

The string to truncate

#### options

[`TruncateOptions`](../../types/interfaces/TruncateOptions.md)

Truncation options

### Returns

`string`

The truncated string

### Example

```typescript
// Data-first
truncate('Hello world', { length: 8 })
// => 'Hello...'

truncate('Hello world', { length: 8, ellipsis: '…' })
// => 'Hello…'

truncate('The quick brown fox', { length: 15, words: true })
// => 'The quick...'

truncate('Short', { length: 10 })
// => 'Short' (unchanged if under limit)

// Data-last (in pipe)
pipe(
  'A very long string that needs truncation',
  truncate({ length: 20, words: true })
)
// => 'A very long string...'
```

### See

words - to split a string into words

## Call Signature

> **truncate**(`options`): (`str`) => `string`

Defined in: [string/truncate/index.ts:40](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/truncate/index.ts#L40)

Truncates a string to a maximum length.

If the string exceeds the maximum length, it's truncated and an ellipsis
is appended. Can optionally truncate at word boundaries to avoid cutting words.

### Parameters

#### options

[`TruncateOptions`](../../types/interfaces/TruncateOptions.md)

Truncation options

### Returns

The truncated string

> (`str`): `string`

#### Parameters

##### str

`string`

#### Returns

`string`

### Example

```typescript
// Data-first
truncate('Hello world', { length: 8 })
// => 'Hello...'

truncate('Hello world', { length: 8, ellipsis: '…' })
// => 'Hello…'

truncate('The quick brown fox', { length: 15, words: true })
// => 'The quick...'

truncate('Short', { length: 10 })
// => 'Short' (unchanged if under limit)

// Data-last (in pipe)
pipe(
  'A very long string that needs truncation',
  truncate({ length: 20, words: true })
)
// => 'A very long string...'
```

### See

words - to split a string into words
