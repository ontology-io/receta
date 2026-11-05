# prefer-result-over-try-catch

Prefer `tryCatch()` over try-catch blocks for error handling.

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
import { tryCatch, tryCatchAsync, type Result } from '@ontologyio/receta/result'

function parseJSON(str: string): Result<any, SyntaxError> {
  return tryCatch(() => JSON.parse(str))
}

function fetchData(url: string): Promise<Result<Response, Error>> {
  return tryCatchAsync(() => fetch(url))
}
```

## What Is Reported

Every `try` with a `catch` is reported, whether or not the rule can fix it. There are three exceptions:

- **`try`/`finally` with no `catch`** — It handles no error, so there is nothing to replace.
- **A `catch` that already returns a failure value** — `return err(...)`, `return none()` or `return invalid(...)` on at least one path. The exception stops there, which is the point of the rule.
- **An entry point guard** — A `catch` that ends the program with `throw` or `process.exit()`, at module scope, in a function named `main` or in a top-level IIFE. Nothing above it could receive a `Result`.

```typescript
// Not reported: there is no caller to hand a Result to
async function main() {
  try {
    await start()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
```

## Autofix Behavior

A fix is offered only when the rewrite keeps everything the `try` statement does. All of these must hold:

- The `try` block is one `return` with a value
- The `catch` is empty or only rethrows what it caught, because logging or wrapping the error would be lost
- There is no `finally` block and no comment inside the statement
- The `try` statement is the last statement of a function that is neither `async` nor a generator
- The returned value is not an object literal or a comma expression
- The name `result` is not already taken

The rewritten function returns a `Result` instead of throwing, so its callers need updating. Run `tsc` after `--fix` to find them.

Anything else is reported for a manual refactor:

```typescript
// Reported, but not autofixed
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
import { mapErr, tap, tryCatch, type Result } from '@ontologyio/receta/result'

function complexHandler(): Result<Data, CustomError> {
  return pipe(
    tryCatch(() => processData()),
    tap(logSuccess),
    mapErr(e => {
      logger.error('Failed to process', e)
      cleanup()
      notifyAdmin(e)
      return new CustomError('Processing failed', { cause: e })
    })
  )
}
```

The fix leaves a function alone when it can see something pinning the return type. An explicit return type, a class method, an overload, a typed variable, a callback or a recursive call is reported without a fix, and so is a file where `tryCatch` already means something else. An aliased import is reused under its alias.

The fix can't see every caller, so update them afterwards. In plain JavaScript, nothing will flag one you miss.

## Options

This rule has no options.

## Further Reading

- [Result Module Documentation](../../../docs/modules/result/README.md)
- [Error Handling Guide](../../../docs/guides/error-handling.md)
