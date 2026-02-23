# Function: parseFormattedNumber()

> **parseFormattedNumber**(`input`): [`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Defined in: [number/parseFormattedNumber/index.ts:59](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/parseFormattedNumber/index.ts#L59)

Parses a formatted number string (with thousands separators and currency symbols)
into a number.

Handles:
- Thousands separators (commas, spaces, periods)
- Currency symbols ($ , £, €, etc.)
- Parentheses for negative numbers (accounting format)
- Decimal points
- Negative signs

Returns Ok with the parsed number, or Err with ParseError if parsing fails.

## Parameters

### input

`string`

The formatted string to parse

## Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Result containing the parsed number or an error

## Example

```typescript
// Basic formatted numbers
parseFormattedNumber("1,234.56") // => Ok(1234.56)
parseFormattedNumber("1 234.56") // => Ok(1234.56)
parseFormattedNumber("1.234,56") // => Ok(1234.56) - European format

// Currency symbols
parseFormattedNumber("$1,234.56") // => Ok(1234.56)
parseFormattedNumber("£1,234.56") // => Ok(1234.56)
parseFormattedNumber("€1.234,56") // => Ok(1234.56)
parseFormattedNumber("1,234.56 USD") // => Ok(1234.56)

// Negative numbers
parseFormattedNumber("-1,234.56") // => Ok(-1234.56)
parseFormattedNumber("(1,234.56)") // => Ok(-1234.56) - Accounting format

// Invalid input
parseFormattedNumber("abc") // => Err({ code: 'PARSE_ERROR', ... })
parseFormattedNumber("") // => Err({ code: 'PARSE_ERROR', ... })

// Real-world: Parse user input
const validatePrice = (input: string) =>
  pipe(
    parseFormattedNumber(input),
    flatMap(price =>
      price > 0 ? ok(price) : err({ code: 'INVALID_PRICE' })
    )
  )

// Real-world: Parse financial report
const parseRevenue = (text: string) =>
  parseFormattedNumber(text) // "$1,234,567.89" => 1234567.89
```

## See

 - fromString - for parsing simple number strings
 - fromCurrency - for parsing currency with specific locale
