# Function: unwrapOrElse

## When to Use
Extract value with computed/lazy default.

## Examples
```typescript
// Expensive computation
unwrapOrElse(cached, () => computeExpensiveDefault())

// Throw custom error
unwrapOrElse(required, () => {
  throw new Error('Value required')
})

// Logging
unwrapOrElse(optional, () => {
  console.warn('Using fallback')
  return fallback
})

// API fallback
unwrapOrElse(
  cachedResponse,
  () => fetchFromAPI()  // Only called if None
)
```

## Related Functions
- **Simple default**: `unwrapOr()` - when default is cheap/ready
- **Always throw**: `unwrap()` - no default
