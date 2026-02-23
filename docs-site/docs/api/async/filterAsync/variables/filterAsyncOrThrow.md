# Variable: filterAsyncOrThrow

> `const` **filterAsyncOrThrow**: `never`

Defined in: [async/filterAsync/index.ts:152](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/filterAsync/index.ts#L152)

Throwing variant of filterAsync for backward compatibility.

Use this when you want exceptions instead of Result pattern.
Prefer the Result-returning filterAsync for better error handling.

## Param

Array of items to filter

## Param

Async function that returns true to keep the item

## Param

Concurrency options

## Returns

Promise resolving to filtered array

## Throws

FilterAsyncError if any predicate evaluation fails

## Example

```typescript
// Throws on error
try {
  const existingUsers = await filterAsyncOrThrow(
    userIds,
    async (id) => {
      const res = await fetch(`/api/users/${id}`)
      return res.ok
    },
    { concurrency: 5 }
  )
} catch (error) {
  console.error('Filter failed:', error)
}
```

## See

 - filterAsync - Result-returning variant (recommended)
 - orThrow - utility for creating throwing variants
