# Function: testFunctorLaws()

> **testFunctorLaws**\<`F`, `A`\>(`config`): `void`

Defined in: [testing/laws/functor.ts:62](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/laws/functor.ts#L62)

Test that a functor implementation satisfies functor laws.

This function generates test suites that verify:
- Identity law: `map(fa, x => x) === fa`
- Composition law: `map(map(fa, f), g) === map(fa, x => g(f(x)))`

## Type Parameters

### F

`F`

### A

`A`

## Parameters

### config

[`FunctorLawConfig`](../../types/interfaces/FunctorLawConfig.md)\<`F`, `A`\>

Configuration specifying the functor and test cases

## Returns

`void`

## Example

```typescript
import { testFunctorLaws } from 'receta-test/laws'
import { ok } from 'receta/result'
import * as Result from 'receta/result'

describe('Result', () => {
  testFunctorLaws({
    type: 'Result',
    of: ok,
    map: Result.map,
    testCases: [
      { value: 5, transforms: [x => x * 2, x => x + 1] },
      { value: 'hello', transforms: [s => s.toUpperCase(), s => s.length] }
    ]
  })
})
```
