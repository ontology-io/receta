# Function: includes()

> **includes**(`substring`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

Defined in: [predicate/comparison/index.ts:258](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L258)

Creates a predicate that tests if a string contains a substring.

Case-sensitive.

## Parameters

### substring

`string`

The substring to search for

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

A predicate that returns true if value contains substring

## Example

```typescript
import * as R from 'remeda'

const emails = ['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com']
R.filter(emails, includes('@gmail.com')) // => Gmail emails

// Real-world: Search functionality
const users = [
  { name: 'Alice Smith' },
  { name: 'Bob Johnson' },
  { name: 'Alice Brown' }
]
const searchTerm = 'Smith'
R.filter(users, (u) => includes(searchTerm)(u.name))
// => [{ name: 'Alice Smith' }]
```

## See

 - startsWith - for prefix testing
 - endsWith - for suffix testing
