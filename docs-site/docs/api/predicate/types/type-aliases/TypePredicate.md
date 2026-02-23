# Type Alias: TypePredicate()\<T, U\>

> **TypePredicate**\<`T`, `U`\> = (`value`) => `value is U`

Defined in: [predicate/types.ts:47](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/types.ts#L47)

A function that takes a value and returns a type predicate.

Type predicates enable TypeScript to narrow types in control flow.

## Type Parameters

### T

`T`

The input type

### U

`U` *extends* `T`

The narrowed type (must extend T)

## Parameters

### value

`T`

## Returns

`value is U`

## Example

```typescript
const isString: TypePredicate<unknown, string> = (value): value is string =>
  typeof value === 'string'

const value: unknown = 'hello'
if (isString(value)) {
  // TypeScript knows value is string here
  console.log(value.toUpperCase())
}
```
