# Type Alias: PredicateSchema\<T\>

> **PredicateSchema**\<`T`\> = `{ [K in keyof T]?: Predicate<T[K]> }`

Defined in: [predicate/types.ts:71](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/types.ts#L71)

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
