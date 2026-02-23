# Type Alias: Comparator()\<T\>

> **Comparator**\<`T`\> = (`a`, `b`) => `number`

Defined in: [compare/types.ts:17](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/types.ts#L17)

A comparator function for sorting values of type T.

Returns:
- Negative number if a should come before b
- Zero if a and b are equal
- Positive number if a should come after b

## Type Parameters

### T

`T`

The type of values being compared

## Parameters

### a

`T`

### b

`T`

## Returns

`number`

## Example

```typescript
const numericComparator: Comparator<number> = (a, b) => a - b
[3, 1, 2].sort(numericComparator) // => [1, 2, 3]
```
