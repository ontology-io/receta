# Function: toCompact()

## Call Signature

> **toCompact**(`value`, `options?`): `string`

Defined in: [number/toCompact/index.ts:36](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/toCompact/index.ts#L36)

Formats a number in compact notation (K, M, B, T).

Uses the Intl.NumberFormat API with compact notation.
For example, 1000 becomes "1K", 1000000 becomes "1M".

### Parameters

#### value

`number`

The number to format

#### options?

[`CompactOptions`](../../types/interfaces/CompactOptions.md)

Compact formatting options

### Returns

`string`

The formatted compact string

### Example

```typescript
// Data-first
toCompact(1000) // => "1K"
toCompact(1500) // => "2K"
toCompact(1000000) // => "1M"
toCompact(1234567, { digits: 2 }) // => "1.2M"
toCompact(1000, { notation: 'long' }) // => "1 thousand"

// Data-last (in pipe)
pipe(
  followerCount,
  toCompact({ digits: 1 })
)

// Real-world: Social media metrics
const displayCount = (count: number) =>
  count < 10000 ? count.toString() : toCompact(count)
```

### See

format - for standard number formatting

## Call Signature

> **toCompact**(`options?`): (`value`) => `string`

Defined in: [number/toCompact/index.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/toCompact/index.ts#L37)

Formats a number in compact notation (K, M, B, T).

Uses the Intl.NumberFormat API with compact notation.
For example, 1000 becomes "1K", 1000000 becomes "1M".

### Parameters

#### options?

[`CompactOptions`](../../types/interfaces/CompactOptions.md)

Compact formatting options

### Returns

The formatted compact string

> (`value`): `string`

#### Parameters

##### value

`number`

#### Returns

`string`

### Example

```typescript
// Data-first
toCompact(1000) // => "1K"
toCompact(1500) // => "2K"
toCompact(1000000) // => "1M"
toCompact(1234567, { digits: 2 }) // => "1.2M"
toCompact(1000, { notation: 'long' }) // => "1 thousand"

// Data-last (in pipe)
pipe(
  followerCount,
  toCompact({ digits: 1 })
)

// Real-world: Social media metrics
const displayCount = (count: number) =>
  count < 10000 ? count.toString() : toCompact(count)
```

### See

format - for standard number formatting
