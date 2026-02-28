# Function: fromNullable

## When to Use
Convert nullable value (null/undefined) to Option.

## Decision Tree
```
Have a value that might be null/undefined?
│
├─ YES, from nullable API ─────────────────────────► fromNullable(value)
│
├─ Already know it's present ──────────────────────► Use some() directly
│
└─ Already know it's absent ────────────────────────► Use none() directly
```

## Examples
```typescript
// Convert nullable to Option
fromNullable(maybeValue)
// value = 42     => Some(42)
// value = null   => None
// value = undefined => None

// Array find
fromNullable(users.find(u => u.id === id))

// Object property access
fromNullable(config.apiKey)

// Environment variables
fromNullable(process.env.API_KEY)

// In pipe
pipe(
  searchResults,
  (results) => results[0],
  fromNullable,
  map(result => result.title)
)

// localStorage
fromNullable(localStorage.getItem('token'))
```

## Related Functions
- **Explicit constructors**: `some()`, `none()` - when you know the state
- **From Result**: `fromResult()` - convert Result to Option (loses error info)
- **To nullable**: `toNullable()` - convert back to T | null
