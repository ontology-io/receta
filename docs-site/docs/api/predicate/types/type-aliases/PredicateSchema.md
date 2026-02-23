# Type Alias: PredicateSchema\<T\>

> **PredicateSchema**\<`T`\> = `{ [K in keyof T]?: Predicate<T[K]> }`

Defined in: [predicate/types.ts:71](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/types.ts#L71)

A schema definition for the `where` function.

Maps object keys to predicates that test the corresponding values.

## Type Parameters

### T

`T`

The object type to test

## Example

```typescript
interface User {
  age: number
  name: string
  active: boolean
}

const schema: PredicateSchema<User> = {
  age: (n) => n >= 18,
  name: (s) => s.length > 0,
  active: Boolean
}
```
