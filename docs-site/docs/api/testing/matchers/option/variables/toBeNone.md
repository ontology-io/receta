# Variable: toBeNone

> `const` **toBeNone**: `MatcherFunction`

Defined in: [testing/matchers/option.ts:107](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/matchers/option.ts#L107)

Assert that an Option is None.

## Example

```typescript
import { expect } from 'vitest'
import { some, none } from 'receta/option'

expect(none()).toBeNone()          // Pass
expect(some(5)).not.toBeNone()     // Pass
```
