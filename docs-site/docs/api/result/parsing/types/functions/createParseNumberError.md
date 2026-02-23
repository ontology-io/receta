# Function: createParseNumberError()

> **createParseNumberError**(`input`, `reason`, `message`): [`ParseNumberError`](../interfaces/ParseNumberError.md)

Defined in: [result/parsing/types.ts:14](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/parsing/types.ts#L14)

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
