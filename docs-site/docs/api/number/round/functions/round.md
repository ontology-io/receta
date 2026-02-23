# Function: round()

## Call Signature

> **round**(`value`, `decimals?`): `number`

Defined in: [number/round/index.ts:33](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/round/index.ts#L33)

Rounds a number to a specified number of decimal places.

Uses proper rounding (half away from zero).

### Parameters

#### value

`number`

The number to round

#### decimals?

`number`

Number of decimal places (default: 0)

### Returns

`number`

The rounded number

### Example

```typescript
// Data-first (requires 2 args)
round(1.2345, 0) // => 1
round(1.2345, 2) // => 1.23
round(1.2367, 2) // => 1.24
round(1234.56, -2) // => 1200

// Data-last (in pipe)
pipe(
  price,
  round(2)
)

// Real-world: Price rounding
const roundPrice = (price: number) =>
  pipe(price, round(2))
```

### See

toPrecision - for significant digits

## Call Signature

> **round**(`decimals?`): (`value`) => `number`

Defined in: [number/round/index.ts:34](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/round/index.ts#L34)

Rounds a number to a specified number of decimal places.

Uses proper rounding (half away from zero).

### Parameters

#### decimals?

`number`

Number of decimal places (default: 0)

### Returns

The rounded number

> (`value`): `number`

#### Parameters

##### value

`number`

#### Returns

`number`

### Example

```typescript
// Data-first (requires 2 args)
round(1.2345, 0) // => 1
round(1.2345, 2) // => 1.23
round(1.2367, 2) // => 1.24
round(1234.56, -2) // => 1200

// Data-last (in pipe)
pipe(
  price,
  round(2)
)

// Real-world: Price rounding
const roundPrice = (price: number) =>
  pipe(price, round(2))
```

### See

toPrecision - for significant digits
