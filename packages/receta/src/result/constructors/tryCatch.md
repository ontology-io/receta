# Function: tryCatch

## When to Use
Wrap synchronous code that might throw exceptions into a Result.

## Decision Tree
```
Do you have code that might throw?
│
├─ YES, synchronous code
│  │
│  ├─ Want to catch and transform error? ──────────► tryCatch(fn, errorMapper)
│  │
│  └─ Just wrap the exception? ────────────────────► tryCatch(fn)
│
├─ NO, it returns Result already
│  └─ Just use it directly
│
└─ Code is ASYNC (returns Promise)
    └─ Use: tryCatchAsync() instead
```

## Examples
```typescript
// Basic usage - JSON parsing
const result = tryCatch(() => JSON.parse(jsonString))
// => Result<any, unknown>

// With error mapper
const result = tryCatch(
  () => JSON.parse(jsonString),
  (error) => ({ type: 'PARSE_ERROR' as const, cause: error })
)
// => Result<any, { type: 'PARSE_ERROR', cause: unknown }>

// File reading (Node.js sync)
const content = tryCatch(() => fs.readFileSync('config.json', 'utf8'))

// Division by zero
function safeDivide(a: number, b: number): Result<number, string> {
  return tryCatch(
    () => {
      if (b === 0) throw new Error('Division by zero')
      return a / b
    },
    (e) => e instanceof Error ? e.message : 'Unknown error'
  )
}

// In pipe
pipe(
  inputString,
  (str) => tryCatch(() => JSON.parse(str)),
  map(extractData),
  unwrapOr([])
)
```

## Related Functions
- **Async version**: `tryCatchAsync()` - for async/Promise code
- **Manual creation**: `ok()` / `err()` - when not catching exceptions
- **Error transform**: `mapErr()` - to transform errors after creation

## Type Signature
```typescript
function tryCatch<T, E = unknown>(
  fn: () => T,
  onError?: (error: unknown) => E
): Result<T, E>
```

## Patterns

### Pattern 1: JSON Parsing
```typescript
tryCatch(() => JSON.parse(str))
  .map(validateSchema)
  .mapErr(() => 'Invalid JSON or schema')
```

### Pattern 2: Third-party Library Calls
```typescript
// Wrap libraries that throw
tryCatch(() => someLibrary.parse(input))
```

### Pattern 3: Type-safe Error Handling
```typescript
type ParseError = { type: 'SYNTAX_ERROR', line: number }

const result = tryCatch(
  () => parser.parse(code),
  (e): ParseError => ({
    type: 'SYNTAX_ERROR',
    line: e instanceof SyntaxError ? e.lineNumber : 0
  })
)
```

## When NOT to Use

❌ **Async code**: Use `tryCatchAsync()` instead
```typescript
// Wrong
tryCatch(() => fetch(url))  // Returns Promise, not Result!

// Right
await tryCatchAsync(() => fetch(url))
```

❌ **Code that returns Result**: Don't double-wrap
```typescript
// Wrong
tryCatch(() => someFunction())  // If someFunction returns Result<T, E>

// Right
someFunction()  // Just use it directly
```

❌ **Expected control flow**: Use explicit Result construction
```typescript
// Wrong - using throw for control flow
tryCatch(() => {
  if (age < 18) throw new Error('Too young')
  return age
})

// Right - explicit Result
age < 18 ? err('Too young') : ok(age)
```

## Common Mistakes

❌ **Not handling error type**
```typescript
tryCatch(() => parse(str))  // E = unknown
```

✅ **Transform to known error type**
```typescript
tryCatch(
  () => parse(str),
  (e) => ({ type: 'PARSE_ERROR', cause: e })
)  // E = { type: 'PARSE_ERROR', cause: unknown }
```
