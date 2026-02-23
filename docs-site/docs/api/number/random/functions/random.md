# Function: random()

## Call Signature

> **random**(`max`): `number`

Defined in: [number/random/index.ts:25](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/random/index.ts#L25)

Generates a random number within a specified range.

Returns a random number between min (inclusive) and max (exclusive).
If only one argument is provided, it's treated as max with min defaulting to 0.

### Parameters

#### max

`number`

Maximum value (exclusive)

### Returns

`number`

A random number in the range [min, max)

### Example

```typescript
random(10) // => number between 0 and 10
random(5, 10) // => number between 5 and 10
random(0, 1) // => number between 0 and 1

// Real-world: Random delay for retry backoff
const jitter = () => random(0, 1000)
const backoffWithJitter = (attempt: number) =>
  Math.pow(2, attempt) * 1000 + jitter()
```

### See

step - for rounding to specific increments

## Call Signature

> **random**(`min`, `max`): `number`

Defined in: [number/random/index.ts:26](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/random/index.ts#L26)

Generates a random number within a specified range.

Returns a random number between min (inclusive) and max (exclusive).
If only one argument is provided, it's treated as max with min defaulting to 0.

### Parameters

#### min

`number`

Minimum value (inclusive) or maximum if only one arg

#### max

`number`

Maximum value (exclusive)

### Returns

`number`

A random number in the range [min, max)

### Example

```typescript
random(10) // => number between 0 and 10
random(5, 10) // => number between 5 and 10
random(0, 1) // => number between 0 and 1

// Real-world: Random delay for retry backoff
const jitter = () => random(0, 1000)
const backoffWithJitter = (attempt: number) =>
  Math.pow(2, attempt) * 1000 + jitter()
```

### See

step - for rounding to specific increments
