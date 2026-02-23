# Function: sum()

> **sum**(`values`): `number`

Defined in: [number/sum/index.ts:23](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/sum/index.ts#L23)

Calculates the sum of an array of numbers.

Returns 0 for an empty array.

## Parameters

### values

readonly `number`[]

Array of numbers to sum

## Returns

`number`

The sum of all numbers

## Example

```typescript
sum([1, 2, 3, 4]) // => 10
sum([]) // => 0
sum([-1, 1]) // => 0
sum([0.1, 0.2, 0.3]) // => 0.6

// Real-world: Shopping cart total
const cartTotal = (items: CartItem[]) =>
  sum(items.map(item => item.price * item.quantity))
```

## See

average - for calculating the mean
