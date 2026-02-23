# Variable: toBeNone

> `const` **toBeNone**: `MatcherFunction`

Defined in: [testing/matchers/option.ts:107](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/matchers/option.ts#L107)

Assert that an Option is None.

## Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(none()).toBeNone()          // Pass
expect(some(5)).not.toBeNone()     // Pass
```
