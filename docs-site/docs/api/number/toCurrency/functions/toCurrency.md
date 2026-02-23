# Function: toCurrency()

## Call Signature

> **toCurrency**(`value`, `options`): `string`

Defined in: [number/toCurrency/index.ts:38](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/toCurrency/index.ts#L38)

Formats a number as currency with the specified currency code and locale.

Uses the Intl.NumberFormat API for locale-aware currency formatting.

### Parameters

#### value

`number`

The number to format as currency

#### options

[`CurrencyOptions`](../../types/interfaces/CurrencyOptions.md)

Currency formatting options

### Returns

`string`

The formatted currency string

### Example

```typescript
// Data-first
toCurrency(1234.56, { currency: 'USD' }) // => "$1,234.56"
toCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // => "1.234,56 €"
toCurrency(1234.56, { currency: 'GBP' }) // => "£1,234.56"
toCurrency(1234, { currency: 'JPY' }) // => "¥1,234" (no decimals)

// Data-last (in pipe)
pipe(
  orderTotal,
  toCurrency({ currency: 'USD' })
)

// Real-world: Stripe checkout
const displayPrice = (amountInCents: number) =>
  pipe(
    amountInCents,
    (n) => n / 100,
    toCurrency({ currency: 'USD' })
  )
```

### See

format - for general number formatting

## Call Signature

> **toCurrency**(`options`): (`value`) => `string`

Defined in: [number/toCurrency/index.ts:39](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/toCurrency/index.ts#L39)

Formats a number as currency with the specified currency code and locale.

Uses the Intl.NumberFormat API for locale-aware currency formatting.

### Parameters

#### options

[`CurrencyOptions`](../../types/interfaces/CurrencyOptions.md)

Currency formatting options

### Returns

The formatted currency string

> (`value`): `string`

#### Parameters

##### value

`number`

#### Returns

`string`

### Example

```typescript
// Data-first
toCurrency(1234.56, { currency: 'USD' }) // => "$1,234.56"
toCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // => "1.234,56 €"
toCurrency(1234.56, { currency: 'GBP' }) // => "£1,234.56"
toCurrency(1234, { currency: 'JPY' }) // => "¥1,234" (no decimals)

// Data-last (in pipe)
pipe(
  orderTotal,
  toCurrency({ currency: 'USD' })
)

// Real-world: Stripe checkout
const displayPrice = (amountInCents: number) =>
  pipe(
    amountInCents,
    (n) => n / 100,
    toCurrency({ currency: 'USD' })
  )
```

### See

format - for general number formatting
