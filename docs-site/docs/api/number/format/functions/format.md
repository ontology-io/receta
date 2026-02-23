# Function: format()

## Call Signature

> **format**(`value`, `options?`): `string`

Defined in: [number/format/index.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/format/index.ts#L31)

Formats a number with specified decimal places and grouping.

Uses the Intl.NumberFormat API for locale-aware formatting.

### Parameters

#### value

`number`

The number to format

#### options?

[`FormatOptions`](../../types/interfaces/FormatOptions.md)

Formatting options

### Returns

`string`

The formatted number string

### Example

```typescript
// Data-first
format(1234.5678) // => "1,234.57"
format(1234.5678, { decimals: 0 }) // => "1,235"
format(1234.5678, { useGrouping: false }) // => "1234.57"
format(1234.5678, { locale: 'de-DE' }) // => "1.234,57"

// Data-last (in pipe)
pipe(
  price,
  format({ decimals: 2 })
) // => formatted price
```

### See

 - toCurrency - for currency-specific formatting
 - toPercent - for percentage formatting

## Call Signature

> **format**(`options?`): (`value`) => `string`

Defined in: [number/format/index.ts:32](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/format/index.ts#L32)

Formats a number with specified decimal places and grouping.

Uses the Intl.NumberFormat API for locale-aware formatting.

### Parameters

#### options?

[`FormatOptions`](../../types/interfaces/FormatOptions.md)

Formatting options

### Returns

The formatted number string

> (`value`): `string`

#### Parameters

##### value

`number`

#### Returns

`string`

### Example

```typescript
// Data-first
format(1234.5678) // => "1,234.57"
format(1234.5678, { decimals: 0 }) // => "1,235"
format(1234.5678, { useGrouping: false }) // => "1234.57"
format(1234.5678, { locale: 'de-DE' }) // => "1.234,57"

// Data-last (in pipe)
pipe(
  price,
  format({ decimals: 2 })
) // => formatted price
```

### See

 - toCurrency - for currency-specific formatting
 - toPercent - for percentage formatting
