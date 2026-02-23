# Composition Guide

> Build complex transformations by combining simple functions.

## Overview

Function composition is about creating new functions by combining existing ones. The Function module provides four powerful composition utilities: `compose`, `converge`, `juxt`, and `ap`.

## compose - Right-to-Left Composition

The `compose` function applies functions from right to left (mathematical composition).

### Signature

```typescript
function compose<A, B>(fn1: (a: A) => B): (a: A) => B
function compose<A, B, C>(fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => C
// ... up to 5 functions
```

### Basic Usage

```typescript
import { compose } from 'receta/function'

const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const square = (n: number) => n * n

const f = compose(square, double, addOne)

f(2) // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
```

### When to Use compose vs pipe

```typescript
import { pipe } from 'remeda'

// compose: right-to-left (mathematical notation)
const f = compose(c, b, a)  // c(b(a(x)))

// pipe: left-to-right (more intuitive for data pipelines)
const g = pipe(x, a, b, c)  // c(b(a(x)))

// Prefer pipe for data transformation
const result = pipe(
  data,
  transform,
  validate,
  save
)

// Use compose when thinking mathematically
const transform = compose(finalize, process, prepare)
```

### Real-World Example

```typescript
const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()

const shout = compose(exclaim, toUpper, trim)

shout('  hello world  ') // => 'HELLO WORLD!'
```

## converge - Apply Multiple Functions, Combine Results

The `converge` combinator applies multiple functions to the same input, then passes all results to a combining function.

### Signature

```typescript
function converge<T, Args extends readonly unknown[], R>(
  after: (...args: Args) => R,
  fns: FunctionTuple<T, Args>
): (value: T) => R
```

### Basic Usage

```typescript
import { converge } from 'receta/function'

// Calculate average
const average = converge(
  (sum: number, length: number) => sum / length,
  [
    (nums: number[]) => nums.reduce((a, b) => a + b, 0),
    (nums: number[]) => nums.length
  ]
)

average([1, 2, 3, 4, 5]) // => 3
```

### When to Use converge

Use `converge` when you need to:
- Derive multiple values from a single input
- Build objects from different transformations
- Combine statistics or metrics

```typescript
// Building summary objects
const buildSummary = converge(
  (total, count, max, min) => ({
    total,
    count,
    average: total / count,
    max,
    min,
    range: max - min
  }),
  [
    (nums: number[]) => nums.reduce((a, b) => a + b, 0),
    (nums: number[]) => nums.length,
    (nums: number[]) => Math.max(...nums),
    (nums: number[]) => Math.min(...nums)
  ]
)

buildSummary([1, 5, 3, 9, 2])
// => { total: 20, count: 5, average: 4, max: 9, min: 1, range: 8 }
```

### Real-World Example: Profile Building

```typescript
interface User {
  firstName: string
  lastName: string
  email: string
  scores: number[]
}

interface Profile {
  fullName: string
  username: string
  domain: string
  stats: {
    totalScore: number
    averageScore: number
    maxScore: number
  }
}

const buildProfile = converge(
  (fullName: string, username: string, domain: string, stats: any): Profile => ({
    fullName,
    username,
    domain,
    stats
  }),
  [
    (user: User) => `${user.firstName} ${user.lastName}`,
    (user: User) => user.email.split('@')[0]!,
    (user: User) => user.email.split('@')[1]!,
    (user: User) => {
      const total = user.scores.reduce((a, b) => a + b, 0)
      const avg = total / user.scores.length
      return {
        totalScore: total,
        averageScore: Math.round(avg * 10) / 10,
        maxScore: Math.max(...user.scores)
      }
    }
  ]
)

const user: User = {
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@example.com',
  scores: [92, 88, 95, 87, 91]
}

console.log(buildProfile(user))
// => {
//   fullName: 'Alice Johnson',
//   username: 'alice.johnson',
//   domain: 'example.com',
//   stats: { totalScore: 453, averageScore: 90.6, maxScore: 95 }
// }
```

## juxt - Apply Functions in Parallel

The `juxt` combinator applies multiple functions to the same input and collects all results in an array.

### Signature

```typescript
function juxt<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns
): (...args: Parameters<Fns[0]>) => ReturnTypes<Fns>
```

### Basic Usage

```typescript
import { juxt } from 'receta/function'

const analyze = juxt([
  (nums: number[]) => nums.length,
  (nums: number[]) => Math.min(...nums),
  (nums: number[]) => Math.max(...nums),
  (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
])

analyze([1, 2, 3, 4, 5])
// => [5, 1, 5, 3]
//    [length, min, max, average]
```

### Difference Between juxt and converge

```typescript
// juxt: returns array of results
const metrics = juxt([sum, count, max])
metrics(data) // => [15, 5, 9]

// converge: combines results with a function
const summary = converge(
  (sum, count, max) => ({ sum, count, max }),
  [sum, count, max]
)
summary(data) // => { sum: 15, count: 5, max: 9 }
```

### Real-World Example: Data Analytics

```typescript
interface SalesRecord {
  id: string
  amount: number
  region: string
}

const extractMetrics = juxt([
  (records: SalesRecord[]) => records.length,
  (records: SalesRecord[]) => records.reduce((sum, r) => sum + r.amount, 0),
  (records: SalesRecord[]) => Math.max(...records.map(r => r.amount)),
  (records: SalesRecord[]) => Math.min(...records.map(r => r.amount)),
  (records: SalesRecord[]) => new Set(records.map(r => r.region)).size
])

const sales: SalesRecord[] = [
  { id: '1', amount: 1200, region: 'North' },
  { id: '2', amount: 800, region: 'South' },
  { id: '3', amount: 1500, region: 'North' },
  { id: '4', amount: 950, region: 'East' },
  { id: '5', amount: 2000, region: 'West' }
]

const [count, total, max, min, uniqueRegions] = extractMetrics(sales)

console.log({ count, total, max, min, uniqueRegions })
// => { count: 5, total: 6450, max: 2000, min: 800, uniqueRegions: 4 }
```

## ap - Applicative Apply

The `ap` combinator applies an array of functions to an array of values, creating all possible combinations.

### Signature

```typescript
function ap<T, U>(
  fns: readonly ((value: T) => U)[]
): (values: readonly T[]) => U[]
```

### Basic Usage

```typescript
import { ap } from 'receta/function'

const fns = [
  (n: number) => n + 1,
  (n: number) => n * 2,
  (n: number) => n * n
]

ap(fns, [1, 2, 3])
// => [
//   2, 3, 4,      // +1 to each
//   2, 4, 6,      // *2 to each
//   1, 4, 9       // square each
// ]
```

### When to Use ap

The `ap` function is less commonly used than `converge` or `juxt`, but useful for:
- Applying multiple validators to multiple inputs
- Testing multiple transformations
- Cross-product operations

### Real-World Example: Validation Matrix

```typescript
const validators = [
  (s: string) => s.length > 0,
  (s: string) => s.length < 100,
  (s: string) => /^[a-z]+$/i.test(s)
]

const inputs = ['hello', '', 'test123']

const results = ap(validators, inputs)
// => [
//   true, false, true,    // length > 0
//   true, true, true,     // length < 100
//   true, false, false    // only letters
// ]

// Reshape into validation matrix
const matrix = inputs.map((input, i) => ({
  input,
  validations: {
    notEmpty: results[i],
    notTooLong: results[inputs.length + i],
    lettersOnly: results[inputs.length * 2 + i]
  }
}))
```

## Combining Composition Functions

You can nest these combinators for powerful transformations:

```typescript
import { converge, juxt } from 'receta/function'

// Extract multiple metrics, then build summary
const analyzeData = converge(
  (metrics, uniqueValues) => ({
    stats: {
      count: metrics[0],
      sum: metrics[1],
      avg: metrics[1] / metrics[0],
      max: metrics[2],
      min: metrics[3]
    },
    uniqueCount: uniqueValues
  }),
  [
    juxt([
      (data: number[]) => data.length,
      (data: number[]) => data.reduce((a, b) => a + b, 0),
      (data: number[]) => Math.max(...data),
      (data: number[]) => Math.min(...data)
    ]),
    (data: number[]) => new Set(data).size
  ]
)

analyzeData([1, 2, 2, 3, 3, 3, 4, 5])
// => {
//   stats: { count: 8, sum: 23, avg: 2.875, max: 5, min: 1 },
//   uniqueCount: 5
// }
```

## Best Practices

### 1. Name Your Functions

```typescript
// ❌ Unclear
const fn = converge((a, b) => a + b, [f1, f2])

// ✅ Clear intent
const calculateTotal = converge(
  (subtotal, tax) => subtotal + tax,
  [getSubtotal, calculateTax]
)
```

### 2. Keep Functions Small

```typescript
// ✅ Small, focused functions
const getFullName = (user: User) => `${user.firstName} ${user.lastName}`
const getUsername = (user: User) => user.email.split('@')[0]!
const getDomain = (user: User) => user.email.split('@')[1]!

const buildProfile = converge(
  (name, username, domain) => ({ name, username, domain }),
  [getFullName, getUsername, getDomain]
)
```

### 3. Type Your Combinators

```typescript
// ✅ Explicit types help readability
const buildSummary = converge<
  number[],
  [number, number, number, number],
  Summary
>(
  (total, count, max, min): Summary => ({
    total, count, max, min, avg: total / count
  }),
  [sum, count, max, min]
)
```

## Next Steps

- **[Partial Application Guide](./04-partial-application-guide.md)** - Learn partial, flip, arity
- **[Control Flow Guide](./05-control-flow-guide.md)** - Explore tap, tryCatch, memoize
- **[API Reference](./08-api-reference.md)** - Complete function signatures
