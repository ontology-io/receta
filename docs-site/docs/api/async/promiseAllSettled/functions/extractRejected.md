# Function: extractRejected()

> **extractRejected**\<`T`\>(`results`): `T`[]

Defined in: [async/promiseAllSettled/index.ts:152](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/promiseAllSettled/index.ts#L152)

Extracts all rejection reasons from settled results.

Filters out fulfilled promises and returns only error reasons.
Useful for logging or analyzing failures.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### results

readonly `PromiseSettledResult`\<`any`\>[]

Array of settled promise results

## Returns

`T`[]

Array of rejection reasons only

## Examples

```typescript
const results = await promiseAllSettled([
  Promise.resolve(1),
  Promise.reject(new Error('Network error')),
  Promise.reject(new Error('Timeout')),
])

const errors = extractRejected(results)
// => [Error('Network error'), Error('Timeout')]

errors.forEach((err) => console.error('Failed:', err.message))
```

```typescript
// Track failed operations
const results = await promiseAllSettled(
  userIds.map((id) => deleteUser(id))
)

const failures = extractRejected(results)
if (failures.length > 0) {
  console.warn(`${failures.length} deletions failed:`, failures)
}
```
