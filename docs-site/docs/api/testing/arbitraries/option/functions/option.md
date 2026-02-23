# Function: option()

> **option**\<`T`\>(`valueArb`, `config?`): `Arbitrary`\<[`Option`](../../../../option/types/type-aliases/Option.md)\<`T`\>\>

Defined in: [testing/arbitraries/option.ts:46](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/arbitraries/option.ts#L46)

Generate random Option<T> values.

By default, generates 50% Some and 50% None values. Use `someWeight` to adjust the distribution.

## Type Parameters

### T

`T`

## Parameters

### valueArb

`Arbitrary`\<`T`\>

Arbitrary for generating Some values

### config?

[`OptionArbitraryConfig`](../../types/interfaces/OptionArbitraryConfig.md) = `{}`

Configuration for weight distribution

## Returns

`Arbitrary`\<[`Option`](../../../../option/types/type-aliases/Option.md)\<`T`\>\>

Arbitrary that generates Option<T>

## Examples

```typescript
import * as fc from 'fast-check'
import { option } from 'receta-test/arbitraries'

// Generate Option<number>
const optionArb = option(fc.integer())

fc.assert(
  fc.property(optionArb, (opt) => {
    // opt is randomly Some(number) or None
    if (opt._tag === 'Some') {
      expect(typeof opt.value).toBe('number')
    } else {
      expect(opt._tag).toBe('None')
    }
  })
)
```

```typescript
// Generate mostly Some values (80%)
const optionArb = option(fc.integer(), { someWeight: 0.8 })
```
