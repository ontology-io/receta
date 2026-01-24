# Function: tapErr

## When to Use
Perform side effects on Err values without changing the Result.

## Examples
```typescript
pipe(
  fetchUser(id),
  tapErr(error => console.error('Failed:', error)),
  tapErr(error => reportToSentry(error)),
  mapErr(e => 'User fetch failed')
)
```

## Related Functions
- **Side effect on Ok**: `tap()` - for success case
- **Transform error**: `mapErr()` - when you need to change the error
