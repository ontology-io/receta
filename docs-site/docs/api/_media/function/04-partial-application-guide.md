# Partial Application Guide

> Create specialized functions by pre-filling arguments.

## Overview

Partial application lets you create new functions by "filling in" some arguments of an existing function. This is powerful for creating specialized versions of general functions, building configuration systems, and improving code reusability.

## partial - Left-to-Right Partial Application

The `partial` function pre-fills arguments from the left (beginning).

### Signature

```typescript
function partial<Args extends readonly any[], R>(
  fn: (...args: Args) => R,
  ...prefilledArgs: any[]
): (...args: any[]) => R
```

### Basic Usage

```typescript
import { partial } from 'receta/function'

const greet = (greeting: string, name: string) => `${greeting}, ${name}!`

const sayHello = partial(greet, 'Hello')

sayHello('Alice') // => 'Hello, Alice!'
sayHello('Bob')   // => 'Hello, Bob!'
```

### Multiple Arguments

```typescript
const log = (level: string, module: string, message: string) =>
  `[${level}] ${module}: ${message}`

// Partial with one argument
const logError = partial(log, 'ERROR')
logError('Auth', 'Invalid token') // => '[ERROR] Auth: Invalid token'

// Partial with two arguments
const logUserError = partial(log, 'ERROR', 'UserModule')
logUserError('Invalid input') // => '[ERROR] UserModule: Invalid input'
```

### Real-World Example: API Client

```typescript
interface ApiConfig {
  baseUrl: string
  headers: Record<string, string>
}

const fetchApi = async (
  config: ApiConfig,
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  return fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: { ...config.headers, ...(options?.headers || {}) }
  })
}

// Create specialized API client
const prodConfig: ApiConfig = {
  baseUrl: 'https://api.production.com',
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
}

const prodFetch = partial(fetchApi, prodConfig)

// Now you can use it without repeating config
await prodFetch('/users')
await prodFetch('/posts', { method: 'POST', body: JSON.stringify(data) })
```

## partialRight - Right-to-Left Partial Application

The `partialRight` function pre-fills arguments from the right (end).

### Signature

```typescript
function partialRight<Args extends readonly any[], R>(
  fn: (...args: Args) => R,
  ...prefilledArgs: any[]
): (...args: any[]) => R
```

### Basic Usage

```typescript
import { partialRight } from 'receta/function'

const divide = (a: number, b: number) => a / b

const divideBy10 = partialRight(divide, 10)

divideBy10(100) // => 10 (100 / 10)
divideBy10(50)  // => 5  (50 / 10)
```

### When to Use partialRight

Use `partialRight` when the data you want to vary comes first:

```typescript
// Data varies, format is fixed
const formatDate = (date: Date, format: string, locale: string) =>
  date.toLocaleDateString(locale, { dateStyle: format as any })

const formatInUS = partialRight(formatDate, 'short', 'en-US')
const formatInFR = partialRight(formatDate, 'short', 'fr-FR')

const today = new Date('2026-01-22')

formatInUS(today) // => '1/22/26'
formatInFR(today) // => '22/01/2026'
```

### Real-World Example: Event Logging

```typescript
const logEvent = (
  event: string,
  userId: string,
  timestamp: string,
  metadata: Record<string, any>
) => ({
  event,
  userId,
  timestamp,
  metadata
})

// Pre-fill timestamp and metadata for a session
const sessionLogger = partialRight(
  logEvent,
  new Date().toISOString(),
  { sessionId: 'abc-123', source: 'web' }
)

// Now just specify event and user
sessionLogger('page_view', 'user-1')
sessionLogger('button_click', 'user-1')
sessionLogger('form_submit', 'user-1')
```

## flip - Reverse Argument Order

The `flip` function swaps the first two arguments of a function.

### Signature

```typescript
function flip<A, B, R>(
  fn: (a: A, b: B) => R
): (b: B, a: A) => R
```

### Basic Usage

```typescript
import { flip } from 'receta/function'

const subtract = (a: number, b: number) => a - b

const subtractFrom = flip(subtract)

subtract(10, 3)     // => 7  (10 - 3)
subtractFrom(3, 10) // => 7  (10 - 3, arguments flipped)
```

### Use Case: Better Partial Application

```typescript
const divide = (a: number, b: number) => a / b

// Without flip
const divideBy10 = (n: number) => divide(n, 10)

// With flip + partial (more elegant)
const divideBy = flip(divide)
const divideBy10 = partial(divideBy, 10)

divideBy10(100) // => 10
```

### Real-World Example: Data Pipeline

```typescript
import { pipe, map } from 'remeda'
import { flip, partial } from 'receta/function'

const appendTo = flip((item: string, arr: string[]) => [...arr, item])

const addFooter = partial(appendTo, '---End---')
const addHeader = partial(appendTo, '---Start---')

const processLines = pipe(
  ['line 1', 'line 2', 'line 3'],
  addHeader,
  addFooter
)
// => ['---Start---', 'line 1', 'line 2', 'line 3', '---End---']
```

## Arity Control

### unary - Limit to One Argument

Forces a function to accept only its first argument.

```typescript
import { unary } from 'receta/function'

// The classic parseInt bug
['1', '2', '3'].map(parseInt)         // => [1, NaN, NaN]
['1', '2', '3'].map(unary(parseInt))  // => [1, 2, 3]
```

**Why does this happen?**

```typescript
// Array.map passes (element, index, array)
// parseInt(string, radix)

// Without unary:
parseInt('1', 0, [...]) // => 1 (radix 0 defaults to 10)
parseInt('2', 1, [...]) // => NaN (radix 1 is invalid)
parseInt('3', 2, [...]) // => NaN (3 is invalid in base 2)

// With unary:
parseInt('1') // => 1
parseInt('2') // => 2
parseInt('3') // => 3
```

### binary - Limit to Two Arguments

```typescript
import { binary } from 'receta/function'

const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

sum(1, 2, 3, 4)          // => 10
binary(sum)(1, 2, 3, 4)  // => 3 (only uses first two)
```

### nAry - Limit to N Arguments

```typescript
import { nAry } from 'receta/function'

const log = (...args: any[]) => console.log(...args)

const logOne = nAry(1, log)
const logThree = nAry(3, log)

logOne('a', 'b', 'c')      // Logs: a
logThree('a', 'b', 'c', 'd')  // Logs: a b c
```

### Real-World Example: Callback Adapters

```typescript
// Problem: Library passes extra arguments you don't want
const onClick = (event: MouseEvent, index: number, element: HTMLElement) => {
  // But you only care about the event
  handleClick(event)
}

// Solution: Use unary
const onClick = unary((event: MouseEvent) => {
  handleClick(event)
})

// Now extra arguments are ignored
element.addEventListener('click', onClick)
```

## Combining Partial Application

You can chain partial applications:

```typescript
const formatLog = (timestamp: string, level: string, module: string, msg: string) =>
  `${timestamp} [${level}] ${module}: ${msg}`

const withTimestamp = partial(formatLog, new Date().toISOString())
const errorLog = partial(withTimestamp, 'ERROR')
const userErrorLog = partial(errorLog, 'UserModule')

userErrorLog('Failed authentication')
// => '2026-01-22T... [ERROR] UserModule: Failed authentication'
```

## Best Practices

### 1. Design Functions for Partial Application

```typescript
// ✅ Good: Config/context first, data last
const query = (config: Config, sql: string, params: any[]) => { ... }
const dbQuery = partial(query, productionConfig)

// ❌ Bad: Data first makes partial application awkward
const query = (sql: string, params: any[], config: Config) => { ... }
```

### 2. Name Partially Applied Functions Clearly

```typescript
// ❌ Unclear
const fn = partial(log, 'ERROR')

// ✅ Clear intent
const logError = partial(log, 'ERROR')
const logUserError = partial(logError, 'UserModule')
```

### 3. Use flip When Data Should Come First

```typescript
// If you have: fn(config, data)
// But need: fn(data, config)

const flipped = flip(fn)
const withConfig = partial(flipped, config)

// Now: withConfig(data)
```

### 4. Prefer unary for Common Callbacks

```typescript
// ✅ Clean
numbers.map(unary(parseInt))
items.forEach(unary(processItem))

// ❌ Verbose
numbers.map((x) => parseInt(x))
items.forEach((item) => processItem(item))
```

## Type Safety

Partial application preserves type safety:

```typescript
const greet = (greeting: string, name: string): string =>
  `${greeting}, ${name}!`

const sayHello = partial(greet, 'Hello')

// TypeScript knows sayHello expects string and returns string
const result: string = sayHello('Alice')

// ❌ Type error
const wrong: number = sayHello('Bob')
```

## Next Steps

- **[Control Flow Guide](./05-control-flow-guide.md)** - Learn tap, tryCatch, memoize
- **[Integration Guide](./06-integration-guide.md)** - Combine with Result and Option
- **[Real-World Patterns](./07-real-world-patterns.md)** - Production examples
