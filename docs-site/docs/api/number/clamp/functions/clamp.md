# Function: clamp()

## Call Signature

> **clamp**(`value`, `min`, `max`): `number`

Defined in: [number/clamp/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/clamp/index.ts#L35)

Constrains a number to be within a specified range.

If the value is less than min, returns min.
If the value is greater than max, returns max.
Otherwise, returns the value unchanged.

### Parameters

#### value

`number`

The number to clamp

#### min

`number`

Minimum value

#### max

`number`

Maximum value

### Returns

`number`

The clamped value

### Example

```typescript
// Data-first
clamp(50, 0, 100) // => 50
clamp(150, 0, 100) // => 100
clamp(-10, 0, 100) // => 0

// Data-last (in pipe)
pipe(
  userInput,
  clamp(0, 100)
) // => constrained to 0-100

// Real-world: Volume control
const setVolume = (level: number) =>
  pipe(level, clamp(0, 100))
```

### See

inRange - for checking if a value is in range

## Call Signature

> **clamp**(`min`, `max`): (`value`) => `number`

Defined in: [number/clamp/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/clamp/index.ts#L36)

Constrains a number to be within a specified range.

If the value is less than min, returns min.
If the value is greater than max, returns max.
Otherwise, returns the value unchanged.

### Parameters

#### min

`number`

Minimum value

#### max

`number`

Maximum value

### Returns

The clamped value

> (`value`): `number`

#### Parameters

##### value

`number`

#### Returns

`number`

### Example

```typescript
// Data-first
clamp(50, 0, 100) // => 50
clamp(150, 0, 100) // => 100
clamp(-10, 0, 100) // => 0

// Data-last (in pipe)
pipe(
  userInput,
  clamp(0, 100)
) // => constrained to 0-100

// Real-world: Volume control
const setVolume = (level: number) =>
  pipe(level, clamp(0, 100))
```

### See

inRange - for checking if a value is in range
