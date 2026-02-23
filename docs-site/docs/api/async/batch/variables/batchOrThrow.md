# Variable: batchOrThrow()

> `const` **batchOrThrow**: (...`args`) => `Promise`\<`unknown`[]\>

Defined in: [async/batch/index.ts:168](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/batch/index.ts#L168)

Throwing variant of batch for backward compatibility.

Use this when you want exceptions instead of Result pattern.
Prefer the Result-returning batch for better error handling.

## Parameters

### args

...\[readonly `unknown`[], (`batch`) => `Promise`\<`unknown`\>, [`BatchOptions`](../../types/interfaces/BatchOptions.md)\]

## Returns

`Promise`\<`unknown`[]\>

Promise resolving to array of all results

## Throws

BatchError if any batch processing fails

## Example

```typescript
// Throws on error
try {
  const results = await batchOrThrow(
    users,
    async (userBatch) => db.users.insertMany(userBatch),
    { batchSize: 50 }
  )
} catch (error) {
  console.error('Batch failed:', error)
}
```

## See

 - batch - Result-returning variant (recommended)
 - orThrow - utility for creating throwing variants
