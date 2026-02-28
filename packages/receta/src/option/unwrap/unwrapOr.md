# Function: unwrapOr

## When to Use
Extract value from Option, providing default for None.

## Decision Tree
```
Need to get the value out?
│
├─ Have default ready ─────────────────────────────► unwrapOr(option, default)
│
├─ Need to compute default ────────────────────────► Use unwrapOrElse() instead
│
├─ Want to throw on None ──────────────────────────► Use unwrap() instead
│
└─ Handle both cases differently ──────────────────► Use match() instead
```

## Examples
```typescript
// With literal default
unwrapOr(some(42), 0)  // => 42
unwrapOr(none(), 0)    // => 0

// Configuration
const timeout = unwrapOr(getConfig('timeout'), 30000)

// User preferences
const theme = unwrapOr(getUserTheme(), 'light')

// In pipe
pipe(
  findUser(id),
  map(u => u.name),
  unwrapOr('Anonymous')
)

// Array operations
const first = <T>(arr: T[], default: T) =>
  unwrapOr(fromNullable(arr[0]), default)
```

## Related Functions
- **Computed default**: `unwrapOrElse()` - lazy evaluation
- **Throw on None**: `unwrap()` - when None is unexpected
- **Pattern match**: `match()` - different handling for Some/None
