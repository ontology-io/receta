# Function: percentage()

## Call Signature

> **percentage**(`value`, `total`): `number`

Defined in: [number/percentage/index.ts:38](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/percentage/index.ts#L38)

Calculates what percentage one number is of another.

Returns the percentage as a decimal (0.25 = 25%).
Returns 0 if the total is 0 to avoid division by zero.

### Parameters

#### value

`number`

The part value

#### total

`number`

The total value

### Returns

`number`

The percentage as a decimal

### Example

```typescript
// Data-first
percentage(25, 100) // => 0.25
percentage(1, 4) // => 0.25
percentage(10, 0) // => 0 (safe division)

// Data-last (in pipe)
pipe(
  completed,
  percentage(total),
  toPercent(1)
) // => "25.0%"

// Real-world: Progress indicator
const progress = (current: number, total: number) =>
  pipe(
    percentage(current, total),
    (p) => p * 100,
    Math.round
  )
```

### See

toPercent - for formatting as percentage string

## Call Signature

> **percentage**(`total`): (`value`) => `number`

Defined in: [number/percentage/index.ts:39](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/percentage/index.ts#L39)

Calculates what percentage one number is of another.

Returns the percentage as a decimal (0.25 = 25%).
Returns 0 if the total is 0 to avoid division by zero.

### Parameters

#### total

`number`

The total value

### Returns

The percentage as a decimal

> (`value`): `number`

#### Parameters

##### value

`number`

#### Returns

`number`

### Example

```typescript
// Data-first
percentage(25, 100) // => 0.25
percentage(1, 4) // => 0.25
percentage(10, 0) // => 0 (safe division)

// Data-last (in pipe)
pipe(
  completed,
  percentage(total),
  toPercent(1)
) // => "25.0%"

// Real-world: Progress indicator
const progress = (current: number, total: number) =>
  pipe(
    percentage(current, total),
    (p) => p * 100,
    Math.round
  )
```

### See

toPercent - for formatting as percentage string
