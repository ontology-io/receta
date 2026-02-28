# Function: isSome

## When to Use
Type guard to check if Option is Some.

## Examples
```typescript
const option = fromNullable(value)

if (isSome(option)) {
  console.log(option.value)  // TypeScript knows it's Some<T>
}

// Filter array
options.filter(isSome).map(o => o.value)
```

## Related Functions
- **Opposite**: `isNone()` - check if None
- **Pattern match**: `match()` - handle both inline
