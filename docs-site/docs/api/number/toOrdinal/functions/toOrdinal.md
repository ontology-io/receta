# Function: toOrdinal()

## Call Signature

> **toOrdinal**(`value`): `string`

Defined in: [number/toOrdinal/index.ts:33](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/toOrdinal/index.ts#L33)

Formats a number as an ordinal (1st, 2nd, 3rd, etc.).

Adds the appropriate English ordinal suffix to the number.

### Parameters

#### value

`number`

The number to format as ordinal

### Returns

`string`

The formatted ordinal string

### Example

```typescript
// Data-first
toOrdinal(1) // => "1st"
toOrdinal(2) // => "2nd"
toOrdinal(3) // => "3rd"
toOrdinal(4) // => "4th"
toOrdinal(11) // => "11th"
toOrdinal(21) // => "21st"
toOrdinal(42) // => "42nd"

// Data-last (in pipe)
pipe(
  position,
  toOrdinal
)

// Real-world: Leaderboard
const displayRank = (rank: number) =>
  `You placed ${toOrdinal(rank)} out of ${total}`
```

## Call Signature

> **toOrdinal**(): (`value`) => `string`

Defined in: [number/toOrdinal/index.ts:34](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/toOrdinal/index.ts#L34)

Formats a number as an ordinal (1st, 2nd, 3rd, etc.).

Adds the appropriate English ordinal suffix to the number.

### Returns

The formatted ordinal string

> (`value`): `string`

#### Parameters

##### value

`number`

#### Returns

`string`

### Example

```typescript
// Data-first
toOrdinal(1) // => "1st"
toOrdinal(2) // => "2nd"
toOrdinal(3) // => "3rd"
toOrdinal(4) // => "4th"
toOrdinal(11) // => "11th"
toOrdinal(21) // => "21st"
toOrdinal(42) // => "42nd"

// Data-last (in pipe)
pipe(
  position,
  toOrdinal
)

// Real-world: Leaderboard
const displayRank = (rank: number) =>
  `You placed ${toOrdinal(rank)} out of ${total}`
```
