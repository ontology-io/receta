# Function: err

## When to Use
Create a failed Result when you have an error to communicate.

## Decision Tree
```
Do you have an error to represent?
│
├─ YES, explicit error case
│  │
│  ├─ Simple error message? ────────────────► err('message')
│  │
│  ├─ Structured error object? ─────────────► err({ code, message, ... })
│  │
│  └─ Caught exception? ────────────────────► err(error) or mapErr()
│
├─ Code might throw an exception
│  └─ Use: tryCatch() instead
│
└─ NO error, have value
    └─ Use: ok() instead
```

## Examples
```typescript
// Simple string error
err('Not found')  // => Err('Not found')

// Structured error
err({
  code: 'VALIDATION_ERROR',
  field: 'email',
  message: 'Invalid email format'
})

// Custom error types
type AuthError = { type: 'UNAUTHORIZED' } | { type: 'FORBIDDEN' }
err({ type: 'UNAUTHORIZED' })  // => Err({ type: 'UNAUTHORIZED' })

// In validation
function validateEmail(email: string): Result<string, string> {
  return email.includes('@')
    ? ok(email)
    : err('Invalid email format')
}
```

## Related Functions
- **Alternative**: `ok()` - when you have a success value
- **Complement**: `isErr()` - to check if a Result is Err
- **Transform**: `mapErr()` - to transform error values
- **Wrapper**: `tryCatch()` - when catching thrown exceptions

## Type Signature
```typescript
function err<E>(error: E): Result<never, E>
```

## Error Design Patterns

### String Errors (Simple)
```typescript
err('File not found')
err('Invalid input')
```
**Use when**: Simple, human-readable errors suffice

### Discriminated Unions (Recommended)
```typescript
type FetchError =
  | { type: 'NETWORK_ERROR', cause: unknown }
  | { type: 'NOT_FOUND', id: string }
  | { type: 'TIMEOUT', duration: number }

err({ type: 'NETWORK_ERROR', cause: networkError })
```
**Use when**: Need to handle different error cases differently

### Error Objects
```typescript
err(new Error('Something went wrong'))
err({ code: 'ERR_001', message: '...' })
```
**Use when**: Need stack traces or standard Error interface

## Common Mistakes
❌ **Throwing instead**: `throw new Error()` - breaks Result pattern
❌ **Returning null**: `return null` - use Option or Result
❌ **Empty errors**: `err()` - always provide error information

✅ **Do provide context**: Error should explain what went wrong and why
