# Function: interpolate()

## Call Signature

> **interpolate**(`from`, `to`, `progress`): `number`

Defined in: [number/interpolate/index.ts:39](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/interpolate/index.ts#L39)

Linearly interpolates between two numbers.

Given a progress value between 0 and 1, returns the interpolated value
between from and to. Useful for animations, transitions, and gradients.

### Parameters

#### from

`number`

Starting value

#### to

`number`

Ending value

#### progress

`number`

Progress between 0 and 1

### Returns

`number`

The interpolated value

### Example

```typescript
// Data-first
interpolate(0, 100, 0.5) // => 50
interpolate(0, 100, 0) // => 0
interpolate(0, 100, 1) // => 100
interpolate(10, 20, 0.25) // => 12.5

// Data-last (in pipe)
pipe(
  progress,
  interpolate(startValue, endValue)
)

// Real-world: Animation easing
const animateValue = (start: number, end: number, duration: number) => {
  const startTime = Date.now()
  return () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    return interpolate(start, end, progress)
  }
}
```

## Call Signature

> **interpolate**(`from`, `to`): (`progress`) => `number`

Defined in: [number/interpolate/index.ts:44](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/interpolate/index.ts#L44)

Linearly interpolates between two numbers.

Given a progress value between 0 and 1, returns the interpolated value
between from and to. Useful for animations, transitions, and gradients.

### Parameters

#### from

`number`

Starting value

#### to

`number`

Ending value

### Returns

The interpolated value

> (`progress`): `number`

#### Parameters

##### progress

`number`

#### Returns

`number`

### Example

```typescript
// Data-first
interpolate(0, 100, 0.5) // => 50
interpolate(0, 100, 0) // => 0
interpolate(0, 100, 1) // => 100
interpolate(10, 20, 0.25) // => 12.5

// Data-last (in pipe)
pipe(
  progress,
  interpolate(startValue, endValue)
)

// Real-world: Animation easing
const animateValue = (start: number, end: number, duration: number) => {
  const startTime = Date.now()
  return () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    return interpolate(start, end, progress)
  }
}
```
