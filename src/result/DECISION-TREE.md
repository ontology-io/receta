# Result Module Decision Tree

## When to Use Result Module

Use Result when:
- ✅ Operations can fail and you need detailed error information
- ✅ You want explicit error handling in types
- ✅ You need to chain multiple fallible operations
- ✅ You want to avoid try/catch and throwing exceptions

Don't use Result when:
- ❌ Value is just missing (use Option instead)
- ❌ You're validating forms (use Validation for error accumulation)
- ❌ Simple null checks are sufficient

## Function Selection Decision Tree

```
START: What do you need to do with Result?
│
├─ CREATE a Result?
│  │
│  ├─ From a successful value? ────────────────────────────► ok()
│  │
│  ├─ From an error? ───────────────────────────────────────► err()
│  │
│  ├─ From code that might throw? ──────────────────────────► tryCatch()
│  │
│  ├─ From async code that might throw? ────────────────────► tryCatchAsync()
│  │
│  └─ From nullable value? ─────────────────────────────────► fromNullable()
│
├─ CHECK what type of Result you have?
│  │
│  ├─ Is it Ok? ────────────────────────────────────────────► isOk()
│  │
│  └─ Is it Err? ───────────────────────────────────────────► isErr()
│
├─ TRANSFORM a Result?
│  │
│  ├─ Transform the Ok value? ──────────────────────────────► map()
│  │
│  ├─ Transform the Err value? ─────────────────────────────► mapErr()
│  │
│  ├─ Transform to another Result (chain)? ─────────────────► flatMap()
│  │
│  └─ Flatten nested Result<Result<T, E>, E>? ─────────────► flatten()
│
├─ EXTRACT the value?
│  │
│  ├─ Get value or throw error? ────────────────────────────► unwrap()
│  │
│  ├─ Get value or provide default? ────────────────────────► unwrapOr()
│  │
│  ├─ Get value or compute default? ────────────────────────► unwrapOrElse()
│  │
│  └─ Pattern match both cases? ────────────────────────────► match()
│
├─ PERFORM side effects?
│  │
│  ├─ Side effect on Ok value? ─────────────────────────────► tap()
│  │
│  └─ Side effect on Err value? ────────────────────────────► tapErr()
│
└─ Work with MULTIPLE Results?
   │
   ├─ Convert array of Results to Result of array? ───────► collect()
   │
   └─ Split Results into separate arrays? ────────────────► partition()
```

## Common Patterns by Use Case

### API/Network Calls
```
Input: fetch() call
├─ Wrapping → tryCatchAsync()
├─ Transforming response → map()
├─ Chaining requests → flatMap()
└─ Default on error → unwrapOr()
```

### JSON Parsing
```
Input: JSON string
├─ Safe parsing → tryCatch(() => JSON.parse(str))
├─ Validating structure → flatMap(validateSchema)
└─ Using parsed data → map(), unwrapOr()
```

### File Operations
```
Input: File path
├─ Reading → tryCatchAsync(fs.readFile)
├─ Parsing → flatMap(parseContent)
├─ Transforming errors → mapErr()
└─ Extracting → unwrapOrElse()
```

### Database Queries
```
Input: Query parameters
├─ Query execution → tryCatchAsync()
├─ Not found vs error → fromNullable() then toResult()
├─ Multiple queries → collect([query1, query2])
└─ Transaction rollback → tapErr(rollback)
```

### Form Submission
```
Input: Form data
├─ Single validation error → Result
└─ Multiple validation errors → Use Validation module instead!
```

## Function Categories

### Constructors (Create Results)
- [ok.md](ok.md) - Create successful Result
- [err.md](err.md) - Create error Result
- [tryCatch.md](tryCatch.md) - Wrap throwing code
- [tryCatchAsync.md](tryCatchAsync.md) - Wrap async throwing code
- [fromNullable.md](fromNullable.md) - Convert nullable to Result

### Guards (Type Checking)
- [isOk.md](isOk.md) - Check if Result is Ok
- [isErr.md](isErr.md) - Check if Result is Err

### Transformers (Change Results)
- [map.md](map.md) - Transform Ok value
- [mapErr.md](mapErr.md) - Transform Err value
- [flatMap.md](flatMap.md) - Chain Results
- [flatten.md](flatten.md) - Flatten nested Results

### Extractors (Get Values Out)
- [unwrap.md](unwrap.md) - Extract or throw
- [unwrapOr.md](unwrapOr.md) - Extract with default
- [unwrapOrElse.md](unwrapOrElse.md) - Extract with computed default
- [match.md](match.md) - Pattern match both cases

### Side Effects (Do Something Without Changing)
- [tap.md](tap.md) - Side effect on Ok
- [tapErr.md](tapErr.md) - Side effect on Err

### Combinators (Work with Multiple Results)
- [collect.md](collect.md) - All or nothing
- [partition.md](partition.md) - Split into Oks and Errs

## Quick Decision Helpers

**"I need to..."**
- ...wrap code that throws → `tryCatch()` / `tryCatchAsync()`
- ...handle successful result → `map()`
- ...handle failed result → `mapErr()` or `tapErr()`
- ...chain operations → `flatMap()`
- ...get the value safely → `unwrapOr()` or `match()`
- ...do something without changing Result → `tap()` / `tapErr()`
- ...work with many Results → `collect()` or `partition()`
- ...convert null to error → `fromNullable()` then `toResult()`

**"The operation might..."**
- ...throw an exception → `tryCatch()` / `tryCatchAsync()`
- ...return null → Use `Option` instead, then `toResult()` if needed
- ...return multiple errors → Use `Validation` module instead
- ...need retry logic → Use `async/retry()` which returns Result

## Related Modules

- **Option**: Use when you don't need detailed error info, just presence/absence
- **Validation**: Use when you need to accumulate multiple errors
- **Async**: Combines well with Result for async error handling
