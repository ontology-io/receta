# Function: truncateWords()

## Call Signature

> **truncateWords**(`str`, `maxWords`, `options?`): `string`

Defined in: [string/truncateWords/index.ts:52](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/truncateWords/index.ts#L52)

Truncates a string to a maximum number of words.

Unlike character-based truncation, this preserves complete words and truncates
at word boundaries. Words are determined by whitespace.

### Parameters

#### str

`string`

The string to truncate

#### maxWords

`number`

Maximum number of words to keep

#### options?

[`TruncateWordsOptions`](../interfaces/TruncateWordsOptions.md)

Truncation options

### Returns

`string`

The truncated string

### Example

```typescript
// Data-first
truncateWords('The quick brown fox jumps', 3)
// => 'The quick brown...'

truncateWords('Hello world', 5)
// => 'Hello world' (unchanged if under limit)

truncateWords('One two three four', 2, { suffix: ' […]' })
// => 'One two […]'

truncateWords('Single', 3)
// => 'Single' (no suffix if not truncated)

// Data-last (in pipe)
pipe(
  'A long article preview with many words in it',
  truncateWords(5)
)
// => 'A long article preview with...'
```

### See

 - truncate - for character-based truncation
 - words - to split a string into words

## Call Signature

> **truncateWords**(`maxWords`, `options?`): (`str`) => `string`

Defined in: [string/truncateWords/index.ts:57](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/truncateWords/index.ts#L57)

Truncates a string to a maximum number of words.

Unlike character-based truncation, this preserves complete words and truncates
at word boundaries. Words are determined by whitespace.

### Parameters

#### maxWords

`number`

Maximum number of words to keep

#### options?

[`TruncateWordsOptions`](../interfaces/TruncateWordsOptions.md)

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
truncateWords('The quick brown fox jumps', 3)
// => 'The quick brown...'

truncateWords('Hello world', 5)
// => 'Hello world' (unchanged if under limit)

truncateWords('One two three four', 2, { suffix: ' […]' })
// => 'One two […]'

truncateWords('Single', 3)
// => 'Single' (no suffix if not truncated)

// Data-last (in pipe)
pipe(
  'A long article preview with many words in it',
  truncateWords(5)
)
// => 'A long article preview with...'
```

### See

 - truncate - for character-based truncation
 - words - to split a string into words
