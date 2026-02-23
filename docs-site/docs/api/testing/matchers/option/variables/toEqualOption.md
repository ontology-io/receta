# Variable: toEqualOption

> `const` **toEqualOption**: `MatcherFunction`

Defined in: [testing/matchers/option.ts:144](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/option.ts#L144)

Deep equality check for Option types.

## Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(some(5)).toEqualOption(some(5))   // Pass
expect(none()).toEqualOption(none())     // Pass
expect(some(5)).toEqualOption(some(10))  // Fail
expect(some(5)).toEqualOption(none())    // Fail
```
