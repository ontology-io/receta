# Function: testMonadLaws()

> **testMonadLaws**\<`M`, `A`\>(`config`): `void`

Defined in: [testing/laws/monad.ts:66](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/laws/monad.ts#L66)

Test that a monad implementation satisfies monad laws.

This function generates test suites that verify:
- Left Identity: `flatMap(of(a), f) === f(a)`
- Right Identity: `flatMap(ma, of) === ma`
- Associativity: `flatMap(flatMap(ma, f), g) === flatMap(ma, x => flatMap(f(x), g))`

## Type Parameters

### M

`M`

### A

`A`

## Parameters

### config

[`MonadLawConfig`](../../types/interfaces/MonadLawConfig.md)\<`M`, `A`\>

Configuration specifying the monad and test cases

## Returns

`void`

## Example

```typescript
import { testMonadLaws } from 'receta-test/laws'
import { ok, err } from 'receta/result'
import * as Result from 'receta/result'

describe('Result', () => {
  testMonadLaws({
    type: 'Result',
    of: ok,
    flatMap: Result.flatMap,
    testCases: [
      {
        value: 5,
        functions: [
          (x: number) => ok(x * 2),
          (x: number) => x > 0 ? ok(x) : err('negative')
        ]
      }
    ]
  })
})
```
