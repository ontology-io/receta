# Function: isInstanceOf()

> **isInstanceOf**\<`T`\>(`constructor`): [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `T`\>

Defined in: [predicate/guards/index.ts:397](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L397)

Creates a type guard that checks if a value is an instance of a class.

## Type Parameters

### T

`T`

## Parameters

### constructor

(...`args`) => `T`

The class constructor to check against

## Returns

[`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `T`\>

A type guard that returns true if value is an instance of the class

## Example

```typescript
import * as R from 'remeda'
import { isInstanceOf } from 'receta/predicate'

class User {
  constructor(public name: string) {}
}

const values: unknown[] = [
  new User('Alice'),
  { name: 'Bob' },
  new User('Charlie')
]
const users = R.filter(values, isInstanceOf(User)) // type: User[]
// => [User('Alice'), User('Charlie')]
```
