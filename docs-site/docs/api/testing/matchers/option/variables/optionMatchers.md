# Variable: optionMatchers

> `const` **optionMatchers**: `object`

Defined in: [testing/matchers/option.ts:206](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/matchers/option.ts#L206)

All Option matchers as a single object for easy extension.

## Type Declaration

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

## Example

```typescript
import { expect } from 'vitest'
import { optionMatchers } from 'receta-test/matchers'

expect.extend(optionMatchers)
```
