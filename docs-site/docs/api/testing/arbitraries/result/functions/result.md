# Function: result()

> **result**\<`T`, `E`\>(`okArb`, `errArb`, `config?`): `Arbitrary`\<[`Result`](../../../../result/types/type-aliases/Result.md)\<`T`, `E`\>\>

Defined in: [testing/arbitraries/result.ts:47](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/arbitraries/result.ts#L47)

Generate random Result<T, E> values.

By default, generates 50% Ok and 50% Err values. Use `okWeight` to adjust the distribution.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### okArb

`Arbitrary`\<`T`\>

Arbitrary for generating Ok values

### errArb

`Arbitrary`\<`E`\>

Arbitrary for generating Err values

### config?

[`ResultArbitraryConfig`](../../types/interfaces/ResultArbitraryConfig.md) = `{}`

Configuration for weight distribution

## Returns

`Arbitrary`\<[`Result`](../../../../result/types/type-aliases/Result.md)\<`T`, `E`\>\>

Arbitrary that generates Result<T, E>

## Examples

```typescript
import * as fc from 'fast-check'
import { result } from 'receta-test/arbitraries'

// Generate Result<number, string>
const resultArb = result(fc.integer(), fc.string())

fc.assert(
  fc.property(resultArb, (r) => {
    // r is randomly Ok(number) or Err(string)
    if (r._tag === 'Ok') {
      expect(typeof r.value).toBe('number')
    } else {
      expect(typeof r.error).toBe('string')
    }
  })
)
```

```typescript
// Generate mostly Ok values (90%)
const resultArb = result(fc.integer(), fc.string(), { okWeight: 0.9 })
```
