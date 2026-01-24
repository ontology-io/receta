# Function: unwrapOrElse

## When to Use
Extract value with computed/lazy default (e.g., expensive operation, uses error info).

## Examples
```typescript
// Expensive default computation
unwrapOrElse(cached, () => computeExpensiveDefault())

// Using error information
unwrapOrElse(result, (error) => {
  console.warn('Failed:', error)
  return fallback
})

// Throw custom error
unwrapOrElse(result, (e) => {
  throw new CustomError(`Failed: ${e}`)
})
```

## Related Functions
- **Simple default**: `unwrapOr()` - when default is ready
- **Always throw**: `unwrap()` - no default
