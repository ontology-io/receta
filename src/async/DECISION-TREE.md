# Async Module Decision Tree

## When to Use
Async operations with concurrency control, error handling, retries, timeouts, and rate limiting.

## Function Selection
```
START: What async problem are you solving?
│
├─ Control CONCURRENCY?
│  ├─ Process array with limit ──────────────────► mapAsync(), filterAsync()
│  ├─ Run all in parallel ───────────────────────► parallel()
│  └─ Run one after another ─────────────────────► sequential()
│
├─ Handle ERRORS with Result?
│  ├─ Retry failed operations ───────────────────► retry()
│  ├─ Timeout promises ──────────────────────────► timeout()
│  └─ Wrap async throwing code ──────────────────► Result.tryCatchAsync()
│
├─ RATE LIMITING?
│  ├─ Debounce rapid calls ───────────────────────► debounce()
│  └─ Throttle to max rate ──────────────────────► throttle()
│
├─ POLLING?
│  └─ Poll until condition ───────────────────────► poll()
│
└─ BATCHING?
    └─ Process in batches ────────────────────────► batch()
```

## Key Functions
- `retry()` - Retry with exponential backoff, returns Result
- `timeout()` - Add timeout to Promise, returns Result
- `mapAsync()` - Process array with concurrency control
- `debounce()` - Delay until quiet period
- `throttle()` - Limit rate of execution
