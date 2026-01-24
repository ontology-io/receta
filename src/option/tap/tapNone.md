# Function: tapNone

## When to Use
Perform side effects when Option is None.

## Examples
```typescript
pipe(
  findUser(id),
  tapNone(() => console.warn('User not found')),
  tapNone(() => metrics.increment('user_not_found')),
  unwrapOr(guestUser)
)
```

## Related Functions
- **On Some**: `tap()` - side effect when Some
