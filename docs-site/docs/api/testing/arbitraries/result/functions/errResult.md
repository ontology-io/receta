# Function: errResult()

> **errResult**\<`E`\>(`errorArb`): `Arbitrary`\<[`Result`](../../../../result/types/type-aliases/Result.md)\<`never`, `E`\>\>

Defined in: [testing/arbitraries/result.ts:112](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/arbitraries/result.ts#L112)

Generate only Err results.

Useful when you want to test error handling paths.

## Type Parameters

### E

`E`

## Parameters

### errorArb

`Arbitrary`\<`E`\>

Arbitrary for generating Err values

## Returns

`Arbitrary`\<[`Result`](../../../../result/types/type-aliases/Result.md)\<`never`, `E`\>\>

Arbitrary that always generates Err results

## Example

```typescript
import * as fc from 'fast-check'
import { errResult } from 'receta-test/arbitraries'

const errArb = errResult(fc.string())

fc.assert(
  fc.property(errArb, (r) => {
    expect(r._tag).toBe('Err')
    expect(typeof r.error).toBe('string')
  })
)
```
