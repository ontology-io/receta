# Variable: toBeErr

> `const` **toBeErr**: `MatcherFunction`

Defined in: [testing/matchers/result.ts:111](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/result.ts#L111)

Assert that a Result is Err, optionally checking the error.

## Example

```typescript
import { expect } from 'vitest'
import { ok, err } from 'receta/result'

expect(err('fail')).toBeErr()          // Pass
expect(err('fail')).toBeErr('fail')    // Pass
expect(err('fail')).toBeErr('other')   // Fail
expect(ok(5)).not.toBeErr()            // Pass
```
