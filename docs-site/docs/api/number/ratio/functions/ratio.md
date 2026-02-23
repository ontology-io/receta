# Function: ratio()

## Call Signature

> **ratio**(`a`, `b`): `number`

Defined in: [number/ratio/index.ts:34](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/ratio/index.ts#L34)

Calculates the ratio of two numbers.

Returns the ratio as a decimal (a / b).
Returns 0 if b is 0 to avoid division by zero.

### Parameters

#### a

`number`

The first number

#### b

`number`

The second number

### Returns

`number`

The ratio (a / b)

### Example

```typescript
// Data-first
ratio(4, 2) // => 2
ratio(3, 4) // => 0.75
ratio(10, 0) // => 0 (safe division)

// Data-last (in pipe)
pipe(
  width,
  ratio(height)
) // => aspect ratio

// Real-world: Aspect ratio
const aspectRatio = (width: number, height: number) =>
  pipe(
    ratio(width, height),
    round(2)
  )
```

## Call Signature

> **ratio**(`b`): (`a`) => `number`

Defined in: [number/ratio/index.ts:35](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/ratio/index.ts#L35)

Calculates the ratio of two numbers.

Returns the ratio as a decimal (a / b).
Returns 0 if b is 0 to avoid division by zero.

### Parameters

#### b

`number`

The second number

### Returns

The ratio (a / b)

> (`a`): `number`

#### Parameters

##### a

`number`

#### Returns

`number`

### Example

```typescript
// Data-first
ratio(4, 2) // => 2
ratio(3, 4) // => 0.75
ratio(10, 0) // => 0 (safe division)

// Data-last (in pipe)
pipe(
  width,
  ratio(height)
) // => aspect ratio

// Real-world: Aspect ratio
const aspectRatio = (width: number, height: number) =>
  pipe(
    ratio(width, height),
    round(2)
  )
```
