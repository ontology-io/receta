# Type Alias: Comparator()\<T\>

> **Comparator**\<`T`\> = (`a`, `b`) => `number`

Defined in: [compare/types.ts:17](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/compare/types.ts#L17)

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
