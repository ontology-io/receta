# Function: sleep

## When to Use
Delay execution for specified milliseconds.

## Examples
```typescript
// Delay between operations
await sleep(1000)  // Wait 1 second

// Rate limiting
for (const item of items) {
  await processItem(item)
  await sleep(100)  // 100ms between items
}

// Retry with delay
await sleep(2000)
await retryOperation()

// Used internally by retry() for backoff
```

## Related Functions
- **Retry**: `retry()` - includes sleep internally
- **Debounce**: `debounce()` - delay based on activity
