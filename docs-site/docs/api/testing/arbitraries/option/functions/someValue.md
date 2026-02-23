# Function: someValue()

> **someValue**\<`T`\>(`valueArb`): `Arbitrary`\<[`Option`](../../../../option/types/type-aliases/Option.md)\<`T`\>\>

Defined in: [testing/arbitraries/option.ts:83](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/arbitraries/option.ts#L83)

Generate only Some values.

Useful when you want to test behavior with guaranteed present values.

## Type Parameters

### T

`T`

## Parameters

### valueArb

`Arbitrary`\<`T`\>

Arbitrary for generating Some values

## Returns

`Arbitrary`\<[`Option`](../../../../option/types/type-aliases/Option.md)\<`T`\>\>

Arbitrary that always generates Some values

## Example

```typescript
import * as fc from 'fast-check'
import { someValue } from 'receta-test/arbitraries'

const someArb = someValue(fc.integer())

fc.assert(
  fc.property(someArb, (opt) => {
    expect(opt._tag).toBe('Some')
    expect(typeof opt.value).toBe('number')
  })
)
```
