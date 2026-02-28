# Function: tryCatch

## When to Use
Wrap code that might throw, converting to Option (ignoring error details).

## Examples
```typescript
// Parse without error details
tryCatch(() => JSON.parse(str))
// Success => Some(parsed)
// Throws  => None

// When error info not needed
const parsed = tryCatch(() => parseInt(input))

// vs Result.tryCatch when you need errors
Result.tryCatch(() => parse(str))  // Keeps error
Option.tryCatch(() => parse(str))  // Discards error
```

## Related Functions
- **With errors**: `Result.tryCatch()` - when you need error info
- **From nullable**: `fromNullable()` - when code returns null/undefined
