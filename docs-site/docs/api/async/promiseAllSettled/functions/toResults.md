# Function: toResults()

> **toResults**\<`T`, `E`\>(`results`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>[]

Defined in: [async/promiseAllSettled/index.ts:220](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/promiseAllSettled/index.ts#L220)

Converts settled results to Result array for composability.

Transforms native PromiseSettledResult into Receta's Result type,
enabling composition with Result utilities (map, flatMap, etc.).

## Type Parameters

### T

`T`

### E

`E` = `unknown`

## Parameters

### results

readonly `PromiseSettledResult`\<`T`\>[]

Array of settled promise results

## Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>[]

Array of Result values

## Examples

```typescript
import * as R from 'remeda'
import { map, unwrapOr } from 'receta/result'

const results = await promiseAllSettled([
  fetchUser(1),
  fetchUser(999), // fails
])

const userResults = toResults(results)
const names = R.pipe(
  userResults,
  R.map((r) => map(r, (user) => user.name)),
  R.map((r) => unwrapOr(r, 'Unknown'))
)
// => ['John', 'Unknown']
```

```typescript
import { partition } from 'receta/result'

const results = await promiseAllSettled([
  fetchUser(1),
  fetchUser(2),
  fetchUser(999),
])

const [successes, failures] = partition(toResults(results))
console.log(`${successes.length} succeeded, ${failures.length} failed`)
```

```typescript
// Compose with validation
import { flatMap } from 'receta/result'
import { validate } from 'receta/validation'

const results = await promiseAllSettled(
  urls.map((url) => fetch(url).then(r => r.json()))
)

const validated = R.pipe(
  toResults(results),
  R.map((r) => flatMap(r, (data) => validateSchema(userSchema, data)))
)
```
