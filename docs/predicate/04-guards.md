# Type Guards

> Runtime type checking with TypeScript type narrowing.

## Overview

Type guards are special predicates that narrow TypeScript types at runtime. When used in `if` statements or `filter()`, TypeScript automatically narrows the type.

| Guard | Narrows To | Example |
|-------|-----------|---------|
| `isString` | `string` | `isString(value)` → `value: string` |
| `isNumber` | `number` | `isNumber(value)` → excludes NaN |
| `isFiniteNumber` | `number` | Excludes NaN, Infinity |
| `isInteger` | `number` | Integer numbers only |
| `isBoolean` | `boolean` | `true` or `false` |
| `isNull` | `null` | Exactly `null` |
| `isUndefined` | `undefined` | Exactly `undefined` |
| `isNullish` | `null \| undefined` | Nullish values |
| `isDefined` | `NonNullable<T>` | Not null or undefined |
| `isArray` | `unknown[]` | Any array |
| `isObject` | `Record<string, unknown>` | Plain objects |
| `isFunction` | `Function` | Functions |
| `isDate` | `Date` | Date instances |
| `isRegExp` | `RegExp` | RegExp instances |
| `isError` | `Error` | Error instances |
| `isPromise` | `Promise<unknown>` | Promise instances |
| `isInstanceOf(Class)` | `Class` | Instance of specific class |

---

## Primitive Type Guards

### isString

```typescript
import * as R from 'remeda'
import { isString } from 'receta/predicate'

// Type narrowing in conditionals
const value: unknown = 'hello'
if (isString(value)) {
  console.log(value.toUpperCase()) // TypeScript knows value is string
}

// Filter mixed arrays
const mixed: unknown[] = ['hello', 42, 'world', true, 'test']
const strings = R.filter(mixed, isString)
// Type of strings: string[]
```

**Real-world: Parse API responses**

```typescript
interface ApiResponse {
  data: unknown
}

const parseUserName = (response: ApiResponse): string | null => {
  if (isString(response.data)) {
    return response.data
  }
  return null
}
```

### isNumber

Excludes `NaN` (unlike `typeof value === 'number'`).

```typescript
import { isNumber } from 'receta/predicate'

const mixed: unknown[] = [42, 'hello', 100, NaN, null]
const numbers = R.filter(mixed, isNumber)
// => [42, 100] (NaN excluded!)

// Type narrowing
const value: unknown = 42
if (isNumber(value)) {
  console.log(value * 2) // TypeScript knows value is number
}
```

**Real-world: Validate numeric input**

```typescript
const parseQuantity = (input: unknown): number | null => {
  if (isNumber(input) && input > 0) {
    return Math.floor(input)
  }
  return null
}
```

### isFiniteNumber

Excludes `NaN`, `Infinity`, and `-Infinity`.

```typescript
import { isFiniteNumber } from 'receta/predicate'

isFiniteNumber(42)        // => true
isFiniteNumber(Infinity)  // => false
isFiniteNumber(-Infinity) // => false
isFiniteNumber(NaN)       // => false
```

**Real-world: Validate calculations**

```typescript
const safeDivide = (a: number, b: number): number | null => {
  const result = a / b
  return isFiniteNumber(result) ? result : null
}

safeDivide(10, 2)  // => 5
safeDivide(10, 0)  // => null (Infinity)
```

### isInteger

```typescript
import { isInteger } from 'receta/predicate'

const numbers = [1, 1.5, 2, 2.5, 3]
R.filter(numbers, isInteger)
// => [1, 2, 3]
```

**Real-world: Validate IDs**

```typescript
const validateId = (value: unknown): value is number => {
  return isInteger(value) && value > 0
}
```

### isBoolean

```typescript
import { isBoolean } from 'receta/predicate'

const mixed: unknown[] = [true, 1, false, 'yes', 0]
const booleans = R.filter(mixed, isBoolean)
// Type: boolean[]
// => [true, false]
```

---

## Nullish Type Guards

### isNull

```typescript
import { isNull } from 'receta/predicate'

const values: unknown[] = [null, undefined, 0, '', false]
R.filter(values, isNull)
// => [null]
```

### isUndefined

```typescript
import { isUndefined } from 'receta/predicate'

const values: unknown[] = [null, undefined, 0, '']
R.filter(values, isUndefined)
// => [undefined]
```

### isNullish

Checks for `null` OR `undefined` (uses `== null`).

```typescript
import { isNullish, not } from 'receta/predicate'

const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]

// Remove nullish values
const defined = R.filter(values, not(isNullish))
// Type: string[]
// => ['hello', 'world']
```

**Real-world: Clean API responses**

```typescript
interface ApiUser {
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

const cleanUser = (user: ApiUser) => {
  const contacts = [user.email, user.phone, user.address]
  const validContacts = R.filter(contacts, not(isNullish))
  return { ...user, contacts: validContacts }
}
```

### isDefined

The inverse of `isNullish`. Narrows out `null` and `undefined`.

```typescript
import { isDefined } from 'receta/predicate'

const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]
const defined = R.filter(values, isDefined)
// Type: string[]
// => ['hello', 'world']

// Type narrowing
const value: string | null = getValueFromAPI()
if (isDefined(value)) {
  console.log(value.toUpperCase()) // TypeScript knows value is string
}
```

**Real-world: Filter optional array elements**

```typescript
interface User {
  name: string
  email?: string
}

const users: User[] = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob' },
  { name: 'Charlie', email: 'charlie@example.com' }
]

const emails = R.pipe(
  users,
  R.map((u) => u.email),
  R.filter(isDefined)
)
// Type: string[]
// => ['alice@example.com', 'charlie@example.com']
```

---

## Structural Type Guards

### isArray

```typescript
import { isArray } from 'receta/predicate'

const value: unknown = [1, 2, 3]
if (isArray(value)) {
  console.log(value.length) // TypeScript knows value is array
  console.log(value[0])     // Access elements
}

// Check if config value is array
const config: Record<string, unknown> = { hosts: ['a', 'b'] }
if (isArray(config.hosts)) {
  config.hosts.forEach((host) => connect(host))
}
```

### isObject

Checks for plain objects (not arrays, not null, not functions).

```typescript
import { isObject } from 'receta/predicate'

isObject({})           // => true
isObject({ a: 1 })     // => true
isObject([])           // => false (array)
isObject(null)         // => false
isObject(() => {})     // => false (function)
```

**Real-world: Validate JSON**

```typescript
const parseConfig = (json: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(json)
    return isObject(parsed) ? parsed : null
  } catch {
    return null
  }
}
```

### isFunction

```typescript
import { isFunction } from 'receta/predicate'

const mixed: unknown[] = [() => {}, 42, function() {}, 'test', class Foo {}]
const functions = R.filter(mixed, isFunction)
// Type: Function[]

// Check callback
const runCallback = (cb: unknown) => {
  if (isFunction(cb)) {
    cb()
  }
}
```

---

## Instance Type Guards

### isDate

```typescript
import { isDate } from 'receta/predicate'

isDate(new Date())      // => true
isDate('2024-01-01')    // => false (string)
isDate(Date.now())      // => false (number)

// Validate date input
const parseDate = (value: unknown): Date | null => {
  return isDate(value) ? value : null
}
```

### isError

```typescript
import { isError } from 'receta/predicate'

isError(new Error('fail'))         // => true
isError(new TypeError('invalid'))  // => true
isError('error message')           // => false

// Error handling
const handleFailure = (error: unknown) => {
  if (isError(error)) {
    console.error(error.message)
    console.error(error.stack)
  } else {
    console.error('Unknown error:', error)
  }
}
```

### isPromise

```typescript
import { isPromise } from 'receta/predicate'

isPromise(Promise.resolve(42))    // => true
isPromise(async () => {})         // => false (function, not promise)

const fn = async () => 42
isPromise(fn())                   // => true (calling it returns promise)

// Auto-await if promise
const getValue = async (value: unknown) => {
  if (isPromise(value)) {
    return await value
  }
  return value
}
```

### isRegExp

```typescript
import { isRegExp } from 'receta/predicate'

isRegExp(/test/)              // => true
isRegExp(new RegExp('test'))  // => true
isRegExp('/test/')            // => false (string)
```

### isInstanceOf

Create custom type guards for classes.

```typescript
import { isInstanceOf } from 'receta/predicate'

class User {
  constructor(public name: string) {}
}

class Product {
  constructor(public name: string) {}
}

const values: unknown[] = [
  new User('Alice'),
  { name: 'Bob' },
  new User('Charlie'),
  new Product('Widget')
]

const users = R.filter(values, isInstanceOf(User))
// Type: User[]
// => [User('Alice'), User('Charlie')]
```

**Real-world: Error type checking**

```typescript
class ApiError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

const handleError = (error: unknown) => {
  if (isInstanceOf(ApiError)(error)) {
    console.error(`API Error [${error.code}]: ${error.message}`)
  } else if (isError(error)) {
    console.error(`Error: ${error.message}`)
  } else {
    console.error('Unknown error:', error)
  }
}
```

---

## Mixed Array Filtering

One of the most powerful uses of type guards:

```typescript
import { isString, isNumber } from 'receta/predicate'

// API returns mixed types
const apiResponse: unknown[] = [
  'user-123',
  42,
  'admin-456',
  { id: 789 },
  100
]

// Extract strings
const userIds = R.filter(apiResponse, isString)
// Type: string[]
// => ['user-123', 'admin-456']

// Extract numbers
const counts = R.filter(apiResponse, isNumber)
// Type: number[]
// => [42, 100]
```

**Real-world: Parse webhook payloads**

```typescript
interface WebhookPayload {
  events: unknown[]
}

const parseEvents = (payload: WebhookPayload) => {
  const validEvents = R.filter(payload.events, isObject)
  // Now TypeScript knows validEvents is Record<string, unknown>[]
  return validEvents
}
```

---

## Integration with Result and Option

### With Result

```typescript
import { Result, ok, err } from 'receta/result'
import { isString, isNumber } from 'receta/predicate'

const parseUser = (data: unknown): Result<User, string> => {
  if (!isObject(data)) {
    return err('Expected object')
  }

  if (!isString(data.name)) {
    return err('Name must be string')
  }

  if (!isNumber(data.age)) {
    return err('Age must be number')
  }

  return ok({ name: data.name, age: data.age })
}
```

### With Option

```typescript
import { Option, some, none } from 'receta/option'
import { isNumber } from 'receta/predicate'

const parsePort = (value: unknown): Option<number> => {
  return isNumber(value) && value > 0 && value < 65536
    ? some(value)
    : none
}
```

---

## Combining Guards with Predicates

```typescript
import { and, or, where, isString, isNumber, gt } from 'receta/predicate'

// Filter for valid users (objects with string name and number age > 18)
const isValidUser = and(
  isObject,
  (obj): obj is { name: string; age: number } =>
    isString(obj.name) && isNumber(obj.age) && obj.age > 18
)

// Mixed array
const data: unknown[] = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  'invalid',
  { name: 'Charlie', age: 30 }
]

const validUsers = R.filter(data, isValidUser)
// Type: { name: string; age: number }[]
// => [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]
```

---

## Real-World Patterns

### Pattern 1: Form Validation

```typescript
interface FormData {
  email: unknown
  age: unknown
  agreeToTerms: unknown
}

const validateForm = (form: FormData): Result<ValidForm, string> => {
  if (!isString(form.email)) {
    return err('Email must be a string')
  }

  if (!isNumber(form.age) || form.age < 18) {
    return err('Age must be a number >= 18')
  }

  if (!isBoolean(form.agreeToTerms) || !form.agreeToTerms) {
    return err('Must agree to terms')
  }

  return ok({
    email: form.email,
    age: form.age,
    agreeToTerms: form.agreeToTerms
  })
}
```

### Pattern 2: Environment Variables

```typescript
const getEnvNumber = (key: string): number | null => {
  const value = process.env[key]
  if (!isDefined(value)) return null

  const num = Number(value)
  return isFiniteNumber(num) ? num : null
}

const PORT = getEnvNumber('PORT') ?? 3000
const MAX_CONNECTIONS = getEnvNumber('MAX_CONNECTIONS') ?? 100
```

### Pattern 3: API Response Parsing

```typescript
const parseGitHubUser = (data: unknown): Option<GitHubUser> => {
  if (!isObject(data)) return none

  const { login, id, avatar_url } = data

  if (!isString(login) || !isNumber(id) || !isString(avatar_url)) {
    return none
  }

  return some({ login, id, avatar_url })
}
```

### Pattern 4: Safe JSON Parsing

```typescript
const safeJsonParse = <T>(json: string): Option<T> => {
  try {
    const parsed = JSON.parse(json)
    return isDefined(parsed) ? some(parsed) : none
  } catch {
    return none
  }
}
```

---

## Performance Notes

Type guards are extremely fast (simple type checks):

```typescript
// ✅ Very fast - single typeof check
isString(value)
isNumber(value)
isBoolean(value)

// ✅ Fast - instanceof check
isDate(value)
isError(value)
isArray(value)

// ⚠️ Slightly slower - object check + validation
isObject(value)
```

---

## Testing Type Guards

```typescript
import { describe, it, expect } from 'vitest'
import { isString, isNumber, isDefined } from 'receta/predicate'

describe('Type guards', () => {
  it('isString narrows to string', () => {
    const value: unknown = 'hello'
    expect(isString(value)).toBe(true)

    if (isString(value)) {
      // TypeScript compilation test - should not error
      const upper: string = value.toUpperCase()
      expect(upper).toBe('HELLO')
    }
  })

  it('isNumber excludes NaN', () => {
    expect(isNumber(42)).toBe(true)
    expect(isNumber(NaN)).toBe(false)
  })

  it('isDefined filters nullish', () => {
    const values = ['a', null, 'b', undefined]
    const result = R.filter(values, isDefined)
    expect(result).toEqual(['a', 'b'])
  })
})
```

---

## Next Steps

- **[Common Patterns](./05-patterns.md)** - Complete real-world recipes
- **[Migration Guide](./06-migration.md)** - Refactor inline checks to type guards
- **[API Reference](./07-api-reference.md)** - Complete function listing
