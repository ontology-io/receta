# Function: gte()

> **gte**\<`T`\>(`threshold`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:53](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L53)

Creates a predicate that tests if a value is greater than or equal to a threshold.

## Type Parameters

### T

`T` *extends* `number` \| `bigint`

## Parameters

### threshold

`T`

The minimum value (inclusive)

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value >= threshold

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, gte(10)) // => [10, 15, 20]
```

## See

 - gt - for exclusive comparison (>)
 - lte - for less than or equal comparison
