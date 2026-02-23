# Function: toPercent()

## Call Signature

> **toPercent**(`value`, `decimals?`): `string`

Defined in: [number/toPercent/index.ts:37](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/toPercent/index.ts#L37)

Formats a number as a percentage.

Multiplies the value by 100 and adds a percent sign.
For example, 0.25 becomes "25%", 1.5 becomes "150%".

### Parameters

#### value

`number`

The number to format as percentage (0.5 = 50%)

#### decimals?

`number`

Number of decimal places (default: 0)

### Returns

`string`

The formatted percentage string

### Example

```typescript
// Data-first (requires 2 args)
toPercent(0.25, 0) // => "25%"
toPercent(0.1234, 2) // => "12.34%"
toPercent(1.5, 0) // => "150%"
toPercent(0.333333, 1) // => "33.3%"

// Data-last (in pipe)
pipe(
  conversionRate,
  toPercent(2)
)

// Real-world: Analytics dashboard
const successRate = (successful: number, total: number) =>
  pipe(
    successful / total,
    toPercent(1)
  )
```

### See

percentage - for calculating percentages

## Call Signature

> **toPercent**(`decimals?`): (`value`) => `string`

Defined in: [number/toPercent/index.ts:38](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/toPercent/index.ts#L38)

Formats a number as a percentage.

Multiplies the value by 100 and adds a percent sign.
For example, 0.25 becomes "25%", 1.5 becomes "150%".

### Parameters

#### decimals?

`number`

Number of decimal places (default: 0)

### Returns

The formatted percentage string

> (`value`): `string`

#### Parameters

##### value

`number`

#### Returns

`string`

### Example

```typescript
// Data-first (requires 2 args)
toPercent(0.25, 0) // => "25%"
toPercent(0.1234, 2) // => "12.34%"
toPercent(1.5, 0) // => "150%"
toPercent(0.333333, 1) // => "33.3%"

// Data-last (in pipe)
pipe(
  conversionRate,
  toPercent(2)
)

// Real-world: Analytics dashboard
const successRate = (successful: number, total: number) =>
  pipe(
    successful / total,
    toPercent(1)
  )
```

### See

percentage - for calculating percentages
