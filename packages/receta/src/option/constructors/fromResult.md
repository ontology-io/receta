# Function: fromResult

## When to Use
Convert Result to Option, discarding error information.

## Examples
```typescript
// When error details don't matter
pipe(
  parseJSON(input),
  fromResult,
  map(data => data.value)
)  // => Option<any>

// Multiple Results to Options
results.map(fromResult).filter(isSome)
```

## Related Functions
- **To Result**: `toResult()` - opposite conversion
- **Keep errors**: Don't convert if you need error info
