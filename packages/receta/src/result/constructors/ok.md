# Function: ok

## When to Use
Create a successful Result when you have a valid value to wrap.

## Decision Tree
```
Do you have a value that represents success?
│
├─ YES, and it's NOT a Result already
│  └─ Use: ok(value)
│      Returns: Result<T, never>
│
├─ It's already a Result
│  └─ Don't wrap it again! Already a Result
│
└─ NO, I have an error
    └─ Use: err() instead
```

## Examples
```typescript
// Simple success
ok(42)  // => Ok(42)
ok({ id: 1, name: 'Alice' })  // => Ok({ id: 1, name: 'Alice' })

// After validation
function validateAge(age: number): Result<number, string> {
  return age >= 18 ? ok(age) : err('Must be 18 or older')
}

// In pipe
pipe(
  getUserInput(),
  (input) => input.length > 0 ? ok(input) : err('Empty input')
)
```

## Related Functions
- **Alternative**: `err()` - when you have an error instead
- **Complement**: `isOk()` - to check if a Result is Ok
- **Wrapper**: `tryCatch()` - when code might throw instead of returning Result

## Type Signature
```typescript
function ok<T>(value: T): Result<T, never>
```

## Common Mistakes
❌ **Don't wrap Results**: `ok(ok(value))` creates nested Results
❌ **Don't use for nullable**: Use `Option.some()` or `fromNullable()` instead

✅ **Do use for**: Explicit success values, after checks/validation
