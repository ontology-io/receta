# Function: parseInt()

> **parseInt**(`str`, `radix?`): [`Result`](../../../types/type-aliases/Result.md)\<`number`, [`ParseNumberError`](../../types/interfaces/ParseNumberError.md)\>

Defined in: [result/parsing/parseInt.ts:77](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/parsing/parseInt.ts#L77)

Safely parses a string into an integer with optional radix.

Unlike the global parseInt() which can return NaN or parse partial strings,
this function returns a Result with strict validation:
- Must be a valid integer
- No trailing non-numeric characters allowed
- Radix must be between 2 and 36

## Parameters

### str

`string`

The string to parse

### radix?

`number` = `10`

Optional radix (base) for parsing, between 2 and 36. Defaults to 10

## Returns

[`Result`](../../../types/type-aliases/Result.md)\<`number`, [`ParseNumberError`](../../types/interfaces/ParseNumberError.md)\>

Result containing the parsed integer or a ParseNumberError

## Example

```typescript
// Decimal (default radix 10)
parseInt('123')
// => Ok(123)

parseInt('-42')
// => Ok(-42)

parseInt('0')
// => Ok(0)

// Binary (radix 2)
parseInt('1010', 2)
// => Ok(10)

parseInt('11111111', 2)
// => Ok(255)

// Hexadecimal (radix 16)
parseInt('FF', 16)
// => Ok(255)

parseInt('0x1A', 16)
// => Ok(26)

// Octal (radix 8)
parseInt('77', 8)
// => Ok(63)

// Failed parsing - not a number
parseInt('abc')
// => Err({ _tag: 'ParseNumberError', reason: 'not_a_number', ... })

// Failed parsing - has decimal point
parseInt('123.45')
// => Err({ _tag: 'ParseNumberError', reason: 'invalid_integer', ... })

// Failed parsing - invalid radix
parseInt('123', 1)
// => Err({ _tag: 'ParseNumberError', reason: 'out_of_radix_range', ... })

parseInt('123', 37)
// => Err({ _tag: 'ParseNumberError', reason: 'out_of_radix_range', ... })

// Use with pattern matching
pipe(
  parseInt('FF', 16),
  Result.match(
    (n) => `Decimal: ${n}`,
    (e) => `Error: ${e.message}`
  )
)
// => 'Decimal: 255'
```

## See

 - parseNumber - For parsing floating-point numbers
 - global.parseInt - The underlying native function
