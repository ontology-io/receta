# Function: lte()

> **lte**\<`T`\>(`threshold`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/comparison/index.ts:102](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/comparison/index.ts#L102)

Creates a predicate that tests if a value is less than or equal to a threshold.

## Type Parameters

### T

`T` *extends* `number` \| `bigint`

## Parameters

### threshold

`T`

The maximum value (inclusive)

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that returns true if value <= threshold

## Example

```typescript
import * as R from 'remeda'

const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, lte(10)) // => [1, 5, 10]
```

## See

 - lt - for exclusive comparison (<)
 - gte - for greater than or equal comparison
