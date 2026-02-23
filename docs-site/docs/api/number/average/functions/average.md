# Function: average()

> **average**(`values`): [`Option`](../../../option/types/type-aliases/Option.md)\<`number`\>

Defined in: [number/average/index.ts:35](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/average/index.ts#L35)

Calculates the average (mean) of an array of numbers.

Returns None for an empty array to avoid division by zero.

## Parameters

### values

readonly `number`[]

Array of numbers to average

## Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`number`\>

Some containing the average, or None if the array is empty

## Example

```typescript
average([1, 2, 3, 4]) // => Some(2.5)
average([10]) // => Some(10)
average([]) // => None

// With Option handling
pipe(
  average(scores),
  unwrapOr(0)
)

// Real-world: Rating calculation
const calculateRating = (ratings: number[]) =>
  pipe(
    average(ratings),
    map(rating => rating.toFixed(1))
  )
```

## See

sum - for calculating the total
