# Function: isPositive()

> **isPositive**(`value`): `boolean`

Defined in: [number/isPositive/index.ts:18](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/isPositive/index.ts#L18)

Type guard to check if a number is positive.

Returns true if the value is greater than zero.

## Parameters

### value

`number`

The number to check

## Returns

`boolean`

True if the number is positive

## Example

```typescript
isPositive(42) // => true
isPositive(0) // => false
isPositive(-5) // => false
```

## See

isNegative - for checking if a number is negative
