# Type Alias: TypePredicate()\<T, U\>

> **TypePredicate**\<`T`, `U`\> = (`value`) => `value is U`

Defined in: [predicate/types.ts:47](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/types.ts#L47)

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
