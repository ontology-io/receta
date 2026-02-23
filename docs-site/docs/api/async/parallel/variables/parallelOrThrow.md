# Variable: parallelOrThrow()

> `const` **parallelOrThrow**: (...`args`) => `Promise`\<`unknown`[]\>

Defined in: [async/parallel/index.ts:75](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/parallel/index.ts#L75)

Throwing variant of parallel for backward compatibility.

Use this when you want exceptions instead of Result pattern.
Prefer the Result-returning parallel for better error handling.

This is implemented using the `orThrow` utility from Result module,
which converts any Result-returning function to a throwing variant.

## Parameters

### args

...\[readonly () => `Promise`\<`unknown`\>[], [`ConcurrencyOptions`](../../types/interfaces/ConcurrencyOptions.md)\]

## Returns

`Promise`\<`unknown`[]\>

Promise resolving to array of results

## Throws

Error if any task fails

## Example

```typescript
// Equivalent to using orThrow directly
const parallelOrThrow = orThrow(parallel)
```

## See

 - parallel - Result-returning variant (recommended)
 - orThrow - utility for creating throwing variants
