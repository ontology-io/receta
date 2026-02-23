# Function: okResult()

> **okResult**\<`T`\>(`valueArb`): `Arbitrary`\<[`Result`](../../../../result/types/type-aliases/Result.md)\<`T`, `never`\>\>

Defined in: [testing/arbitraries/result.ts:85](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/arbitraries/result.ts#L85)

Generate only Ok results.

Useful when you want to test behavior with guaranteed success values.

## Type Parameters

### T

`T`

## Parameters

### valueArb

`Arbitrary`\<`T`\>

Arbitrary for generating Ok values

## Returns

`Arbitrary`\<[`Result`](../../../../result/types/type-aliases/Result.md)\<`T`, `never`\>\>

Arbitrary that always generates Ok results

## Example

```typescript
import * as fc from 'fast-check'
import { okResult } from 'receta-test/arbitraries'

const okArb = okResult(fc.integer())

fc.assert(
  fc.property(okArb, (r) => {
    expect(r._tag).toBe('Ok')
    expect(typeof r.value).toBe('number')
  })
)
```
