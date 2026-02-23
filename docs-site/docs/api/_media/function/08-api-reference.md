# API Reference

> Complete function signatures and detailed API documentation.

## Conditional Combinators

### ifElse

Binary conditional branching.

```typescript
function ifElse<T, U>(
  predicate: (value: T) => boolean,
  onTrue: (value: T) => U,
  onFalse: (value: T) => U
): (value: T) => U

function ifElse<T, U>(
  predicate: (value: T) => boolean,
  onTrue: (value: T) => U,
  onFalse: (value: T) => U,
  value: T
): U
```

**Parameters:**
- `predicate` - Function that returns true/false
- `onTrue` - Function applied when predicate is true
- `onFalse` - Function applied when predicate is false
- `value` (optional) - Input value (for data-first signature)

**Returns:** Transformed value or transformer function

**Example:**
```typescript
const classify = ifElse(
  (n: number) => n >= 0,
  (n) => 'positive',
  (n) => 'negative'
)

classify(5)   // => 'positive'
classify(-3)  // => 'negative'
```

---

### when

Conditional transformation (applies function only when predicate passes).

```typescript
function when<T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
): (value: T) => T

function when<T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T,
  value: T
): T
```

**Parameters:**
- `predicate` - Condition to check
- `fn` - Transformation function
- `value` (optional) - Input value

**Returns:** Transformed value if predicate passes, otherwise original value

**Example:**
```typescript
const ensurePositive = when(
  (n: number) => n < 0,
  (n) => Math.abs(n)
)

ensurePositive(-5)  // => 5
ensurePositive(3)   // => 3
```

---

### unless

Inverse conditional transformation (applies function when predicate fails).

```typescript
function unless<T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
): (value: T) => T

function unless<T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T,
  value: T
): T
```

**Parameters:**
- `predicate` - Condition to check
- `fn` - Transformation function
- `value` (optional) - Input value

**Returns:** Transformed value if predicate fails, otherwise original value

**Example:**
```typescript
const ensureArray = unless(
  Array.isArray,
  (value) => [value]
)

ensureArray([1, 2])  // => [1, 2]
ensureArray(5)       // => [5]
```

---

### cond

Multi-way conditional (returns Option with first matching result).

```typescript
type CondPair<T, U> = readonly [
  predicate: (value: T) => boolean,
  fn: (value: T) => U
]

function cond<T, U>(
  pairs: readonly CondPair<T, U>[]
): (value: T) => Option<U>

function cond<T, U>(
  pairs: readonly CondPair<T, U>[],
  value: T
): Option<U>
```

**Parameters:**
- `pairs` - Array of [predicate, function] pairs
- `value` (optional) - Input value

**Returns:** `Some(result)` if a predicate matches, `None` otherwise

**Example:**
```typescript
const classify = cond<number, string>([
  [(n) => n < 0, () => 'negative'],
  [(n) => n === 0, () => 'zero'],
  [(n) => n > 0, () => 'positive']
])

unwrapOr(classify(5), 'unknown')  // => 'positive'
```

---

## Composition Utilities

### compose

Right-to-left function composition.

```typescript
function compose<A, B>(
  fn1: (a: A) => B
): (a: A) => B

function compose<A, B, C>(
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => C

// ... up to 5 functions
```

**Parameters:**
- `fn1...fn5` - Functions to compose (applied right-to-left)

**Returns:** Composed function

**Example:**
```typescript
const addOne = (n: number) => n + 1
const double = (n: number) => n * 2

const f = compose(double, addOne)
f(2)  // => 6 (double(addOne(2)))
```

---

### converge

Apply multiple functions to same input, combine results.

```typescript
function converge<T, Args extends readonly unknown[], R>(
  after: (...args: Args) => R,
  fns: FunctionTuple<T, Args>
): (value: T) => R

function converge<T, Args extends readonly unknown[], R>(
  after: (...args: Args) => R,
  fns: FunctionTuple<T, Args>,
  value: T
): R
```

**Parameters:**
- `after` - Function that combines results
- `fns` - Array of functions to apply to input
- `value` (optional) - Input value

**Returns:** Combined result

**Example:**
```typescript
const average = converge(
  (sum: number, length: number) => sum / length,
  [
    (nums: number[]) => nums.reduce((a, b) => a + b, 0),
    (nums: number[]) => nums.length
  ]
)

average([1, 2, 3, 4, 5])  // => 3
```

---

### juxt

Apply multiple functions to same input, return array of results.

```typescript
function juxt<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns
): (...args: Parameters<Fns[0]>) => ReturnTypes<Fns>

function juxt<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns,
  ...args: Parameters<Fns[0]>
): ReturnTypes<Fns>
```

**Parameters:**
- `fns` - Array of functions
- `args` (optional) - Arguments to pass to all functions

**Returns:** Array of results

**Example:**
```typescript
const stats = juxt([
  (nums: number[]) => nums.length,
  (nums: number[]) => Math.max(...nums),
  (nums: number[]) => Math.min(...nums)
])

stats([1, 2, 3, 4, 5])  // => [5, 5, 1]
```

---

### ap

Apply array of functions to array of values (cross-product).

```typescript
function ap<T, U>(
  fns: readonly ((value: T) => U)[]
): (values: readonly T[]) => U[]

function ap<T, U>(
  fns: readonly ((value: T) => U)[],
  values: readonly T[]
): U[]
```

**Parameters:**
- `fns` - Array of functions
- `values` (optional) - Array of values

**Returns:** Flat array of results (each function applied to each value)

**Example:**
```typescript
const fns = [
  (n: number) => n + 1,
  (n: number) => n * 2
]

ap(fns, [1, 2])  // => [2, 3, 2, 4]
```

---

## Partial Application

### partial

Pre-fill arguments from the left.

```typescript
function partial<Args extends readonly any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R

function partial<Args extends readonly any[], R>(
  fn: (...args: Args) => R,
  ...prefilledArgs: any[]
): (...args: any[]) => R
```

**Parameters:**
- `fn` - Function to partially apply
- `prefilledArgs` - Arguments to pre-fill

**Returns:** Partially applied function

**Example:**
```typescript
const greet = (greeting: string, name: string) => `${greeting}, ${name}!`
const sayHello = partial(greet, 'Hello')

sayHello('Alice')  // => 'Hello, Alice!'
```

---

### partialRight

Pre-fill arguments from the right.

```typescript
function partialRight<Args extends readonly any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R

function partialRight<Args extends readonly any[], R>(
  fn: (...args: Args) => R,
  ...prefilledArgs: any[]
): (...args: any[]) => R
```

**Parameters:**
- `fn` - Function to partially apply
- `prefilledArgs` - Arguments to pre-fill from right

**Returns:** Partially applied function

**Example:**
```typescript
const divide = (a: number, b: number) => a / b
const divideBy10 = partialRight(divide, 10)

divideBy10(100)  // => 10
```

---

### flip

Reverse the order of first two arguments.

```typescript
function flip<A, B, R>(
  fn: (a: A, b: B) => R
): (b: B, a: A) => R
```

**Parameters:**
- `fn` - Function with at least two parameters

**Returns:** Function with first two parameters reversed

**Example:**
```typescript
const subtract = (a: number, b: number) => a - b
const subtractFrom = flip(subtract)

subtract(10, 3)      // => 7
subtractFrom(3, 10)  // => 7
```

---

## Arity Control

### unary

Limit function to one argument.

```typescript
function unary<A, R>(
  fn: (a: A, ...rest: any[]) => R
): (a: A) => R
```

**Example:**
```typescript
['1', '2', '3'].map(unary(parseInt))  // => [1, 2, 3]
```

---

### binary

Limit function to two arguments.

```typescript
function binary<A, B, R>(
  fn: (a: A, b: B, ...rest: any[]) => R
): (a: A, b: B) => R
```

**Example:**
```typescript
const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)
binary(sum)(1, 2, 3, 4)  // => 3
```

---

### nAry

Limit function to N arguments.

```typescript
function nAry<R>(
  n: number,
  fn: (...args: any[]) => R
): (...args: any[]) => R
```

**Example:**
```typescript
const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)
const sumTwo = nAry(2, sum)

sumTwo(1, 2, 3, 4)  // => 3
```

---

## Control Flow

### tap

Execute side effect, return original value.

```typescript
function tap<T>(
  fn: (value: T) => void
): (value: T) => T

function tap<T>(
  fn: (value: T) => void,
  value: T
): T
```

**Parameters:**
- `fn` - Side effect function (return value ignored)
- `value` (optional) - Input value

**Returns:** Original value unchanged

**Example:**
```typescript
pipe(
  data,
  tap((x) => console.log('Debug:', x)),
  transform
)
```

---

### tryCatch

Wrap function for safe Result execution.

```typescript
function tryCatch<Args extends readonly any[], T, E = unknown>(
  fn: (...args: Args) => T,
  onError?: (error: unknown) => E
): (...args: Args) => Result<T, E>
```

**Parameters:**
- `fn` - Potentially throwing function
- `onError` (optional) - Error transformer

**Returns:** Function that returns Result instead of throwing

**Example:**
```typescript
const parseJSON = tryCatch(
  (str: string) => JSON.parse(str),
  (error) => `Parse error: ${error}`
)

parseJSON('{"valid": "json"}')  // => Ok({valid: 'json'})
parseJSON('invalid')            // => Err('Parse error: ...')
```

---

### memoize

Cache function results (by first argument).

```typescript
function memoize<Args extends readonly any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R
```

**Parameters:**
- `fn` - Function to memoize

**Returns:** Memoized version of function

**Note:** This is a re-export of `memo.memoize`. For advanced caching (TTL, custom keys), use the `memo` module directly.

**Example:**
```typescript
const expensive = memoize((n: number) => {
  // ... expensive computation
  return result
})

expensive(5)  // Computed
expensive(5)  // Cached
```

---

## Type Definitions

### Predicate

```typescript
type Predicate<T> = (value: T) => boolean
```

### Mapper

```typescript
type Mapper<T, U> = (value: T) => U
```

### CondPair

```typescript
type CondPair<T, U> = readonly [
  predicate: Predicate<T>,
  fn: Mapper<T, U>
]
```

### FunctionTuple

```typescript
type FunctionTuple<T, Args extends readonly unknown[]> = {
  readonly [K in keyof Args]: Mapper<T, Args[K]>
}
```

### ReturnTypes

```typescript
type ReturnTypes<Fns extends readonly ((...args: any[]) => any)[]> = {
  readonly [K in keyof Fns]: Fns[K] extends (...args: any[]) => infer R ? R : never
}
```

---

## Import Paths

### Individual Imports

```typescript
import { ifElse } from 'receta/function/ifElse'
import { when } from 'receta/function/when'
import { tap } from 'receta/function/tap'
```

### Barrel Import

```typescript
import {
  ifElse, when, unless, cond,
  compose, converge, juxt, ap,
  partial, partialRight, flip,
  unary, binary, nAry,
  tap, tryCatch, memoize
} from 'receta/function'
```

---

## See Also

- **[Overview](./01-overview.md)** - Introduction and philosophy
- **[Conditionals Guide](./02-conditionals-guide.md)** - ifElse, when, unless, cond
- **[Composition Guide](./03-composition-guide.md)** - compose, converge, juxt, ap
- **[Partial Application Guide](./04-partial-application-guide.md)** - partial, flip, arity
- **[Control Flow Guide](./05-control-flow-guide.md)** - tap, tryCatch, memoize
- **[Integration Guide](./06-integration-guide.md)** - Using with Result/Option
- **[Real-World Patterns](./07-real-world-patterns.md)** - Production examples
