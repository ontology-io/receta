# Function: prop()

> **prop**\<`T`, `K`\>(`key`, `predicate`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:154](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/builders/index.ts#L154)

Creates a predicate that tests a specific property of an object.

## Type Parameters

### T

`T`

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### key

`K`

The property key to test

### predicate

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\[`K`\]\>

The predicate to apply to the property value

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that tests the specified property

## Example

```typescript
import * as R from 'remeda'
import { prop, gt, oneOf } from 'receta/predicate'

const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 30 }
]

// Test single property
R.filter(users, prop('age', gt(18))) // => Alice and Charlie

// Combine with other predicates
R.filter(users, prop('name', oneOf(['Alice', 'Bob'])))
// => Alice and Bob

// Real-world: Nested property access
const orders = [
  { id: 1, user: { country: 'US' } },
  { id: 2, user: { country: 'UK' } },
  { id: 3, user: { country: 'US' } }
]
// Using pipe for nested access
R.filter(orders, (o) => prop('country', eq('US'))(o.user))
// => US orders
```

## See

 - where - for testing multiple properties
 - oneOf - for checking against multiple values
