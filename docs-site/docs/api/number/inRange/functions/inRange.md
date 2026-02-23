# Function: inRange()

## Call Signature

> **inRange**(`value`, `min`, `max`): `boolean`

Defined in: [number/inRange/index.ts:29](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/inRange/index.ts#L29)

Checks if a number is within a specified range (inclusive).

Returns true if the value is between min and max (inclusive).
Can be used as a predicate builder for filtering.

### Parameters

#### value

`number`

The number to check

#### min

`number`

Minimum value (inclusive)

#### max

`number`

Maximum value (inclusive)

### Returns

`boolean`

True if the number is within the range

### Example

```typescript
// Data-first
inRange(50, 0, 100) // => true
inRange(150, 0, 100) // => false
inRange(0, 0, 100) // => true
inRange(100, 0, 100) // => true

// Data-last (as predicate)
const ages = [15, 25, 35, 45]
R.filter(ages, inRange(18, 65)) // => [25, 35, 45]
```

### See

clamp - for constraining a value to a range

## Call Signature

> **inRange**(`min`, `max`): (`value`) => `boolean`

Defined in: [number/inRange/index.ts:30](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/inRange/index.ts#L30)

Checks if a number is within a specified range (inclusive).

Returns true if the value is between min and max (inclusive).
Can be used as a predicate builder for filtering.

### Parameters

#### min

`number`

Minimum value (inclusive)

#### max

`number`

Maximum value (inclusive)

### Returns

True if the number is within the range

> (`value`): `boolean`

#### Parameters

##### value

`number`

#### Returns

`boolean`

### Example

```typescript
// Data-first
inRange(50, 0, 100) // => true
inRange(150, 0, 100) // => false
inRange(0, 0, 100) // => true
inRange(100, 0, 100) // => true

// Data-last (as predicate)
const ages = [15, 25, 35, 45]
R.filter(ages, inRange(18, 65)) // => [25, 35, 45]
```

### See

clamp - for constraining a value to a range
