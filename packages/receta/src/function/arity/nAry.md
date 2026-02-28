# Function: nAry

## When to Use
Force a function to accept exactly N arguments, ignoring additional ones. The generalized version of `unary` and `binary`. Use when you need precise control over how many arguments reach a variadic function.

## Decision Tree
```
Need to limit function arity?
│
├─ Force to N arguments ──────────────────────────────► nAry()
│
├─ Force to 1 argument (common case) ────────────────► unary()
│
├─ Force to 2 arguments (common case) ────────────────► binary()
│
├─ Wrapper function ──────────────────────────────────► (...args) => fn(...args.slice(0, n))
│
└─ No limitation needed ──────────────────────────────► Use function as-is
```

## Examples
```typescript
// Control variadic functions
const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

const sumTwo = nAry(2, sum)
sumTwo(1, 2, 3, 4, 5)  // => 3 (only sums first two)

const sumThree = nAry(3, sum)
sumThree(1, 2, 3, 4, 5)  // => 6 (only sums first three)

// Limit Math functions
const max = (...nums: number[]) => Math.max(...nums)

const maxOfTwo = nAry(2, max)
maxOfTwo(5, 10, 2, 8)  // => 10 (only considers first two)

const maxOfThree = nAry(3, max)
maxOfThree(5, 10, 2, 8)  // => 10 (only considers first three)

// Control callback arguments in higher-order functions
const log = (...args: any[]) => console.log(...args)

const logOne = nAry(1, log)
const logThree = nAry(3, log)

['a', 'b', 'c'].forEach(logOne)
// Logs: a, b, c (ignores index and array)

['a', 'b', 'c'].forEach(logThree)
// Logs: a 0 [array], b 1 [array], c 2 [array]

// Creating specialized versions
const format = (...parts: any[]) => parts.join(' - ')

const formatTwo = nAry(2, format)
const formatFour = nAry(4, format)

formatTwo('A', 'B', 'C', 'D', 'E')    // => 'A - B'
formatFour('A', 'B', 'C', 'D', 'E')   // => 'A - B - C - D'

// Precise control in pipelines
pipe(
  getData(),
  nAry(3, processData), // Only pass first 3 args to processData
  validateResult
)

// Testing with controlled inputs
const testFn = (...args: any[]) => {
  // Complex function that behaves differently based on arg count
  if (args.length === 1) return 'one'
  if (args.length === 2) return 'two'
  return 'many'
}

const testWithTwo = nAry(2, testFn)
testWithTwo(1, 2, 3, 4, 5)  // => 'two' (always passes exactly 2)

// Event handler control
const handler = (event: Event, data: any, context: any, ...rest: any[]) => {
  // Handle with exactly 3 params
}

button.addEventListener('click', nAry(3, handler))
```

## Related Functions
- **One arg**: `unary()` - shorthand for `nAry(1, fn)`
- **Two args**: `binary()` - shorthand for `nAry(2, fn)`
- **Manual wrapper**: `(...args) => fn(...args.slice(0, n))` - explicit alternative
- **Rest params**: Use rest parameters for more flexible variadic functions
