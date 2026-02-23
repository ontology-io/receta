# Function: where()

> **where**\<`T`\>(`schema`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:61](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/builders/index.ts#L61)

Creates a predicate that tests object properties against a schema.

Each key in the schema maps to a predicate that tests the corresponding property.
All predicates must pass for the overall predicate to return true.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### schema

[`PredicateSchema`](../../types/type-aliases/PredicateSchema.md)\<`T`\>

A map of property names to predicates

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that tests if all schema predicates pass

## Example

```typescript
import * as R from 'remeda'
import { where, gt, eq } from 'receta/predicate'

interface User {
  age: number
  name: string
  active: boolean
}

const users: User[] = [
  { age: 25, name: 'Alice', active: true },
  { age: 17, name: 'Bob', active: true },
  { age: 30, name: 'Charlie', active: false }
]

// Filter with multiple conditions
R.filter(users, where({
  age: gt(18),
  active: Boolean  // shorthand for (v) => v === true
}))
// => [{ age: 25, name: 'Alice', active: true }]

// Real-world: Database-like queries
const products = [
  { price: 10, category: 'electronics', inStock: true },
  { price: 50, category: 'electronics', inStock: false },
  { price: 15, category: 'books', inStock: true }
]
R.filter(products, where({
  category: eq('electronics'),
  inStock: Boolean,
  price: (p) => p < 30
}))
// => [{ price: 10, category: 'electronics', inStock: true }]
```

## See

 - oneOf - for checking if value is in a list
 - prop - for testing a single property
