# Function: initials()

## Call Signature

> **initials**(`name`, `options?`): `string`

Defined in: [string/initials/index.ts:74](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/initials/index.ts#L74)

Extracts initials from a name or phrase.

Splits the input by whitespace and takes the first character of each word.
Commonly used for user avatars, labels, and displays.

### Parameters

#### name

`string`

The name or phrase to extract initials from

#### options?

[`InitialsOptions`](../interfaces/InitialsOptions.md)

Initials options

### Returns

`string`

The extracted initials

### Example

```typescript
// Data-first
initials('John Doe')
// => 'JD'

initials('Mary Jane Watson')
// => 'MJW'

initials('Mary Jane Watson', { maxInitials: 2 })
// => 'MJ'

initials('john doe', { uppercase: false })
// => 'jd'

initials('  Multiple   Spaces  ')
// => 'MS'

initials('')
// => ''

initials('Single')
// => 'S'

// Data-last (in pipe)
pipe(
  user.fullName,
  initials({ maxInitials: 2 })
)
// => 'JD'

// Common use case: Avatar labels
const avatarLabel = pipe(
  'Robert Downey Jr.',
  initials({ maxInitials: 2 })
) // => 'RD'
```

### See

 - capitalize - for capitalizing first letter
 - words - for extracting words from text

## Call Signature

> **initials**(`options?`): (`name`) => `string`

Defined in: [string/initials/index.ts:75](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/initials/index.ts#L75)

Extracts initials from a name or phrase.

Splits the input by whitespace and takes the first character of each word.
Commonly used for user avatars, labels, and displays.

### Parameters

#### options?

[`InitialsOptions`](../interfaces/InitialsOptions.md)

Initials options

### Returns

The extracted initials

> (`name`): `string`

#### Parameters

##### name

`string`

#### Returns

`string`

### Example

```typescript
// Data-first
initials('John Doe')
// => 'JD'

initials('Mary Jane Watson')
// => 'MJW'

initials('Mary Jane Watson', { maxInitials: 2 })
// => 'MJ'

initials('john doe', { uppercase: false })
// => 'jd'

initials('  Multiple   Spaces  ')
// => 'MS'

initials('')
// => ''

initials('Single')
// => 'S'

// Data-last (in pipe)
pipe(
  user.fullName,
  initials({ maxInitials: 2 })
)
// => 'JD'

// Common use case: Avatar labels
const avatarLabel = pipe(
  'Robert Downey Jr.',
  initials({ maxInitials: 2 })
) // => 'RD'
```

### See

 - capitalize - for capitalizing first letter
 - words - for extracting words from text
