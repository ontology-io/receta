# Variable: recetaMatchers

> `const` **recetaMatchers**: `object`

Defined in: [testing/matchers/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/index.ts#L36)

All Receta matchers combined for easy extension.

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

### toBeNone

> **toBeNone**: `MatcherFunction`

Assert that an Option is None.

#### Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(none()).toBeNone()          // Pass
expect(some(5)).not.toBeNone()     // Pass
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

### toBeSome

> **toBeSome**: `MatcherFunction`

Assert that an Option is Some, optionally checking the value.

#### Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(some(5)).toBeSome()           // Pass
expect(some(5)).toBeSome(5)          // Pass
expect(some(5)).toBeSome(10)         // Fail
expect(none()).not.toBeSome()        // Pass
```

### toEqualOption

> **toEqualOption**: `MatcherFunction`

Deep equality check for Option types.

#### Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(some(5)).toEqualOption(some(5))   // Pass
expect(none()).toEqualOption(none())     // Pass
expect(some(5)).toEqualOption(some(10))  // Fail
expect(some(5)).toEqualOption(none())    // Fail
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
import { recetaMatchers } from 'receta-test/matchers'

expect.extend(recetaMatchers)
```
