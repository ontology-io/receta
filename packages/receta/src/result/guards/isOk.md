# Function: isOk

## When to Use
Type guard to check if a Result is Ok (narrows type).

## Decision Tree
```
Need to check Result type?
│
├─ Check if Ok (success) ──────────────────────────► isOk(result)
├─ Check if Err (failure) ─────────────────────────► Use isErr() instead
├─ Handle both cases ──────────────────────────────► Use match() instead
└─ Just need value ────────────────────────────────► Use unwrapOr() instead
```

## Examples
```typescript
const result = parseJSON(input)

if (isOk(result)) {
  console.log(result.value)  // TypeScript knows it's Ok<T>
} else {
  console.log(result.error)  // TypeScript knows it's Err<E>
}

// Filter array of Results
results.filter(isOk).map(r => r.value)
```

## Related Functions
- **Opposite**: `isErr()` - checks if Result is Err
- **Pattern match**: `match()` - handle both cases inline
