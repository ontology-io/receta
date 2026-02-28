# Function: isErr

## When to Use
Type guard to check if a Result is Err (narrows type).

## Examples
```typescript
if (isErr(result)) {
  console.log(result.error)  // TypeScript knows it's Err<E>
}

// Filter failures
const failures = results.filter(isErr)
```

## Related Functions
- **Opposite**: `isOk()`
- **Pattern match**: `match()`
