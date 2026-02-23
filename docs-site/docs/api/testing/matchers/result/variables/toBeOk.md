# Variable: toBeOk

> `const` **toBeOk**: `MatcherFunction`

Defined in: [testing/matchers/result.ts:47](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/result.ts#L47)

Assert that a Result is Ok, optionally checking the value.

## Example

```typescript
import { expect } from 'vitest'
import { ok, err } from 'receta/result'

expect(ok(5)).toBeOk()           // Pass
expect(ok(5)).toBeOk(5)          // Pass
expect(ok(5)).toBeOk(10)         // Fail
expect(err('fail')).not.toBeOk() // Pass
```
