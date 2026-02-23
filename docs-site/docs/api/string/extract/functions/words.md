# Function: words()

## Call Signature

> **words**(`str`, `options?`): `string`[]

Defined in: [string/extract/index.ts:42](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/extract/index.ts#L42)

Splits a string into an array of words.

By default, splits on non-alphanumeric characters. Custom pattern can be provided.

### Parameters

#### str

`string`

The string to split

#### options?

[`WordsOptions`](../../types/interfaces/WordsOptions.md)

Options for word splitting

### Returns

`string`[]

Array of words

### Example

```typescript
// Data-first
words('hello world')
// => ['hello', 'world']

words('user-profile-page')
// => ['user', 'profile', 'page']

words('oneTwo three_four')
// => ['oneTwo', 'three', 'four']

words('hello, world!')
// => ['hello', 'world']

// Data-last (in pipe)
pipe(
  'The quick brown fox',
  words,
  R.map(capitalize)
)
// => ['The', 'Quick', 'Brown', 'Fox']
```

### See

 - lines - to split by line breaks
 - between - to extract text between delimiters

## Call Signature

> **words**(`options`): (`str`) => `string`[]

Defined in: [string/extract/index.ts:43](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/extract/index.ts#L43)

Splits a string into an array of words.

By default, splits on non-alphanumeric characters. Custom pattern can be provided.

### Parameters

#### options

[`WordsOptions`](../../types/interfaces/WordsOptions.md)

Options for word splitting

### Returns

Array of words

> (`str`): `string`[]

#### Parameters

##### str

`string`

#### Returns

`string`[]

### Example

```typescript
// Data-first
words('hello world')
// => ['hello', 'world']

words('user-profile-page')
// => ['user', 'profile', 'page']

words('oneTwo three_four')
// => ['oneTwo', 'three', 'four']

words('hello, world!')
// => ['hello', 'world']

// Data-last (in pipe)
pipe(
  'The quick brown fox',
  words,
  R.map(capitalize)
)
// => ['The', 'Quick', 'Brown', 'Fox']
```

### See

 - lines - to split by line breaks
 - between - to extract text between delimiters
