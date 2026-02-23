# Function: isNegative()

> **isNegative**(`value`): `boolean`

Defined in: [number/isNegative/index.ts:18](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/isNegative/index.ts#L18)

Type guard to check if a number is negative.

Returns true if the value is less than zero.

## Parameters

### value

`number`

The number to check

## Returns

`boolean`

True if the number is negative

## Example

```typescript
isNegative(-5) // => true
isNegative(0) // => false
isNegative(42) // => false
```

## See

isPositive - for checking if a number is positive
