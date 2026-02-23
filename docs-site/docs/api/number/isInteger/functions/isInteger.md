# Function: isInteger()

> **isInteger**(`value`): `boolean`

Defined in: [number/isInteger/index.ts:21](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/isInteger/index.ts#L21)

Type guard to check if a value is a safe integer.

Returns true if the value is an integer within JavaScript's safe integer range
(Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER).

## Parameters

### value

`number`

The value to check

## Returns

`boolean`

True if the value is a safe integer

## Example

```typescript
isInteger(42) // => true
isInteger(42.5) // => false
isInteger(Number.MAX_SAFE_INTEGER) // => true
isInteger(Number.MAX_SAFE_INTEGER + 1) // => false
```

## See

 - isFinite - for checking if a number is finite
 - inRange - for checking if a number is within a range
