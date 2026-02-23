# Variable: mapAsyncOrThrow

> `const` **mapAsyncOrThrow**: `never`

Defined in: [async/mapAsync/index.ts:201](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/mapAsync/index.ts#L201)

Throwing variant of mapAsync for backward compatibility.

Use this when you want exceptions instead of Result pattern.
Prefer the Result-returning mapAsync for better error handling.

This is implemented using the `orThrow` utility from Result module,
which converts any Result-returning function to a throwing variant.

## Param

Array of items to map over

## Param

Async function to apply to each item

## Param

Concurrency options

## Returns

Promise resolving to array of results

## Throws

MapAsyncError if any mapper function fails

## Example

```typescript
// Throws on error
try {
  const users = await mapAsyncOrThrow(
    userIds,
    async (id) => fetchUser(id),
    { concurrency: 5 }
  )
} catch (error) {
  console.error('Failed:', error)
}

// Equivalent to using orThrow directly
const mapAsyncOrThrow = orThrow(mapAsync)
```

## See

 - mapAsync - Result-returning variant (recommended)
 - orThrow - utility for creating throwing variants
