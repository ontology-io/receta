# Variable: toEqualResult

> `const` **toEqualResult**: `MatcherFunction`

Defined in: [testing/matchers/result.ts:175](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/result.ts#L175)

Deep equality check for Result types.

## Example

```typescript
import { expect } from 'vitest'
import { ok, err } from 'receta/result'

expect(ok(5)).toEqualResult(ok(5))           // Pass
expect(err('fail')).toEqualResult(err('fail')) // Pass
expect(ok(5)).toEqualResult(ok(10))          // Fail
expect(ok(5)).toEqualResult(err('fail'))     // Fail
```
