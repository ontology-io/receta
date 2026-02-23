# Variable: toBeSome

> `const` **toBeSome**: `MatcherFunction`

Defined in: [testing/matchers/option.ts:47](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/option.ts#L47)

Assert that an Option is Some, optionally checking the value.

## Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(some(5)).toBeSome()           // Pass
expect(some(5)).toBeSome(5)          // Pass
expect(some(5)).toBeSome(10)         // Fail
expect(none()).not.toBeSome()        // Pass
```
