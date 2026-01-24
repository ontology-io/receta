# Function: tryCatchAsync

## When to Use
Wrap async code (Promises) that might throw into a Result.

## Decision Tree
```
Have async code that might throw?
│
├─ YES, returns Promise ────────────────────────────► await tryCatchAsync(fn)
├─ NO, synchronous code ────────────────────────────► Use tryCatch() instead
└─ Already returns Result ──────────────────────────► Just await it
```

## Examples
```typescript
// Fetch API
await tryCatchAsync(() => fetch('/api/users'))

// File I/O
await tryCatchAsync(() => fs.promises.readFile('config.json'))

// With error mapping
await tryCatchAsync(
  () => fetch(url),
  (e) => ({ type: 'NETWORK_ERROR', cause: e })
)
```

## Related Functions
- **Sync version**: `tryCatch()` - for non-async code
- **With retry**: `async.retry()` - automatically retries and returns Result
- **With timeout**: `async.timeout()` - adds timeout to Promise
