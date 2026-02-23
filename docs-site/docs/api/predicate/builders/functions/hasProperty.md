# Function: hasProperty()

> **hasProperty**\<`T`, `K`\>(`key`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:239](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/builders/index.ts#L239)

Creates a predicate that tests if an object has a specific property.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

### K

`K` *extends* `string`

## Parameters

### key

`K`

The property key to check for

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if the object has the property

## Example

```typescript
import * as R from 'remeda'
import { hasProperty } from 'receta/predicate'

const objects = [
  { name: 'Alice', age: 25 },
  { name: 'Bob' },
  { name: 'Charlie', age: 30 }
]

R.filter(objects, hasProperty('age'))
// => [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]

// Real-world: Filter objects with optional properties
const users = [
  { id: 1, email: 'alice@example.com' },
  { id: 2 },
  { id: 3, email: 'charlie@example.com' }
]
R.filter(users, hasProperty('email')) // => users with email
```

## See

 - prop - for testing a property value
 - where - for testing multiple properties
