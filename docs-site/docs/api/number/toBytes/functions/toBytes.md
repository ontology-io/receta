# Function: toBytes()

## Call Signature

> **toBytes**(`value`, `options?`): `string`

Defined in: [number/toBytes/index.ts:35](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/toBytes/index.ts#L35)

Formats a number as a byte size string (KB, MB, GB, etc.).

Automatically selects the appropriate unit based on the value.
Supports both binary (1024) and decimal (1000) bases.

### Parameters

#### value

`number`

The number of bytes

#### options?

[`ByteOptions`](../../types/interfaces/ByteOptions.md)

Byte formatting options

### Returns

`string`

The formatted byte string

### Example

```typescript
// Data-first (binary by default)
toBytes(1024) // => "1.00 KB"
toBytes(1048576) // => "1.00 MB"
toBytes(1536, { decimals: 0 }) // => "2 KB"
toBytes(1000, { base: 'decimal' }) // => "1.00 KB"

// Data-last (in pipe)
pipe(
  fileSize,
  toBytes({ decimals: 1 })
)

// Real-world: File size display
const displayFileSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : toBytes(bytes, { decimals: 1 })
```

### See

fromBytes - for parsing byte strings

## Call Signature

> **toBytes**(`options?`): (`value`) => `string`

Defined in: [number/toBytes/index.ts:36](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/number/toBytes/index.ts#L36)

Formats a number as a byte size string (KB, MB, GB, etc.).

Automatically selects the appropriate unit based on the value.
Supports both binary (1024) and decimal (1000) bases.

### Parameters

#### options?

[`ByteOptions`](../../types/interfaces/ByteOptions.md)

Byte formatting options

### Returns

The formatted byte string

> (`value`): `string`

#### Parameters

##### value

`number`

#### Returns

`string`

### Example

```typescript
// Data-first (binary by default)
toBytes(1024) // => "1.00 KB"
toBytes(1048576) // => "1.00 MB"
toBytes(1536, { decimals: 0 }) // => "2 KB"
toBytes(1000, { base: 'decimal' }) // => "1.00 KB"

// Data-last (in pipe)
pipe(
  fileSize,
  toBytes({ decimals: 1 })
)

// Real-world: File size display
const displayFileSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : toBytes(bytes, { decimals: 1 })
```

### See

fromBytes - for parsing byte strings
