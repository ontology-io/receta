# Function: binary

## When to Use
Force a function to accept exactly two arguments, ignoring additional ones. Useful when you need to control how many arguments reach a variadic function in callbacks or higher-order functions.

## Decision Tree
```
Need to limit function arity?
│
├─ Force to 2 arguments ──────────────────────────────► binary()
│
├─ Force to 1 argument ───────────────────────────────► unary()
│
├─ Force to N arguments ──────────────────────────────► nAry()
│
├─ Wrapper function ──────────────────────────────────► (a, b) => fn(a, b)
│
└─ No limitation needed ──────────────────────────────► Use function as-is
```

## Examples
```typescript
// Limit variadic function
const add = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

add(1, 2, 3, 4)           // => 10
binary(add)(1, 2, 3, 4)   // => 3 (only uses first two)

// Control callback arguments
const logTwo = binary(console.log)

['a', 'b', 'c'].forEach(logTwo)
// Logs:
// a 0
// b 1
// c 2
// (ignores array parameter that forEach provides)

// Wrapping Math functions
const maxOfTwo = binary(Math.max)

maxOfTwo(5, 10, 2, 8)  // => 10 (only considers first two)
maxOfTwo(3, 7)         // => 7

// Array reduce with controlled accumulator
const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

[1, 2, 3, 4, 5].reduce(binary(sum))
// Correctly sums using only (accumulator, currentValue)
// Ignores index and array that reduce provides

// Event handlers with limited parameters
const handleInput = (value: string, timestamp: number, ...extra: any[]) => {
  console.log(`${timestamp}: ${value}`)
  // ignores extra parameters
}

input.addEventListener('input', (e) => {
  const handler = binary(handleInput)
  handler(e.target.value, Date.now(), e, 'extra', 'args')
  // Only value and timestamp are used
})

// Partial application control
const format = (template: string, value: any, locale?: string, ...opts: any[]) =>
  template.replace('{value}', String(value))

const safeFormat = binary(format)
safeFormat('Value: {value}', 42, 'en-US', 'extra')
// Only template and value used

// Callback normalization
const processItems = (items: any[], callback: (item: any, index: number) => void) => {
  items.forEach((item, index, arr) => callback(item, index))
}

const handler = (...args: any[]) => console.log('Args:', args.length)

processItems([1, 2, 3], binary(handler))
// Ensures handler only receives 2 arguments, not 3
```

## Related Functions
- **One arg**: `unary()` - force to 1 argument
- **N args**: `nAry()` - force to N arguments
- **Manual wrapper**: `(a, b) => fn(a, b)` - simple alternative
- **Partial**: `partial()` - pre-fill arguments instead of limiting
