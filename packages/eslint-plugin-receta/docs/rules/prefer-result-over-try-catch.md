# prefer-result-over-try-catch

Prefer `Result.tryCatch()` over try-catch blocks for error handling.

## Rule Details

This rule enforces using Receta's `Result` type instead of traditional try-catch blocks for explicit, composable error handling.

**Why?**

- ✅ Errors as values — No hidden control flow with exceptions
- ✅ Type-safe — Error types are explicit in function signatures
- ✅ Composable — Results can be chained with `map`, `flatMap`, etc.
- ✅ Consistent — Team-wide error handling pattern

## Examples

### ❌ Incorrect

```typescript
function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    throw e
  }
}

function fetchData(url: string) {
  try {
    return fetch(url)
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

### ✅ Correct

```typescript
import { Result } from 'receta/result'

function parseJSON(str: string): Result<any, SyntaxError> {
  return Result.tryCatch(() => JSON.parse(str))
}

function fetchData(url: string): Promise<Result<Response, Error>> {
  return Result.tryCatchAsync(() => fetch(url))
}
```

## When Not To Use

This rule only applies to **simple** try-catch blocks. Complex error handling logic should be refactored manually:

```typescript
// Complex error handling — Rule won't autofix
function complexHandler() {
  try {
    const data = processData()
    logSuccess(data)
    return data
  } catch (e) {
    logger.error('Failed to process', e)
    cleanup()
    notifyAdmin(e)
    throw new CustomError('Processing failed', { cause: e })
  }
}
```

For complex cases, manually refactor using Result combinators:

```typescript
import { Result, mapErr } from 'receta/result'

function complexHandler(): Result<Data, CustomError> {
  return pipe(
    Result.tryCatch(() => processData()),
    Result.tap(logSuccess),
    Result.mapErr(e => {
      logger.error('Failed to process', e)
      cleanup()
      notifyAdmin(e)
      return new CustomError('Processing failed', { cause: e })
    })
  )
}
```

## Options

This rule has no options.

## Further Reading

- [Result Module Documentation](../../../docs/modules/result/README.md)
- [Error Handling Guide](../../../docs/guides/error-handling.md)
