# Function: unwrapOr

## When to Use
Extract value from Result, providing a default for Err case.

## Decision Tree
```
Need to get the value out of a Result?
│
├─ Have a default value ready ─────────────────────► unwrapOr(result, default)
│
├─ Need to compute default ────────────────────────► Use unwrapOrElse() instead
│
├─ Want to throw on error ─────────────────────────► Use unwrap() instead
│
└─ Need to handle both cases differently ──────────► Use match() instead
```

## Examples
```typescript
// With literal default
unwrapOr(parseNumber('42'), 0)  // => 42
unwrapOr(parseNumber('abc'), 0)  // => 0 (default)

// With object default
unwrapOr(fetchUser(id), { id: 0, name: 'Guest' })

// In pipe
pipe(
  getConfig(),
  map(c => c.timeout),
  unwrapOr(30000)  // Default timeout
)

// Common pattern: Optional features
const features = unwrapOr(loadFeatureFlags(), {
  newUI: false,
  betaFeatures: false
})
```

## Related Functions
- **Computed default**: `unwrapOrElse()` - when default needs calculation
- **Throw on error**: `unwrap()` - when error should crash
- **Handle both**: `match()` - for different handling of Ok/Err
