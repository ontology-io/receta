# Function: pluralize()

## Call Signature

> **pluralize**(`word`, `count`, `options?`): `string`

Defined in: [string/pluralize/index.ts:72](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/pluralize/index.ts#L72)

Pluralizes a word based on count, with smart English pluralization rules.

By default, applies standard English pluralization:
- Words ending in 's', 'ss', 'sh', 'ch', 'x', 'z' → add 'es'
- Words ending in consonant + 'y' → replace 'y' with 'ies'
- Words ending in 'f' or 'fe' → replace with 'ves'
- All others → add 's'

For irregular plurals, provide a custom plural form via options.

### Parameters

#### word

`string`

The singular word to pluralize

#### count

`number`

The count to determine singular vs plural

#### options?

[`PluralizeOptions`](../interfaces/PluralizeOptions.md)

Pluralization options

### Returns

`string`

The pluralized string with count (e.g., "5 items") or just the word if wordOnly is true

### Example

```typescript
// Data-first
pluralize('item', 1)
// => '1 item'

pluralize('item', 5)
// => '5 items'

pluralize('box', 3)
// => '3 boxes'

pluralize('story', 2)
// => '2 stories'

pluralize('knife', 4)
// => '4 knives'

// Custom plural
pluralize('person', 3, { plural: 'people' })
// => '3 people'

// Word only
pluralize('category', 2, { wordOnly: true })
// => 'categories'

// Data-last (in pipe)
pipe(
  users.length,
  (count) => pluralize('user', count)
)
// => '42 users'
```

### See

toOrdinal - for ordinal numbers (1st, 2nd, 3rd)

## Call Signature

> **pluralize**(`count`, `options?`): (`word`) => `string`

Defined in: [string/pluralize/index.ts:73](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/pluralize/index.ts#L73)

Pluralizes a word based on count, with smart English pluralization rules.

By default, applies standard English pluralization:
- Words ending in 's', 'ss', 'sh', 'ch', 'x', 'z' → add 'es'
- Words ending in consonant + 'y' → replace 'y' with 'ies'
- Words ending in 'f' or 'fe' → replace with 'ves'
- All others → add 's'

For irregular plurals, provide a custom plural form via options.

### Parameters

#### count

`number`

The count to determine singular vs plural

#### options?

[`PluralizeOptions`](../interfaces/PluralizeOptions.md)

Pluralization options

### Returns

The pluralized string with count (e.g., "5 items") or just the word if wordOnly is true

> (`word`): `string`

#### Parameters

##### word

`string`

#### Returns

`string`

### Example

```typescript
// Data-first
pluralize('item', 1)
// => '1 item'

pluralize('item', 5)
// => '5 items'

pluralize('box', 3)
// => '3 boxes'

pluralize('story', 2)
// => '2 stories'

pluralize('knife', 4)
// => '4 knives'

// Custom plural
pluralize('person', 3, { plural: 'people' })
// => '3 people'

// Word only
pluralize('category', 2, { wordOnly: true })
// => 'categories'

// Data-last (in pipe)
pipe(
  users.length,
  (count) => pluralize('user', count)
)
// => '42 users'
```

### See

toOrdinal - for ordinal numbers (1st, 2nd, 3rd)
