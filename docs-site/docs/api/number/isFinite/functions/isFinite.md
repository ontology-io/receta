# Function: isFinite()

> **isFinite**(`value`): `boolean`

Defined in: [number/isFinite/index.ts:20](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/isFinite/index.ts#L20)

Type guard to check if a value is a finite number.

Returns true if the value is a finite number (not Infinity, -Infinity, or NaN).

## Parameters

### value

`number`

The value to check

## Returns

`boolean`

True if the value is finite

## Example

```typescript
isFinite(42) // => true
isFinite(42.5) // => true
isFinite(Infinity) // => false
isFinite(-Infinity) // => false
isFinite(NaN) // => false
```

## See

isInteger - for checking if a number is an integer
