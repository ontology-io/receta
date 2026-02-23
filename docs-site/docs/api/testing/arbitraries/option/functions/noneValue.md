# Function: noneValue()

> **noneValue**\<`T`\>(): `Arbitrary`\<[`Option`](../../../../option/types/type-aliases/Option.md)\<`T`\>\>

Defined in: [testing/arbitraries/option.ts:108](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/arbitraries/option.ts#L108)

Generate only None values.

Useful when you want to test behavior with guaranteed absence.

## Type Parameters

### T

`T` = `never`

## Returns

`Arbitrary`\<[`Option`](../../../../option/types/type-aliases/Option.md)\<`T`\>\>

Arbitrary that always generates None

## Example

```typescript
import * as fc from 'fast-check'
import { noneValue } from 'receta-test/arbitraries'

const noneArb = noneValue<number>()

fc.assert(
  fc.property(noneArb, (opt) => {
    expect(opt._tag).toBe('None')
  })
)
```
