# Function: promiseAllSettled()

> **promiseAllSettled**\<`T`\>(`promises`): `Promise`\<`PromiseSettledResult`\<`T`\>[]\>

Defined in: [async/promiseAllSettled/index.ts:68](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/promiseAllSettled/index.ts#L68)

Typed wrapper around Promise.allSettled with better type inference.

Unlike Promise.all (which fails fast on first rejection), this waits for
all promises to settle (fulfill or reject) before returning results.
Provides helper functions to extract fulfilled/rejected values.

## Type Parameters

### T

`T`

## Parameters

### promises

readonly `Promise`\<`T`\>[]

Array of promises to settle

## Returns

`Promise`\<`PromiseSettledResult`\<`T`\>[]\>

Promise resolving to array of settled results

## Examples

```typescript
// Basic usage
const results = await promiseAllSettled([
  fetch('/api/users/1'),
  fetch('/api/users/2'),
  fetch('/api/users/999'), // might fail
])

results.forEach((result) => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value)
  } else {
    console.log('Error:', result.reason)
  }
})
```

```typescript
// Extract only successful results
const results = await promiseAllSettled([
  fetchUser(1),
  fetchUser(2),
  fetchUser(999), // fails
])

const users = extractFulfilled(results)
// => [User1, User2] (failed one excluded)
```

```typescript
// Convert to Result pattern for composability
import * as R from 'remeda'
import { map, unwrapOr } from 'receta/result'

const results = await promiseAllSettled([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3),
])

const resultArray = toResults(results)
const usernames = R.pipe(
  resultArray,
  R.map((r) => map(r, (user) => user.name)),
  R.map((r) => unwrapOr(r, 'Unknown'))
)
// => ['John', 'Jane', 'Unknown']
```

## See

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
