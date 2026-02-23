# Function: fromBytes()

> **fromBytes**(`input`, `base?`): [`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Defined in: [number/fromBytes/index.ts:35](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/fromBytes/index.ts#L35)

Parses a byte size string into a number of bytes.

Handles common formats: "1KB", "1.5 MB", "2GB".
Supports both binary (1024) and decimal (1000) bases.
Case-insensitive unit parsing.

## Parameters

### input

`string`

The byte string to parse

### base?

Whether to use binary (1024) or decimal (1000) units

`"binary"` | `"decimal"`

## Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`number`, [`ParseError`](../../types/interfaces/ParseError.md)\>

Result containing the number of bytes or an error

## Example

```typescript
fromBytes("1KB") // => Ok(1024)
fromBytes("1.5 MB") // => Ok(1572864)
fromBytes("2GB") // => Ok(2147483648)
fromBytes("100 B") // => Ok(100)
fromBytes("1KB", 'decimal') // => Ok(1000)
fromBytes("invalid") // => Err({ code: 'PARSE_ERROR', ... })

// Real-world: Parse file size limit
const validateFileSize = (sizeStr: string, maxStr: string) =>
  pipe(
    collect([fromBytes(sizeStr), fromBytes(maxStr)]),
    map(([size, max]) => size <= max)
  )
```

## See

toBytes - for formatting bytes as strings
