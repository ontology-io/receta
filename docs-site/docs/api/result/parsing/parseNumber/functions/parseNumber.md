# Function: parseNumber()

> **parseNumber**(`str`): [`Result`](../../../types/type-aliases/Result.md)\<`number`, [`ParseNumberError`](../../types/interfaces/ParseNumberError.md)\>

Defined in: [result/parsing/parseNumber.ts:58](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/parsing/parseNumber.ts#L58)

Safely parses a string into a number.

Unlike Number() which can produce NaN or Infinity, this function returns a Result
that either contains a valid finite number or a descriptive error.

## Parameters

### str

`string`

The string to parse

## Returns

[`Result`](../../../types/type-aliases/Result.md)\<`number`, [`ParseNumberError`](../../types/interfaces/ParseNumberError.md)\>

Result containing the parsed number or a ParseNumberError

## Example

```typescript
// Successful parsing
parseNumber('123')
// => Ok(123)

parseNumber('3.14')
// => Ok(3.14)

parseNumber('-42.5')
// => Ok(-42.5)

parseNumber('0')
// => Ok(0)

// Scientific notation
parseNumber('1.5e10')
// => Ok(15000000000)

// Failed parsing - not a number
parseNumber('abc')
// => Err({ _tag: 'ParseNumberError', reason: 'not_a_number', input: 'abc', ... })

parseNumber('')
// => Err({ _tag: 'ParseNumberError', reason: 'not_a_number', input: '', ... })

// Failed parsing - infinite
parseNumber('Infinity')
// => Err({ _tag: 'ParseNumberError', reason: 'infinite', input: 'Infinity', ... })

parseNumber('-Infinity')
// => Err({ _tag: 'ParseNumberError', reason: 'infinite', input: '-Infinity', ... })

// Use in validation pipelines
pipe(
  parseNumber('42'),
  Result.flatMap(n => n > 0 ? ok(n) : err('Must be positive'))
)
// => Ok(42)
```

## See

 - parseInt - For parsing integers with radix support
 - Number - The underlying conversion function
