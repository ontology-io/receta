# Type Alias: Predicate()\<T\>

> **Predicate**\<`T`\> = (`value`) => `boolean`

Defined in: [predicate/types.ts:25](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/types.ts#L25)

A function that takes a value and returns a boolean.

Predicates are used for filtering, validation, and type narrowing.
They can be composed using combinators like `and`, `or`, and `not`.

## Type Parameters

### T

`T`

The type of value the predicate tests

## Parameters

### value

`T`

## Returns

`boolean`

## Example

```typescript
// Simple predicate
const isPositive: Predicate<number> = (n) => n > 0

// Type-narrowing predicate
const isString: Predicate<unknown> = (value): value is string =>
  typeof value === 'string'
```
