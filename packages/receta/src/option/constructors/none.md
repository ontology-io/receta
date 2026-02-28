# Function: none

## When to Use
Create an Option representing absence (no value).

## Decision Tree
```
Do you need to represent absence?
│
├─ YES, no value present ──────────────────────────► none()
│
├─ Have a value ───────────────────────────────────► Use some() instead
│
└─ Have null/undefined ────────────────────────────► Use fromNullable() instead
```

## Examples
```typescript
// Representing absence
none()  // => None

// Database query not found
function findUser(id: string): Option<User> {
  const user = db.users.find(u => u.id === id)
  return user ? some(user) : none()
}

// Optional config
function getConfig(key: string): Option<string> {
  return config[key] ? some(config[key]) : none()
}

// Array find wrapper
const first = <T>(arr: T[]): Option<T> =>
  arr[0] !== undefined ? some(arr[0]) : none()
```

## Related Functions
- **With value**: `some()` - when value is present
- **From nullable**: `fromNullable()` - auto-converts null/undefined
- **Type guard**: `isNone()` - check if Option is None
