# Function: isNone

## When to Use
Type guard to check if Option is None.

## Examples
```typescript
if (isNone(result)) {
  console.log('No value found')
}

// Filter out missing values
const missing = options.filter(isNone)
```

## Related Functions
- **Opposite**: `isSome()` - check if Some
