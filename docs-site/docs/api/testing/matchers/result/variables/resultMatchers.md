# Variable: resultMatchers

> `const` **resultMatchers**: `object`

Defined in: [testing/matchers/result.ts:229](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/result.ts#L229)

All Result matchers as a single object for easy extension.

## Type Declaration

### toBeErr

> **toBeErr**: `MatcherFunction`

Assert that a Result is Err, optionally checking the error.

#### Example

```typescript
import { expect } from 'vitest'
import { ok, err } from 'receta/result'

expect(err('fail')).toBeErr()          // Pass
expect(err('fail')).toBeErr('fail')    // Pass
expect(err('fail')).toBeErr('other')   // Fail
expect(ok(5)).not.toBeErr()            // Pass
```

### toBeOk

> **toBeOk**: `MatcherFunction`

Assert that a Result is Ok, optionally checking the value.

#### Example

```typescript
import { expect } from 'vitest'
import { ok, err } from 'receta/result'

expect(ok(5)).toBeOk()           // Pass
expect(ok(5)).toBeOk(5)          // Pass
expect(ok(5)).toBeOk(10)         // Fail
expect(err('fail')).not.toBeOk() // Pass
```

### toEqualResult

> **toEqualResult**: `MatcherFunction`

Deep equality check for Result types.

#### Example

```typescript
import { expect } from 'vitest'
import { ok, err } from 'receta/result'

expect(ok(5)).toEqualResult(ok(5))           // Pass
expect(err('fail')).toEqualResult(err('fail')) // Pass
expect(ok(5)).toEqualResult(ok(10))          // Fail
expect(ok(5)).toEqualResult(err('fail'))     // Fail
```

## Example

```typescript
import { expect } from 'vitest'
import { resultMatchers } from 'receta-test/matchers'

expect.extend(resultMatchers)
```
