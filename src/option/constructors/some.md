# Function: some

## When to Use
Create an Option with a present value.

## Decision Tree
```
Do you have a value that exists?
│
├─ YES, value is present ──────────────────────────► some(value)
│
├─ Value might be null/undefined ──────────────────► Use fromNullable() instead
│
└─ NO value (representing absence) ────────────────► Use none() instead
```

## Examples
```typescript
// Simple value
some(42)  // => Some(42)
some('hello')  // => Some('hello')
some({ id: 1 })  // => Some({ id: 1 })

// After checking
function findFirst<T>(arr: T[]): Option<T> {
  return arr.length > 0 ? some(arr[0]) : none()
}

// In pipe
pipe(
  getUserInput(),
  (input) => input.length > 0 ? some(input) : none()
)
```

## Related Functions
- **Absence**: `none()` - when there's no value
- **From nullable**: `fromNullable()` - auto-converts null/undefined to none
- **Type guard**: `isSome()` - check if Option is Some
