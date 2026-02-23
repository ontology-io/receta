# Variable: sequentialOrThrow()

> `const` **sequentialOrThrow**: (...`args`) => `Promise`\<`unknown`[]\>

Defined in: [async/sequential/index.ts:115](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/sequential/index.ts#L115)

Throwing variant of sequential for backward compatibility.

Use this when you want exceptions instead of Result pattern.
Prefer the Result-returning sequential for better error handling.

## Parameters

### args

...\[readonly () => `Promise`\<`unknown`\>[]\]

## Returns

`Promise`\<`unknown`[]\>

Promise resolving to array of results

## Throws

SequentialError if any task fails

## Example

```typescript
// Throws on error
try {
  const results = await sequentialOrThrow([
    () => createUser({ name: 'Alice' }),
    () => createPost({ title: 'Hello' }),
    () => publishPost({ id: 1 }),
  ])
} catch (error) {
  console.error('Task failed:', error)
}
```

## See

 - sequential - Result-returning variant (recommended)
 - orThrow - utility for creating throwing variants
