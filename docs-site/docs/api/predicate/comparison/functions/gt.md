# Function: gt()

> **gt**\<`T`\>(`threshold`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:33](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L33)

Creates a predicate that tests if a value is greater than a threshold.

## Type Parameters

### T

`T` *extends* `number` \| `bigint`

## Parameters

### threshold

`T`

The minimum value (exclusive)

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value > threshold

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, gt(10)) // => [15, 20]

// With pipe
R.pipe(
  numbers,
  R.filter(gt(10))
) // => [15, 20]
```

## See

 - gte - for inclusive comparison (>=)
 - lt - for less than comparison
 - between - for range comparison
