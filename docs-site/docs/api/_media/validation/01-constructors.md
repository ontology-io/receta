# Constructors: Creating Validations

Constructors are functions that create `Validation<T, E>` instances. They're the foundation for all validation operations.

## Overview

| Constructor | Purpose | Returns |
|------------|---------|---------|
| `valid(value)` | Create successful validation | `Valid<T>` |
| `invalid(errors)` | Create failed validation | `Invalid<E>` |
| `fromPredicate(pred, error)` | Validator from predicate | `Validator<T, T, E>` |
| `fromPredicateWithError(pred, getError)` | Dynamic error messages | `Validator<T, T, E>` |
| `fromResult(result)` | Convert Result to Validation | `Validation<T, E>` |
| `tryCatch(fn)` | Wrap throwing function | `Validation<T, unknown>` |
| `tryCatchAsync(fn)` | Wrap async function | `Promise<Validation<T, E>>` |

## valid

Creates a `Valid` validation containing a value.

```typescript
valid(value: T): Valid<T>
```

### Examples

```typescript
import { valid } from 'receta/validation'

// Simple values
valid(42)           // => Valid(42)
valid('hello')      // => Valid('hello')
valid(true)         // => Valid(true)

// Complex values
valid({ name: 'John', age: 25 })
// => Valid({ name: 'John', age: 25 })

valid([1, 2, 3])
// => Valid([1, 2, 3])

// In validator functions
const alwaysValid = <T>(value: T): Validation<T, never> => valid(value)
```

### Real-World: Conditional Validation

```typescript
const validateAge = (age: number): Validation<number, string> => {
  if (age >= 18 && age <= 120) {
    return valid(age)
  }
  if (age < 18) {
    return invalid('Must be 18 or older')
  }
  return invalid('Invalid age')
}
```

## invalid

Creates an `Invalid` validation containing one or more errors.

```typescript
invalid(errors: E | readonly E[]): Invalid<E>
```

### Examples

```typescript
import { invalid } from 'receta/validation'

// Single error
invalid('Email is required')
// => Invalid(['Email is required'])

// Multiple errors
invalid(['Error 1', 'Error 2', 'Error 3'])
// => Invalid(['Error 1', 'Error 2', 'Error 3'])

// Structured errors
invalid({ code: 'INVALID_EMAIL', message: 'Invalid format' })
// => Invalid([{ code: 'INVALID_EMAIL', message: 'Invalid format' }])

// Multiple structured errors
invalid([
  { field: 'email', message: 'Invalid' },
  { field: 'password', message: 'Too short' }
])
```

### Real-World: API Error Response

```typescript
interface ApiError {
  code: string
  message: string
  field?: string
}

const validateEmail = (email: string): Validation<string, ApiError> => {
  if (email.length === 0) {
    return invalid({
      code: 'REQUIRED',
      message: 'Email is required',
      field: 'email'
    })
  }

  if (!email.includes('@')) {
    return invalid({
      code: 'INVALID_FORMAT',
      message: 'Invalid email format',
      field: 'email'
    })
  }

  return valid(email)
}
```

## fromPredicate

Creates a validator from a predicate function with a static error message.

```typescript
fromPredicate<T, E>(
  predicate: (value: T) => boolean,
  error: E
): Validator<T, T, E>
```

### Examples

```typescript
import { fromPredicate } from 'receta/validation'

// Simple predicate
const isPositive = fromPredicate(
  (n: number) => n > 0,
  'Must be positive'
)

isPositive(5)   // => Valid(5)
isPositive(-1)  // => Invalid(['Must be positive'])

// Email validation
const isEmail = fromPredicate(
  (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  'Invalid email format'
)

isEmail('user@example.com')  // => Valid('user@example.com')
isEmail('not-an-email')      // => Invalid(['Invalid email format'])

// With Predicate builders
import { gt } from 'receta/predicate'

const isAdult = fromPredicate(
  gt(18),
  'Must be 18 or older'
)

isAdult(25)  // => Valid(25)
isAdult(16)  // => Invalid(['Must be 18 or older'])
```

### Real-World: Reusable Validators

```typescript
// Username validation
const isValidUsername = fromPredicate(
  (s: string) => /^[a-zA-Z0-9_]{3,20}$/.test(s),
  'Username must be 3-20 characters (letters, numbers, underscores only)'
)

// Strong password check
const hasUppercase = fromPredicate(
  (s: string) => /[A-Z]/.test(s),
  'Password must contain at least one uppercase letter'
)

const hasNumber = fromPredicate(
  (s: string) => /[0-9]/.test(s),
  'Password must contain at least one number'
)

const hasSpecialChar = fromPredicate(
  (s: string) => /[^A-Za-z0-9]/.test(s),
  'Password must contain at least one special character'
)

// Compose them
const validatePassword = (password: string) =>
  validate(password, [
    minLength(8),
    hasUppercase,
    hasNumber,
    hasSpecialChar
  ])
```

## fromPredicateWithError

Creates a validator with dynamic error messages based on the input value.

```typescript
fromPredicateWithError<T, E>(
  predicate: (value: T) => boolean,
  getError: (value: T) => E
): Validator<T, T, E>
```

### Examples

```typescript
import { fromPredicateWithError } from 'receta/validation'

// Dynamic error message
const minLength = (min: number) =>
  fromPredicateWithError(
    (s: string) => s.length >= min,
    (s) => `Expected at least ${min} characters, got ${s.length}`
  )

minLength(5)('hello')  // => Valid('hello')
minLength(5)('hi')     // => Invalid(['Expected at least 5 characters, got 2'])

// Range validation with context
const inRange = (min: number, max: number) =>
  fromPredicateWithError(
    (n: number) => n >= min && n <= max,
    (n) => `Value ${n} is out of range [${min}, ${max}]`
  )

inRange(0, 100)(50)    // => Valid(50)
inRange(0, 100)(-10)   // => Invalid(['Value -10 is out of range [0, 100]'])
inRange(0, 100)(150)   // => Invalid(['Value 150 is out of range [0, 100]'])
```

### Real-World: Contextual Error Messages

```typescript
// File size validation
const maxFileSize = (maxBytes: number) =>
  fromPredicateWithError(
    (file: File) => file.size <= maxBytes,
    (file) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      const maxMB = (maxBytes / 1024 / 1024).toFixed(2)
      return `File size ${sizeMB}MB exceeds maximum ${maxMB}MB`
    }
  )

// Date range validation
const dateAfter = (minDate: Date) =>
  fromPredicateWithError(
    (date: Date) => date > minDate,
    (date) => `Date ${date.toISOString()} must be after ${minDate.toISOString()}`
  )

// Array length validation
const exactLength = (expected: number) =>
  fromPredicateWithError(
    (arr: unknown[]) => arr.length === expected,
    (arr) => `Expected ${expected} items, got ${arr.length}`
  )
```

## fromResult

Converts a `Result<T, E>` to a `Validation<T, E>`.

```typescript
fromResult<T, E>(result: Result<T, E>): Validation<T, E>
```

### Examples

```typescript
import { fromResult } from 'receta/validation'
import { ok, err } from 'receta/result'

// Convert Ok to Valid
fromResult(ok(42))
// => Valid(42)

// Convert Err to Invalid
fromResult(err('error message'))
// => Invalid(['error message'])
```

### Real-World: JSON Parsing

```typescript
import { Result } from 'receta/result'

// Result-based parser
const parseJSON = <T>(str: string): Result<T, SyntaxError> =>
  Result.tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )

// Convert to Validation for form processing
const parseAndValidate = <T>(
  str: string,
  validator: Validator<T, T, string>
): Validation<T, string> =>
  pipe(
    parseJSON<T>(str),
    fromResult,
    mapInvalid((e) => e.message),
    flatMap(validator)
  )
```

## tryCatch

Wraps a potentially throwing function in a Validation.

```typescript
// Without error mapping
tryCatch<T>(fn: () => T): Validation<T, unknown>

// With error mapping
tryCatch<T, E>(
  fn: () => T,
  mapError: (error: unknown) => E
): Validation<T, E>
```

### Examples

```typescript
import { tryCatch } from 'receta/validation'

// Basic usage
const parseJSON = <T>(str: string): Validation<T, unknown> =>
  tryCatch(() => JSON.parse(str) as T)

parseJSON('{"name":"John"}')
// => Valid({ name: 'John' })

parseJSON('invalid json')
// => Invalid([SyntaxError: ...])

// With error mapping
const parseJSONSafe = <T>(str: string): Validation<T, string> =>
  tryCatch(
    () => JSON.parse(str) as T,
    (e) => `JSON parse error: ${(e as Error).message}`
  )

parseJSONSafe('invalid')
// => Invalid(['JSON parse error: Unexpected token i in JSON at position 0'])
```

### Real-World: Safe Operations

```typescript
// Safe URL parsing
const parseURL = (str: string): Validation<URL, string> =>
  tryCatch(
    () => new URL(str),
    (e) => `Invalid URL: ${(e as Error).message}`
  )

// Safe date parsing
const parseDate = (str: string): Validation<Date, string> =>
  tryCatch(
    () => {
      const date = new Date(str)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      return date
    },
    (e) => (e as Error).message
  )

// Safe number parsing
const parseNumber = (str: string): Validation<number, string> =>
  tryCatch(
    () => {
      const num = Number(str)
      if (isNaN(num)) {
        throw new Error('Not a valid number')
      }
      return num
    },
    (e) => (e as Error).message
  )
```

## tryCatchAsync

Async version of tryCatch for Promise-based operations.

```typescript
// Without error mapping
tryCatchAsync<T>(fn: () => Promise<T>): Promise<Validation<T, unknown>>

// With error mapping
tryCatchAsync<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): Promise<Validation<T, E>>
```

### Examples

```typescript
import { tryCatchAsync } from 'receta/validation'

// Fetch with validation
const fetchUser = async (id: string): Promise<Validation<User, unknown>> =>
  tryCatchAsync(() =>
    fetch(`/api/users/${id}`).then(r => r.json())
  )

// With error mapping
const fetchUserSafe = async (id: string): Promise<Validation<User, string>> =>
  tryCatchAsync(
    () => fetch(`/api/users/${id}`).then(r => r.json()),
    (e) => `Failed to fetch user: ${e}`
  )
```

### Real-World: API Calls

```typescript
// Database query
const queryUser = async (id: string): Promise<Validation<User, string>> =>
  tryCatchAsync(
    () => db.users.findOne({ id }),
    (e) => `Database error: ${(e as Error).message}`
  )

// File reading
const readConfig = async (path: string): Promise<Validation<Config, string>> =>
  tryCatchAsync(
    async () => {
      const content = await fs.readFile(path, 'utf-8')
      return JSON.parse(content)
    },
    (e) => `Failed to read config: ${(e as Error).message}`
  )

// External API with validation
const fetchAndValidate = async (url: string): Promise<Validation<Data, string>> =>
  pipe(
    await tryCatchAsync(
      () => fetch(url).then(r => r.json()),
      (e) => `Network error: ${e}`
    ),
    flatMap(validateData)
  )
```

## Comparison Table

| Constructor | Use When | Error Type | Async |
|------------|----------|------------|-------|
| `valid` | Creating success | N/A | No |
| `invalid` | Creating failure | Any | No |
| `fromPredicate` | Simple test with static error | Static | No |
| `fromPredicateWithError` | Test with dynamic error | Dynamic | No |
| `fromResult` | Converting Result | From Result | No |
| `tryCatch` | Wrapping throwing code | `unknown` or mapped | No |
| `tryCatchAsync` | Wrapping async code | `unknown` or mapped | Yes |

## Common Patterns

### Pattern 1: Validation Pipeline

```typescript
const validateUserInput = (input: string) =>
  pipe(
    tryCatch(() => JSON.parse(input)),        // Parse
    flatMap(validateUserSchema),              // Validate structure
    flatMap((user) => validate(user, [       // Validate rules
      fromPredicate(u => u.age >= 18, 'Must be adult'),
      fromPredicate(u => u.email.includes('@'), 'Invalid email')
    ]))
  )
```

### Pattern 2: Composable Validators

```typescript
// Build library of validators
const required = fromPredicate((s: string) => s.length > 0, 'Required')
const isEmail = fromPredicate((s: string) => s.includes('@'), 'Invalid email')
const minLen = (n: number) => fromPredicate(
  (s: string) => s.length >= n,
  `Min ${n} characters`
)

// Compose them
const validateEmail = (email: string) =>
  validate(email, [required, isEmail])
```

### Pattern 3: Custom Error Types

```typescript
interface ValidationError {
  field: string
  code: string
  message: string
}

const makeError = (field: string, code: string, message: string): ValidationError =>
  ({ field, code, message })

const validateUsername = (username: string): Validation<string, ValidationError> => {
  if (username.length === 0) {
    return invalid(makeError('username', 'REQUIRED', 'Username is required'))
  }
  if (username.length < 3) {
    return invalid(makeError('username', 'TOO_SHORT', 'Min 3 characters'))
  }
  return valid(username)
}
```

## Next Steps

- **[Transformers](./02-transformers.md)** - Transform validated values
- **[Validators](./03-validators.md)** - Built-in validators
- **[Combinators](./04-combinators.md)** - Combine validations with error accumulation
- **[Patterns](./05-patterns.md)** - Real-world validation recipes
