# Function: extract()

## Call Signature

> **extract**(`str`, `pattern`): `string`[]

Defined in: [string/extract/index.ts:187](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/extract/index.ts#L187)

Extracts all matches of a pattern from a string.

Returns an array of all matched strings.

### Parameters

#### str

`string`

The string to search

#### pattern

`RegExp`

The regex pattern to match (must have 'g' flag)

### Returns

`string`[]

Array of matched strings

### Example

```typescript
// Data-first
extract('Price: $10, Discount: $5', /\$(\d+)/g)
// => ['$10', '$5']

extract('user@example.com and admin@test.org', /\S+@\S+/g)
// => ['user@example.com', 'admin@test.org']

extract('No matches here', /\d+/g)
// => []

// Data-last (in pipe)
pipe(
  logText,
  extract(/\d{4}-\d{2}-\d{2}/g), // Extract dates
  R.unique
)
```

### See

between - to extract text between delimiters

## Call Signature

> **extract**(`pattern`): (`str`) => `string`[]

Defined in: [string/extract/index.ts:188](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/extract/index.ts#L188)

Extracts all matches of a pattern from a string.

Returns an array of all matched strings.

### Parameters

#### pattern

`RegExp`

The regex pattern to match (must have 'g' flag)

### Returns

Array of matched strings

> (`str`): `string`[]

#### Parameters

##### str

`string`

#### Returns

`string`[]

### Example

```typescript
// Data-first
extract('Price: $10, Discount: $5', /\$(\d+)/g)
// => ['$10', '$5']

extract('user@example.com and admin@test.org', /\S+@\S+/g)
// => ['user@example.com', 'admin@test.org']

extract('No matches here', /\d+/g)
// => []

// Data-last (in pipe)
pipe(
  logText,
  extract(/\d{4}-\d{2}-\d{2}/g), // Extract dates
  R.unique
)
```

### See

between - to extract text between delimiters
