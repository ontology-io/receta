# Function: normalize()

## Call Signature

> **normalize**(`value`, `min`, `max`): `number`

Defined in: [number/normalize/index.ts:43](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/normalize/index.ts#L43)

Scales a number from a given range to the 0-1 range.

Useful for data visualization, progress bars, animations,
and machine learning feature scaling.

### Parameters

#### value

`number`

The number to normalize

#### min

`number`

Minimum value of the input range

#### max

`number`

Maximum value of the input range

### Returns

`number`

The normalized value between 0 and 1

### Example

```typescript
// Data-first
normalize(75, 0, 100) // => 0.75
normalize(50, 0, 100) // => 0.5
normalize(5, 0, 10) // => 0.5
normalize(0, 0, 100) // => 0
normalize(100, 0, 100) // => 1

// Data-last (in pipe)
pipe(
  currentValue,
  normalize(minValue, maxValue)
)

// Real-world: Progress bar
const progressPercentage = (current: number, total: number) =>
  pipe(current, normalize(0, total), (n) => n * 100)

// Real-world: Feature scaling for ML
const scaleFeature = (values: number[]) => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return R.map(values, normalize(min, max))
}
```

### See

interpolate - for the inverse operation

## Call Signature

> **normalize**(`min`, `max`): (`value`) => `number`

Defined in: [number/normalize/index.ts:44](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/normalize/index.ts#L44)

Scales a number from a given range to the 0-1 range.

Useful for data visualization, progress bars, animations,
and machine learning feature scaling.

### Parameters

#### min

`number`

Minimum value of the input range

#### max

`number`

Maximum value of the input range

### Returns

The normalized value between 0 and 1

> (`value`): `number`

#### Parameters

##### value

`number`

#### Returns

`number`

### Example

```typescript
// Data-first
normalize(75, 0, 100) // => 0.75
normalize(50, 0, 100) // => 0.5
normalize(5, 0, 10) // => 0.5
normalize(0, 0, 100) // => 0
normalize(100, 0, 100) // => 1

// Data-last (in pipe)
pipe(
  currentValue,
  normalize(minValue, maxValue)
)

// Real-world: Progress bar
const progressPercentage = (current: number, total: number) =>
  pipe(current, normalize(0, total), (n) => n * 100)

// Real-world: Feature scaling for ML
const scaleFeature = (values: number[]) => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return R.map(values, normalize(min, max))
}
```

### See

interpolate - for the inverse operation
