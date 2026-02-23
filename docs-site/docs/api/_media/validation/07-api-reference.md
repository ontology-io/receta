# API Reference & Quick Lookup

Complete reference for all Validation module functions with signatures, examples, and decision trees.

## Quick Navigation

- [Decision Tree](#decision-tree)
- [Types](#types)
- [Constructors](#constructors)
- [Type Guards](#type-guards)
- [Transformers](#transformers)
- [Combinators](#combinators)
- [Extractors](#extractors)
- [Validators](#validators)
- [Cheat Sheet](#cheat-sheet)

## Decision Tree

```
Which function do I need?

├─ Creating validations?
│  ├─ Success → valid(value)
│  ├─ Failure → invalid(errors)
│  ├─ From predicate → fromPredicate(pred, error)
│  ├─ From Result → fromResult(result)
│  └─ Wrap throwing code → tryCatch(fn)
│
├─ Combining validations?
│  ├─ Multiple validators, one value → validate(value, validators)
│  ├─ Multiple independent validations → collectErrors(validations)
│  ├─ Array of values → validateAll(values, validator)
│  └─ Object fields → schema(schema, object)
│
├─ Transforming values?
│  ├─ Transform valid value → map(validation, fn)
│  ├─ Transform errors → mapInvalid(validation, fn)
│  ├─ Chain validations → flatMap(validation, fn)
│  └─ Flatten nested → flatten(validation)
│
├─ Extracting values?
│  ├─ Get value or throw → unwrap(validation)
│  ├─ Get value or default → unwrapOr(validation, default)
│  ├─ Get value or compute → unwrapOrElse(validation, fn)
│  └─ Pattern matching → match(validation, { onValid, onInvalid })
│
└─ Checking type?
   ├─ Is valid? → isValid(validation)
   └─ Is invalid? → isInvalid(validation)
```

## Types

### Validation<T, E>

Union type representing either success or failure with accumulated errors.

```typescript
type Validation<T, E> = Valid<T> | Invalid<E>
```

### Valid<T>

Successful validation containing a value.

```typescript
interface Valid<T> {
  readonly _tag: 'Valid'
  readonly value: T
}
```

### Invalid<E>

Failed validation containing array of errors.

```typescript
interface Invalid<E> {
  readonly _tag: 'Invalid'
  readonly errors: readonly E[]
}
```

### Validator<T, U, E>

Function type for validators.

```typescript
type Validator<T, U, E> = (value: T) => Validation<U, E>
```

### ValidationSchema<T, E>

Schema for object validation.

```typescript
type ValidationSchema<T, E> = {
  [K in keyof T]: Validator<T[K], T[K], E>
}
```

### FieldError<E>

Field-level error with error array.

```typescript
interface FieldError<E> {
  readonly field: string
  readonly errors: readonly E[]
}
```

## Constructors

### valid

```typescript
valid<T>(value: T): Valid<T>
```

Creates a Valid validation.

**Example:**
```typescript
valid(42) // => Valid(42)
```

### invalid

```typescript
invalid<E>(errors: E | readonly E[]): Invalid<E>
```

Creates an Invalid validation with one or more errors.

**Example:**
```typescript
invalid('Error message') // => Invalid(['Error message'])
invalid(['Error 1', 'Error 2']) // => Invalid(['Error 1', 'Error 2'])
```

### fromPredicate

```typescript
fromPredicate<T, E>(
  predicate: (value: T) => boolean,
  error: E
): Validator<T, T, E>
```

Creates validator from predicate with static error.

**Example:**
```typescript
const isPositive = fromPredicate((n: number) => n > 0, 'Must be positive')
isPositive(5) // => Valid(5)
isPositive(-1) // => Invalid(['Must be positive'])
```

### fromPredicateWithError

```typescript
fromPredicateWithError<T, E>(
  predicate: (value: T) => boolean,
  getError: (value: T) => E
): Validator<T, T, E>
```

Creates validator with dynamic error message.

**Example:**
```typescript
const minLength = (min: number) =>
  fromPredicateWithError(
    (s: string) => s.length >= min,
    (s) => `Expected ${min} chars, got ${s.length}`
  )
```

### fromResult

```typescript
fromResult<T, E>(result: Result<T, E>): Validation<T, E>
```

Converts Result to Validation.

**Example:**
```typescript
fromResult(ok(42)) // => Valid(42)
fromResult(err('fail')) // => Invalid(['fail'])
```

### tryCatch

```typescript
tryCatch<T>(fn: () => T): Validation<T, unknown>
tryCatch<T, E>(fn: () => T, mapError: (error: unknown) => E): Validation<T, E>
```

Wraps throwing function.

**Example:**
```typescript
tryCatch(() => JSON.parse(str))
tryCatch(() => JSON.parse(str), (e) => e.message)
```

### tryCatchAsync

```typescript
tryCatchAsync<T>(fn: () => Promise<T>): Promise<Validation<T, unknown>>
tryCatchAsync<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): Promise<Validation<T, E>>
```

Async version of tryCatch.

**Example:**
```typescript
await tryCatchAsync(() => fetch(url).then(r => r.json()))
```

## Type Guards

### isValid

```typescript
isValid<T, E>(validation: Validation<T, E>): validation is Valid<T>
```

Checks if validation is Valid.

**Example:**
```typescript
if (isValid(validation)) {
  console.log(validation.value) // TypeScript knows this is safe
}
```

### isInvalid

```typescript
isInvalid<T, E>(validation: Validation<T, E>): validation is Invalid<E>
```

Checks if validation is Invalid.

**Example:**
```typescript
if (isInvalid(validation)) {
  console.log(validation.errors) // TypeScript knows this is safe
}
```

## Transformers

### map

```typescript
map<T, U, E>(validation: Validation<T, E>, fn: (value: T) => U): Validation<U, E>
map<T, U>(fn: (value: T) => U): <E>(validation: Validation<T, E>) => Validation<U, E>
```

Transforms valid value.

**Example:**
```typescript
map(valid(5), x => x * 2) // => Valid(10)

pipe(valid(5), map(x => x * 2)) // => Valid(10)
```

### mapInvalid

```typescript
mapInvalid<T, E, F>(validation: Validation<T, E>, fn: (error: E) => F): Validation<T, F>
mapInvalid<E, F>(fn: (error: E) => F): <T>(validation: Validation<T, E>) => Validation<T, F>
```

Transforms errors.

**Example:**
```typescript
mapInvalid(invalid(['e1', 'e2']), e => e.toUpperCase())
// => Invalid(['E1', 'E2'])
```

### flatMap

```typescript
flatMap<T, U, E>(
  validation: Validation<T, E>,
  fn: (value: T) => Validation<U, E>
): Validation<U, E>
flatMap<T, U, E>(
  fn: (value: T) => Validation<U, E>
): (validation: Validation<T, E>) => Validation<U, E>
```

Chains validations.

**Example:**
```typescript
flatMap(valid(5), x => valid(x * 2)) // => Valid(10)

pipe(
  valid(5),
  flatMap(x => valid(x * 2))
) // => Valid(10)
```

### flatten

```typescript
flatten<T, E>(validation: Validation<Validation<T, E>, E>): Validation<T, E>
```

Flattens nested validations.

**Example:**
```typescript
flatten(valid(valid(5))) // => Valid(5)
```

## Combinators

### collectErrors

**🌟 Core Feature: Error Accumulation**

```typescript
collectErrors<T, E>(validations: readonly Validation<T, E>[]): Validation<T[], E>
```

Accumulates ALL errors from array of validations.

**Example:**
```typescript
collectErrors([
  invalid(['error1']),
  invalid(['error2']),
  invalid(['error3'])
])
// => Invalid(['error1', 'error2', 'error3'])
```

### validate

```typescript
validate<T, E>(
  value: T,
  validators: readonly Validator<T, T, E>[]
): Validation<T, E>
```

Applies multiple validators to single value.

**Example:**
```typescript
validate(password, [
  minLength(8),
  matches(/[A-Z]/, 'Need uppercase'),
  matches(/[0-9]/, 'Need number')
])
```

### validateAll

```typescript
validateAll<T, U, E>(
  values: readonly T[],
  validator: Validator<T, U, E>
): Validation<U[], E>
```

Validates array with single validator.

**Example:**
```typescript
validateAll([1, -2, 3, -4], isPositive)
// => Invalid(['-2 is not positive', '-4 is not positive'])
```

### schema

```typescript
schema<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: T
): Validation<T, FieldError<E>>
```

Validates object fields independently.

**Example:**
```typescript
schema({
  name: (n: string) => validate(n, [required, minLength(2)]),
  email: (e: string) => validate(e, [required, email])
}, userData)
```

### partial

```typescript
partial<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: Partial<T>
): Validation<Partial<T>, FieldError<E>>
```

Validates partial object (only present fields).

**Example:**
```typescript
partial(userSchema, { name: 'John' }) // Only validates name
```

## Extractors

### unwrap

```typescript
unwrap<T, E>(validation: Validation<T, E>): T
```

Extracts value or throws error.

**Example:**
```typescript
unwrap(valid(42)) // => 42
unwrap(invalid(['error'])) // => throws Error
```

### unwrapOr

```typescript
unwrapOr<T, E>(validation: Validation<T, E>, defaultValue: T): T
unwrapOr<T>(defaultValue: T): <E>(validation: Validation<T, E>) => T
```

Extracts value or returns default.

**Example:**
```typescript
unwrapOr(valid(42), 0) // => 42
unwrapOr(invalid(['error']), 0) // => 0
```

### unwrapOrElse

```typescript
unwrapOrElse<T, E>(
  validation: Validation<T, E>,
  fn: (errors: readonly E[]) => T
): T
```

Extracts value or computes default from errors.

**Example:**
```typescript
unwrapOrElse(
  invalid(['error1', 'error2']),
  (errors) => {
    console.error('Errors:', errors)
    return defaultValue
  }
)
```

### match

```typescript
match<T, E, R>(
  validation: Validation<T, E>,
  matcher: {
    onValid: (value: T) => R
    onInvalid: (errors: readonly E[]) => R
  }
): R
```

Pattern matching on validation.

**Example:**
```typescript
match(validation, {
  onValid: (value) => `Success: ${value}`,
  onInvalid: (errors) => `Errors: ${errors.join(', ')}`
})
```

## Validators

### String Validators

| Validator | Signature | Example |
|-----------|-----------|---------|
| `required` | `(msg: string) => Validator<string, string, string>` | `required('Name required')` |
| `minLength` | `(min: number, msg?: string) => Validator<string, string, string>` | `minLength(3)` |
| `maxLength` | `(max: number, msg?: string) => Validator<string, string, string>` | `maxLength(20)` |
| `lengthBetween` | `(min: number, max: number, msg?: string) => Validator<string, string, string>` | `lengthBetween(3, 20)` |
| `email` | `(msg?: string) => Validator<string, string, string>` | `email()` |
| `url` | `(msg?: string) => Validator<string, string, string>` | `url()` |
| `matches` | `(pattern: RegExp, msg: string) => Validator<string, string, string>` | `matches(/^[A-Z]/, 'Need uppercase')` |
| `alphanumeric` | `(msg?: string) => Validator<string, string, string>` | `alphanumeric()` |

### Number Validators

| Validator | Signature | Example |
|-----------|-----------|---------|
| `min` | `(min: number, msg?: string) => Validator<number, number, string>` | `min(0)` |
| `max` | `(max: number, msg?: string) => Validator<number, number, string>` | `max(100)` |
| `between` | `(min: number, max: number, msg?: string) => Validator<number, number, string>` | `between(0, 100)` |
| `positive` | `(msg?: string) => Validator<number, number, string>` | `positive()` |
| `negative` | `(msg?: string) => Validator<number, number, string>` | `negative()` |
| `integer` | `(msg?: string) => Validator<number, number, string>` | `integer()` |
| `notNaN` | `(msg?: string) => Validator<number, number, string>` | `notNaN()` |
| `finite` | `(msg?: string) => Validator<number, number, string>` | `finite()` |

### Array Validators

| Validator | Signature | Example |
|-----------|-----------|---------|
| `nonEmpty` | `<T>(msg: string) => Validator<T[], T[], string>` | `nonEmpty('List required')` |
| `minItems` | `<T>(min: number, msg?: string) => Validator<T[], T[], string>` | `minItems(2)` |
| `maxItems` | `<T>(max: number, msg?: string) => Validator<T[], T[], string>` | `maxItems(10)` |

### Generic Validators

| Validator | Signature | Example |
|-----------|-----------|---------|
| `oneOf` | `<T>(allowed: readonly T[], msg?: string) => Validator<T, T, string>` | `oneOf(['US', 'UK', 'CA'])` |
| `equals` | `<T>(expected: T, msg?: string) => Validator<T, T, string>` | `equals(true, 'Must agree')` |
| `defined` | `<T>(msg: string) => Validator<T \| null \| undefined, T, string>` | `defined('Value required')` |

## Cheat Sheet

### I want to...

| Task | Use This |
|------|----------|
| Create success | `valid(value)` |
| Create failure | `invalid(errors)` |
| Validate with predicate | `fromPredicate(pred, error)` |
| Apply multiple rules to one value | `validate(value, [validator1, validator2])` |
| Validate all form fields | `schema(schemaObj, formData)` |
| Validate array items | `validateAll(items, validator)` |
| **Accumulate all errors** | `collectErrors(validations)` |
| Transform valid value | `map(validation, fn)` |
| Chain validations | `flatMap(validation, fn)` |
| Get value safely | `unwrapOr(validation, default)` |
| Handle both cases | `match(validation, { onValid, onInvalid })` |
| Check if valid | `isValid(validation)` |

### Common Combinations

```typescript
// Form validation
schema(formSchema, formData)

// Password with multiple rules
validate(password, [minLength(8), hasUppercase, hasNumber])

// Bulk validation
validateAll(csvRows, validateRow)

// Chain validations
pipe(
  parseJSON(str),
  flatMap(validateSchema)
)

// Error accumulation
collectErrors([
  validateEmail(email),
  validatePassword(password),
  validateAge(age)
])
```

## Comparison: Validation vs Result

| Feature | Validation | Result |
|---------|------------|--------|
| **Error handling** | Array of errors | Single error |
| **Behavior** | Accumulates all errors | Stops at first error |
| **Use case** | Forms, independent fields | Sequential operations |
| **Example** | `collectErrors([...])` | `Result.collect([...])` |

**Rule of thumb:**
- **Independent checks** → Validation
- **Sequential steps** → Result

## Related Documentation

- **[Overview](./00-overview.md)** - Why Validation exists
- **[Constructors](./01-constructors.md)** - Creating validations
- **[Validators](./03-validators.md)** - Built-in validators
- **[Combinators](./04-combinators.md)** - Error accumulation
- **[Patterns](./05-patterns.md)** - Real-world recipes
- **[Migration](./06-migration.md)** - From Zod/Yup/try-catch
