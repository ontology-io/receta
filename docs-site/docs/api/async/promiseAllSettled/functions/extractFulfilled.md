# Function: extractFulfilled()

> **extractFulfilled**\<`T`\>(`results`): `T`[]

Defined in: [async/promiseAllSettled/index.ts:106](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/promiseAllSettled/index.ts#L106)

Extracts all fulfilled values from settled results.

Filters out rejected promises and returns only successful values.
Useful when you want to process partial results even if some promises failed.

## Type Parameters

### T

`T`

## Parameters

### results

readonly `PromiseSettledResult`\<`T`\>[]

Array of settled promise results

## Returns

`T`[]

Array of fulfilled values only

## Examples

```typescript
const results = await promiseAllSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3),
])

const values = extractFulfilled(results)
// => [1, 3]
```

```typescript
// Process partial API results
const results = await promiseAllSettled(
  userIds.map((id) => fetchUser(id))
)

const successfulUsers = extractFulfilled(results)
console.log(`Fetched ${successfulUsers.length} of ${userIds.length} users`)
```
