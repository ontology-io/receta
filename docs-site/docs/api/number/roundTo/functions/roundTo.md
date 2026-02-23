# Function: roundTo()

## Call Signature

> **roundTo**(`value`, `step`): `number`

Defined in: [number/roundTo/index.ts:40](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/roundTo/index.ts#L40)

Rounds a number to the nearest multiple of a step value.

Useful for quantizing values to specific increments like price steps,
slider values, or decimal quantization.

### Parameters

#### value

`number`

The number to round

#### step

`number`

The step value to round to (must be > 0)

### Returns

`number`

The rounded number

### Example

```typescript
// Data-first
roundTo(4.23, 0.25) // => 4.25
roundTo(4.22, 0.25) // => 4.25
roundTo(4.10, 0.25) // => 4.00
roundTo(127, 5) // => 125
roundTo(128, 5) // => 130
roundTo(1.234, 0.1) // => 1.2

// Data-last (in pipe)
pipe(
  price,
  roundTo(0.25)
)

// Real-world: Price quantization
const roundPrice = (price: number) =>
  pipe(price, roundTo(0.01)) // Round to nearest cent

// Real-world: Slider step values
const quantizeSlider = (value: number, step: number) =>
  roundTo(value, step)
```

### See

round - for decimal place rounding

## Call Signature

> **roundTo**(`step`): (`value`) => `number`

Defined in: [number/roundTo/index.ts:41](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/roundTo/index.ts#L41)

Rounds a number to the nearest multiple of a step value.

Useful for quantizing values to specific increments like price steps,
slider values, or decimal quantization.

### Parameters

#### step

`number`

The step value to round to (must be > 0)

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
// Data-first
roundTo(4.23, 0.25) // => 4.25
roundTo(4.22, 0.25) // => 4.25
roundTo(4.10, 0.25) // => 4.00
roundTo(127, 5) // => 125
roundTo(128, 5) // => 130
roundTo(1.234, 0.1) // => 1.2

// Data-last (in pipe)
pipe(
  price,
  roundTo(0.25)
)

// Real-world: Price quantization
const roundPrice = (price: number) =>
  pipe(price, roundTo(0.01)) // Round to nearest cent

// Real-world: Slider step values
const quantizeSlider = (value: number, step: number) =>
  roundTo(value, step)
```

### See

round - for decimal place rounding
