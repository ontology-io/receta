# Function: fromString()

> **fromString**(`input`): [`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Defined in: [number/fromString/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/fromString/index.ts#L35)

Parses a string into a number.

Returns Ok with the parsed number, or Err with ParseError if parsing fails.
Handles common number formats including decimals, negatives, and scientific notation.

## Parameters

### input

`string`

The string to parse

## Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Result containing the parsed number or an error

## Example

```typescript
fromString("123") // => Ok(123)
fromString("123.45") // => Ok(123.45)
fromString("-42") // => Ok(-42)
fromString("1.23e4") // => Ok(12300)
fromString("abc") // => Err({ code: 'PARSE_ERROR', ... })
fromString("") // => Err({ code: 'PARSE_ERROR', ... })

// Real-world: Form input validation
const validatePrice = (input: string) =>
  pipe(
    fromString(input),
    flatMap(price =>
      price > 0 ? ok(price) : err({ code: 'INVALID_PRICE' })
    )
  )
```

## See

fromCurrency - for parsing currency strings
