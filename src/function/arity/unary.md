# Function: unary

## When to Use
Force a function to accept only one argument, ignoring additional ones. Essential when passing functions to higher-order functions that provide extra arguments you don't want (e.g., `parseInt` in `map`).

## Decision Tree
```
Need to limit function arity?
│
├─ Force to 1 argument ───────────────────────────────► unary()
│
├─ Force to 2 arguments ──────────────────────────────► binary()
│
├─ Force to N arguments ──────────────────────────────► nAry()
│
├─ Wrapper function ──────────────────────────────────► (x) => fn(x)
│
└─ No limitation needed ──────────────────────────────► Use function as-is
```

## Examples
```typescript
// Classic parseInt bug fix
['1', '2', '3'].map(parseInt)           // => [1, NaN, NaN] ❌
['1', '2', '3'].map(unary(parseInt))    // => [1, 2, 3] ✅

// Why? map calls: parseInt(value, index, array)
// parseInt('1', 0) => 1 (base 0 becomes 10)
// parseInt('2', 1) => NaN (base 1 is invalid)
// parseInt('3', 2) => NaN (no '3' in base 2)

// Clean logging without extra forEach arguments
const logFirst = unary(console.log)

['a', 'b', 'c'].forEach(logFirst)
// Logs:
// a
// b
// c
// (without indices or array)

// Wrapping functions for cleaner callbacks
const parseNumber = unary(Number)
const inputs = ['42', '3.14', '100']

inputs.map(parseNumber)  // => [42, 3.14, 100]

// Clean promise chains
const items = ['a', 'b', 'c']
Promise.all(items.map(unary(fetchItem)))
// Without unary, fetchItem would receive (item, index, array)

// Avoid accidental arguments in event handlers
button.addEventListener('click', unary(handleClick))
// handleClick only receives the event, not any extra arguments
// the event system might provide

// Filter with complex predicates
const isValid = (value: string, _context?: any, _options?: any) =>
  value.length > 0 && value !== 'invalid'

['hello', '', 'world'].filter(unary(isValid))
// filter provides (value, index, array) but isValid only sees value

// Array transformation pipelines
pipe(
  ['  hello  ', '  world  '],
  R.map(unary((s: string) => s.trim()))
)
// => ['hello', 'world']
// Without unary, trim would receive (string, index, array)
```

## Related Functions
- **Two args**: `binary()` - force to 2 arguments
- **N args**: `nAry()` - force to N arguments
- **Manual wrapper**: `(x) => fn(x)` - simple alternative
- **Point-free**: Use when you need cleaner function composition
