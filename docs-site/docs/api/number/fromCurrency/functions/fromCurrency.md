# Function: fromCurrency()

> **fromCurrency**(`input`): [`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Defined in: [number/fromCurrency/index.ts:33](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/fromCurrency/index.ts#L33)

Parses a currency string into a number.

Strips currency symbols, grouping separators, and whitespace before parsing.
Handles common formats: "$1,234.56", "€1.234,56", "£1,234.56".

## Parameters

### input

`string`

The currency string to parse

## Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Result containing the parsed number or an error

## Example

```typescript
fromCurrency("$1,234.56") // => Ok(1234.56)
fromCurrency("€1.234,56") // => Ok(1234.56) (European format)
fromCurrency("£1,234") // => Ok(1234)
fromCurrency("-$50.00") // => Ok(-50)
fromCurrency("invalid") // => Err({ code: 'PARSE_ERROR', ... })

// Real-world: Parse Stripe amount string
const parseStripeAmount = (amountStr: string) =>
  pipe(
    fromCurrency(amountStr),
    map(amount => Math.round(amount * 100)) // Convert to cents
  )
```

## See

 - fromString - for parsing plain number strings
 - toCurrency - for formatting numbers as currency
