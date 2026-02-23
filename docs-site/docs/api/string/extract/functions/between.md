# Function: between()

## Call Signature

> **between**(`start`, `end`, `str`): [`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Defined in: [string/extract/index.ts:132](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/extract/index.ts#L132)

Extracts text between two delimiters.

Returns Some with the extracted text if both delimiters are found,
None otherwise.

### Parameters

#### start

`string`

The starting delimiter

#### end

`string`

The ending delimiter

#### str

`string`

The string to search

### Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Option containing the text between delimiters

### Example

```typescript
// Data-first
between('[', ']', 'Hello [world]!')
// => Some('world')

between('$', '.', 'Price: $99.99')
// => Some('99')

between('[', ']', 'No delimiters')
// => None

between('[', ']', '[first] and [second]')
// => Some('first') (only returns first match)

// Data-last (in pipe)
pipe(
  'User ID: {12345}',
  between('{', '}'),
  unwrapOr('unknown')
)
// => '12345'
```

### See

 - words - to split into words
 - lines - to split into lines

## Call Signature

> **between**(`start`, `end`): (`str`) => [`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

Defined in: [string/extract/index.ts:133](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/extract/index.ts#L133)

Extracts text between two delimiters.

Returns Some with the extracted text if both delimiters are found,
None otherwise.

### Parameters

#### start

`string`

The starting delimiter

#### end

`string`

The ending delimiter

### Returns

Option containing the text between delimiters

> (`str`): [`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

#### Parameters

##### str

`string`

#### Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`string`\>

### Example

```typescript
// Data-first
between('[', ']', 'Hello [world]!')
// => Some('world')

between('$', '.', 'Price: $99.99')
// => Some('99')

between('[', ']', 'No delimiters')
// => None

between('[', ']', '[first] and [second]')
// => Some('first') (only returns first match)

// Data-last (in pipe)
pipe(
  'User ID: {12345}',
  between('{', '}'),
  unwrapOr('unknown')
)
// => '12345'
```

### See

 - words - to split into words
 - lines - to split into lines
