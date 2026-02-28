# Before & After Examples

Real-world examples showing how `eslint-plugin-receta` transforms vanilla JavaScript/TypeScript into functional, type-safe code.

## Example 1: API Data Processing

### Before (Vanilla JS)

```typescript
async function processUsers(ids: string[]) {
  const results = []

  for (const id of ids) {
    try {
      const response = await fetch(`/api/users/${id}`)
      const user = await response.json()

      if (user && user.age >= 18) {
        results.push(user.name.toUpperCase())
      }
    } catch (e) {
      console.error(`Failed to fetch user ${id}:`, e)
    }
  }

  return results
}
```

**Issues:**

- ❌ Try-catch hides errors instead of handling them
- ❌ Nullable checks with `if (user &&` are implicit
- ❌ No type safety for errors
- ❌ Imperative loops instead of composition
- ❌ Mixing concerns (fetching, filtering, transforming)

### After (With eslint-plugin-receta autofix)

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { Option, fromNullable } from 'receta/option'
import { mapAsync } from 'receta/async'

async function processUsers(ids: string[]): Promise<Result<string[], Error>> {
  return R.pipe(
    await mapAsync(ids, async (id) =>
      Result.tryCatchAsync(async () => {
        const response = await fetch(`/api/users/${id}`)
        return response.json()
      })
    ),
    Result.collect, // Convert Result<User>[] → Result<User[]>
    Result.map(
      R.pipe(
        R.map(fromNullable), // Convert User[] → Option<User>[]
        Option.collect, // Convert Option<User>[] → Option<User[]>
        R.filter(u => u.age >= 18),
        R.map(u => u.name.toUpperCase())
      )
    )
  )
}
```

**Benefits:**

- ✅ Explicit error handling with `Result`
- ✅ Type-safe nullability with `Option`
- ✅ Composable transformations with `R.pipe`
- ✅ Controlled concurrency with `mapAsync`
- ✅ Clear separation of concerns

---

## Example 2: Configuration Lookup

### Before (Vanilla JS)

```typescript
function getConfig(key: string): Config | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return parsed
  } catch (e) {
    console.error('Invalid config:', e)
    return null
  }
}

// Usage
const config = getConfig('app.settings')
if (config) {
  applySettings(config)
} else {
  applyDefaults()
}
```

**Issues:**

- ❌ Returns `null` — easy to forget null checks
- ❌ Silent error handling (logs but doesn't propagate)
- ❌ If/else logic for handling absence

### After (With eslint-plugin-receta)

```typescript
import { Result } from 'receta/result'
import { Option, fromNullable } from 'receta/option'

function getConfig(key: string): Result<Option<Config>, ParseError> {
  return R.pipe(
    fromNullable(localStorage.getItem(key)),
    Option.map(raw => Result.tryCatch(() => JSON.parse(raw))),
    Option.sequence // Option<Result<T>> → Result<Option<T>>
  )
}

// Usage
const result = getConfig('app.settings')

R.pipe(
  result,
  Result.map(
    Option.match({
      Some: applySettings,
      None: applyDefaults
    })
  ),
  Result.mapErr(err => console.error('Config error:', err))
)
```

**Benefits:**

- ✅ Explicit error types (`Result<T, ParseError>`)
- ✅ Composition of Option and Result
- ✅ Pattern matching for clearer intent
- ✅ Errors are values, not side effects

---

## Example 3: Array Transformations

### Before (Method Chaining)

```typescript
const activeUserEmails = users
  .filter(u => u.status === 'active')
  .filter(u => u.email !== null)
  .map(u => u.email.toLowerCase())
  .filter((email, i, arr) => arr.indexOf(email) === i) // unique
  .sort()
```

**Issues:**

- ❌ Verbose uniqueness check
- ❌ Not tree-shakeable (entire Array.prototype)
- ❌ Harder to extract and test individual steps
- ❌ Less type-safe (nullable email not handled properly)

### After (With eslint-plugin-receta)

```typescript
import * as R from 'remeda'
import { Option, fromNullable } from 'receta/option'

const activeUserEmails = R.pipe(
  users,
  R.filter(u => u.status === 'active'),
  R.map(u => fromNullable(u.email)),
  Option.collect,
  R.map(email => email.toLowerCase()),
  R.unique(),
  R.sort()
)
```

**Benefits:**

- ✅ Tree-shakeable (only bundle used functions)
- ✅ Better type inference
- ✅ Reusable pipeline steps
- ✅ Explicit nullable handling with `Option`

---

## Example 4: Error Recovery

### Before (Try-Catch with Fallback)

```typescript
function loadUserPreferences(userId: string): UserPrefs {
  try {
    const prefs = fetchPreferences(userId)
    return prefs
  } catch (e) {
    console.warn('Using default preferences:', e)
    return DEFAULT_PREFS
  }
}
```

**Issues:**

- ❌ Always returns a value (hides errors)
- ❌ No way to know if defaults were used
- ❌ Side effect (console.warn) mixed with logic

### After (With eslint-plugin-receta)

```typescript
import { Result, unwrapOr } from 'receta/result'

function loadUserPreferences(userId: string): Result<UserPrefs, Error> {
  return Result.tryCatch(() => fetchPreferences(userId))
}

// Usage with explicit fallback
const prefs = unwrapOr(loadUserPreferences(userId), DEFAULT_PREFS)

// Or track whether defaults were used
const prefsResult = loadUserPreferences(userId)
const prefs = Result.unwrapOr(prefsResult, DEFAULT_PREFS)
const usingDefaults = Result.isErr(prefsResult)

if (usingDefaults) {
  console.warn('Using default preferences')
}
```

**Benefits:**

- ✅ Caller decides fallback strategy
- ✅ Explicit tracking of success/failure
- ✅ Pure function (no side effects)
- ✅ Composable with other Result operations

---

## Example 5: Validation Pipeline

### Before (Imperative Validation)

```typescript
function validateUser(data: unknown): User | null {
  if (typeof data !== 'object' || data === null) return null

  const obj = data as Record<string, unknown>

  if (typeof obj.name !== 'string' || obj.name.length === 0) return null
  if (typeof obj.email !== 'string' || !obj.email.includes('@')) return null
  if (typeof obj.age !== 'number' || obj.age < 0) return null

  return {
    name: obj.name,
    email: obj.email,
    age: obj.age
  }
}
```

**Issues:**

- ❌ Returns `null` (loses error information)
- ❌ Multiple early returns
- ❌ No error messages
- ❌ Hard to test individual validations

### After (With eslint-plugin-receta)

```typescript
import * as R from 'remeda'
import { Validation, validate, isString, isNumber } from 'receta/validation'

const validateName = validate(
  isString,
  (s: string) => s.length > 0,
  'Name must be non-empty string'
)

const validateEmail = validate(
  isString,
  (s: string) => s.includes('@'),
  'Email must contain @'
)

const validateAge = validate(
  isNumber,
  (n: number) => n >= 0,
  'Age must be non-negative'
)

function validateUser(data: unknown): Validation<User> {
  return Validation.struct({
    name: validateName(data?.name),
    email: validateEmail(data?.email),
    age: validateAge(data?.age)
  })
}

// Usage
const result = validateUser(unknownData)

Validation.match(result, {
  Valid: user => console.log('Valid user:', user),
  Invalid: errors => console.error('Validation errors:', errors)
})
```

**Benefits:**

- ✅ Accumulates all errors (not just first)
- ✅ Clear error messages
- ✅ Reusable validators
- ✅ Type-safe struct validation

---

## Migration Strategy

### Step 1: Enable Warnings

```javascript
// eslint.config.mjs
export default [
  {
    plugins: { receta },
    rules: {
      'receta/prefer-result-over-try-catch': 'warn',
      'receta/prefer-option-over-null': 'warn',
      'receta/prefer-pipe-composition': 'warn',
    },
  },
]
```

### Step 2: Auto-fix Safe Files

```bash
# Fix specific files
npx eslint --fix src/utils/*.ts

# Or fix all
npx eslint --fix .
```

### Step 3: Manual Review

Review autofixed code:

- ✅ Verify imports are correct
- ✅ Check type annotations match intent
- ✅ Test that behavior is unchanged

### Step 4: Enable Strict Mode

Once confident, switch to errors:

```javascript
rules: {
  'receta/prefer-result-over-try-catch': 'error',
  'receta/prefer-option-over-null': 'error',
  'receta/prefer-pipe-composition': 'error',
}
```

---

## Performance Impact

**Negligible runtime overhead:**

- Result/Option are simple discriminated unions
- Remeda functions are highly optimized
- Tree-shaking removes unused code

**Developer productivity gains:**

- ✅ Fewer bugs from null/undefined
- ✅ Easier refactoring with pure functions
- ✅ Better IntelliSense and type checking
- ✅ Consistent patterns across codebase

---

## Further Examples

See the [Receta examples directory](../../../examples/) for more patterns:

- Async concurrency control
- Error recovery strategies
- Complex validation scenarios
- Lens-based updates
- Memoization patterns
