# Function: fromResult()

> **fromResult**\<`T`, `E`\>(`result`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/constructors/index.ts:171](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/constructors/index.ts#L171)

Converts a Result to a Validation.

Ok becomes Valid, Err becomes Invalid with a single error.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

The Result to convert

## Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

A Validation with the same value or error

## Example

```typescript
import { ok, err } from 'receta/result'

fromResult(ok(42))
// => Valid(42)

fromResult(err('failed'))
// => Invalid(['failed'])

// Real-world: Convert Result-based parsers to Validation
const parseJSON = <T>(str: string): Validation<T, string> =>
  fromResult(Result.tryCatch(() => JSON.parse(str) as T))
```

## See

toResult - for converting Validation to Result
