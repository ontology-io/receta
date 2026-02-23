# Function: createParseNumberError()

> **createParseNumberError**(`input`, `reason`, `message`): [`ParseNumberError`](../interfaces/ParseNumberError.md)

Defined in: [result/parsing/types.ts:14](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/parsing/types.ts#L14)

Creates a ParseNumberError.

## Parameters

### input

`string`

### reason

`"not_a_number"` | `"infinite"` | `"invalid_integer"` | `"out_of_radix_range"`

### message

`string`

## Returns

[`ParseNumberError`](../interfaces/ParseNumberError.md)
