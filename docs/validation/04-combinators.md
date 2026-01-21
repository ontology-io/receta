# Combinators: Error Accumulation

Combinators are the **key feature** of the Validation module. They allow you to combine multiple validations and accumulate ALL errors, not just the first one.

## Overview

| Combinator | Purpose | Use When |
|------------|---------|----------|
| `collectErrors` | Accumulate errors from array | Independent validations |
| `validate` | Apply validators to single value | Multiple rules for one field |
| `validateAll` | Validate array elements | Bulk validation |
| `schema` | Validate object fields | Form/API validation |
| `partial` | Validate partial object | PATCH requests |

## The Core Difference: Error Accumulation

```typescript
// Result.collect: STOPS at first error (fail-fast)
Result.collect([err('e1'), err('e2'), err('e3')])
// => Err('e1')  ← Only first error!

// Validation.collectErrors: ACCUMULATES all errors (fail-slow)
collectErrors([invalid('e1'), invalid('e2'), invalid('e3')])
// => Invalid(['e1', 'e2', 'e3'])  ← All errors!
```

This is **why Validation exists**: better UX by showing users ALL problems at once.

## collectErrors

Accumulates ALL errors from an array of validations.

```typescript
collectErrors<T, E>(
  validations: readonly Validation<T, E>[]
): Validation<T[], E>
```

### Examples

```typescript
import { collectErrors, valid, invalid } from 'receta/validation'

// All valid
collectErrors([valid(1), valid(2), valid(3)])
// => Valid([1, 2, 3])

// Mix of valid and invalid - accumulates ALL errors
collectErrors([
  valid(1),
  invalid(['error1']),
  valid(2),
  invalid(['error2', 'error3'])
])
// => Invalid(['error1', 'error2', 'error3'])

// Multiple errors per validation
collectErrors([
  invalid(['e1', 'e2']),
  invalid(['e3', 'e4'])
])
// => Invalid(['e1', 'e2', 'e3', 'e4'])
```

### Real-World: Form Validation

```typescript
const validateForm = (data: FormData) =>
  collectErrors([
    validateName(data.name),
    validateEmail(data.email),
    validatePassword(data.password),
    validateAge(data.age)
  ])

// Returns ALL field errors at once:
// Invalid([
//   'Name too short',
//   'Invalid email',
//   'Password needs uppercase',
//   'Age must be 18+'
// ])
```

### Real-World: Multi-Step Wizard

```typescript
const validateWizard = (wizardData: WizardData) =>
  collectErrors([
    validateStep1(wizardData.step1),
    validateStep2(wizardData.step2),
    validateStep3(wizardData.step3),
    validateStep4(wizardData.step4),
    validateStep5(wizardData.step5)
  ])

// Shows user: "Errors in steps 2 and 4"
// User can jump directly to problematic steps
```

## validate

Applies multiple validators to a single value, accumulating all errors.

```typescript
validate<T, E>(
  value: T,
  validators: readonly Validator<T, T, E>[]
): Validation<T, E>
```

### Examples

```typescript
import { validate, fromPredicate } from 'receta/validation'

// Password validation with multiple rules
const validatePassword = (password: string) =>
  validate(password, [
    fromPredicate(s => s.length >= 8, 'At least 8 characters'),
    fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase'),
    fromPredicate(s => /[0-9]/.test(s), 'Need number'),
    fromPredicate(s => /[^A-Za-z0-9]/.test(s), 'Need special char')
  ])

// Weak password shows ALL failures
validatePassword('weak')
// => Invalid([
//   'At least 8 characters',
//   'Need uppercase',
//   'Need number',
//   'Need special char'
// ])

// Strong password passes all
validatePassword('Strong@Pass123')
// => Valid('Strong@Pass123')
```

### Real-World: Username Validation

```typescript
const validateUsername = (username: string) =>
  validate(username, [
    required('Username required'),
    minLength(3, 'Min 3 characters'),
    maxLength(20, 'Max 20 characters'),
    matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
    fromPredicate(
      async (u) => !(await usernameExists(u)),
      'Username already taken'
    )
  ])
```

### Real-World: Age Validation

```typescript
const validateAge = (age: number) =>
  validate(age, [
    min(0, 'Age cannot be negative'),
    max(150, 'Age seems unrealistic'),
    integer('Age must be whole number'),
    fromPredicate(
      (a) => a >= 18 || a <= 13,
      'Must be 18+ or under 13 with parent consent'
    )
  ])
```

## validateAll

Validates each element in an array with a single validator, accumulating errors.

```typescript
validateAll<T, U, E>(
  values: readonly T[],
  validator: Validator<T, U, E>
): Validation<U[], E>
```

### Examples

```typescript
import { validateAll, fromPredicate } from 'receta/validation'

const isPositive = (n: number) =>
  n > 0 ? valid(n) : invalid(`${n} is not positive`)

// All valid
validateAll([1, 2, 3], isPositive)
// => Valid([1, 2, 3])

// Multiple failures - accumulates ALL
validateAll([1, -2, 3, -4, 5], isPositive)
// => Invalid(['-2 is not positive', '-4 is not positive'])
```

### Real-World: CSV Import

```typescript
interface ProductRow {
  name: string
  price: number
  sku: string
}

const validateProduct = (row: unknown): Validation<ProductRow, string> => {
  // ... validation logic
}

const validateCSVImport = (rows: unknown[]) =>
  validateAll(rows, validateProduct)

// Returns ALL invalid rows with errors
const result = validateCSVImport(csvData)
if (isInvalid(result)) {
  // Show user: "Errors in rows 5, 23, 157, 892"
  console.log(`Found ${result.errors.length} errors`)
  result.errors.forEach((error, idx) => {
    console.log(`Row ${idx}: ${error}`)
  })
}
```

### Real-World: Batch API Validation

```typescript
const validateBatchCreate = (requests: unknown[]) =>
  validateAll(requests, validateCreateUser)

app.post('/api/users/batch', (req, res) => {
  const validation = validateBatchCreate(req.body.users)

  match(validation, {
    onValid: (users) => {
      // Create all users
      res.status(201).json({ created: users.length })
    },
    onInvalid: (errors) => {
      // Return all validation errors
      res.status(400).json({
        message: `${errors.length} validation errors`,
        errors
      })
    }
  })
})
```

## schema

Validates object fields independently, tracking which fields failed.

```typescript
schema<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: T
): Validation<T, FieldError<E>>
```

### Examples

```typescript
import { schema } from 'receta/validation'

interface User {
  name: string
  email: string
  age: number
}

const userSchema = {
  name: (n: string) =>
    validate(n, [required('Name required'), minLength(2)]),
  email: (e: string) =>
    validate(e, [required('Email required'), email()]),
  age: (a: number) =>
    validate(a, [min(18, 'Must be 18+'), max(120)])
}

// Valid user
schema(userSchema, {
  name: 'John',
  email: 'john@example.com',
  age: 25
})
// => Valid({ name: 'John', email: 'john@example.com', age: 25 })

// Invalid user - shows which fields failed
schema(userSchema, {
  name: 'J',
  email: 'invalid',
  age: 15
})
// => Invalid([
//   { field: 'name', errors: ['Must be at least 2 characters'] },
//   { field: 'email', errors: ['Invalid email format'] },
//   { field: 'age', errors: ['Must be 18+'] }
// ])
```

### Real-World: Registration Form

```typescript
interface RegistrationForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

const registrationSchema = {
  username: (u: string) =>
    validate(u, [
      required('Username required'),
      minLength(3),
      maxLength(20),
      matches(/^[a-zA-Z0-9_]+$/, 'Invalid characters')
    ]),

  email: (e: string) =>
    validate(e, [required('Email required'), email()]),

  password: (p: string) =>
    validate(p, [
      required('Password required'),
      minLength(8),
      matches(/[A-Z]/, 'Need uppercase'),
      matches(/[0-9]/, 'Need number')
    ]),

  confirmPassword: (c: string, form: RegistrationForm) =>
    c === form.password
      ? valid(c)
      : invalid('Passwords must match'),

  terms: (t: boolean) =>
    t === true
      ? valid(t)
      : invalid('You must accept the terms')
}

const handleSubmit = (formData: RegistrationForm) => {
  const validation = schema(registrationSchema, formData)

  match(validation, {
    onValid: (data) => {
      // Submit to API
      createAccount(data)
    },
    onInvalid: (errors) => {
      // Show all field errors
      errors.forEach(({ field, errors: fieldErrors }) => {
        showFieldError(field, fieldErrors)
      })
    }
  })
}
```

### Real-World: API Request Validation

```typescript
app.post('/api/products', (req, res) => {
  const productSchema = {
    name: (n: string) =>
      validate(n, [required('Name required'), maxLength(100)]),
    price: (p: number) =>
      validate(p, [min(0, 'Price must be positive'), finite()]),
    category: oneOf(['electronics', 'books', 'clothing']),
    tags: (t: string[]) =>
      validate(t, [nonEmpty('At least one tag'), maxItems(10)])
  }

  const validation = schema(productSchema, req.body)

  if (isInvalid(validation)) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: validation.errors
    })
  }

  const product = createProduct(validation.value)
  res.status(201).json(product)
})
```

## partial

Validates partial objects (only present fields).

```typescript
partial<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: Partial<T>
): Validation<Partial<T>, FieldError<E>>
```

### Examples

```typescript
import { partial } from 'receta/validation'

const userSchema = {
  name: (n: string) => validate(n, [required('Name required'), minLength(2)]),
  email: (e: string) => validate(e, [required('Email required'), email()]),
  age: (a: number) => validate(a, [min(18), max(120)])
}

// Only validates present fields
partial(userSchema, { name: 'John' })
// => Valid({ name: 'John' })

partial(userSchema, { name: 'J', email: 'invalid' })
// => Invalid([
//   { field: 'name', errors: ['Must be at least 2 characters'] },
//   { field: 'email', errors: ['Invalid email format'] }
// ])

// Missing fields not validated
partial(userSchema, {})
// => Valid({})
```

### Real-World: PATCH Request

```typescript
app.patch('/api/users/:id', (req, res) => {
  const userSchema = {
    name: (n: string) => validate(n, [minLength(2), maxLength(50)]),
    email: (e: string) => email()(e),
    age: (a: number) => validate(a, [min(18), max(120)])
  }

  // Only validate fields that are being updated
  const validation = partial(userSchema, req.body)

  if (isInvalid(validation)) {
    return res.status(400).json({ errors: validation.errors })
  }

  const updated = updateUser(req.params.id, validation.value)
  res.json(updated)
})
```

### Real-World: Settings Update

```typescript
interface UserSettings {
  notifications: boolean
  theme: 'light' | 'dark'
  language: string
  timezone: string
}

const settingsSchema = {
  notifications: (n: boolean) => valid(n),
  theme: oneOf(['light', 'dark']),
  language: oneOf(['en', 'es', 'fr', 'de']),
  timezone: (tz: string) =>
    validate(tz, [
      required('Timezone required'),
      fromPredicate(isValidTimezone, 'Invalid timezone')
    ])
}

const updateSettings = (userId: string, updates: Partial<UserSettings>) => {
  const validation = partial(settingsSchema, updates)

  return match(validation, {
    onValid: (validated) => saveUserSettings(userId, validated),
    onInvalid: (errors) => ({ error: 'Invalid settings', fields: errors })
  })
}
```

## Comparison with Result

| Feature | Result.collect | Validation.collectErrors |
|---------|---------------|------------------------|
| Behavior | **Fail-fast** (stops at first error) | **Error accumulation** (checks all) |
| Use case | Sequential operations | Independent validations |
| Performance | Faster (early termination) | Slower (checks everything) |
| UX | Shows one error | Shows all errors |
| Example | Auth → DB → API | Form with 10 fields |

### When to Use Which

```typescript
// ✅ Use Result for sequential operations
pipe(
  validateToken(token),
  Result.flatMap(getUser),           // Stop if token invalid
  Result.flatMap(checkPermissions)   // Stop if user not found
)

// ✅ Use Validation for independent checks
collectErrors([
  validateEmail(form.email),         // Check all fields
  validatePassword(form.password),
  validateAge(form.age)
])
```

## Common Patterns

### Pattern 1: Nested Validation

```typescript
const validateAddress = (addr: Address) =>
  schema({
    street: (s: string) => validate(s, [required('Street required')]),
    city: (c: string) => validate(c, [required('City required')]),
    zip: (z: string) => validate(z, [matches(/^\d{5}$/, 'Invalid ZIP')])
  }, addr)

const validateUser = (user: User) =>
  schema({
    name: (n: string) => validate(n, [required('Name required')]),
    email: (e: string) => validate(e, [required('Email required'), email()]),
    address: validateAddress  // Nested validation!
  }, user)
```

### Pattern 2: Conditional Validation

```typescript
const validatePayment = (payment: Payment) => {
  if (payment.method === 'card') {
    return schema({
      cardNumber: (c: string) => validate(c, [required('Card required'), ...]),
      cvv: (c: string) => validate(c, [required('CVV required'), ...])
    }, payment)
  } else {
    return schema({
      accountNumber: (a: string) => validate(a, [required('Account required'), ...]),
      routingNumber: (r: string) => validate(r, [required('Routing required'), ...])
    }, payment)
  }
}
```

### Pattern 3: Cross-Field Validation

```typescript
const validatePasswordChange = (data: PasswordChange) =>
  R.pipe(
    schema({
      newPassword: (p: string) => validateStrongPassword(p),
      confirmPassword: (c: string) => required('Confirmation required')(c)
    }, data),
    flatMap((validated) =>
      validated.newPassword === validated.confirmPassword
        ? valid(validated)
        : invalid({ field: 'confirmPassword', errors: ['Passwords must match'] })
    )
  )
```

## Next Steps

- **[Patterns](./05-patterns.md)** - Complete real-world validation recipes
- **[Migration](./06-migration.md)** - Moving from Zod/Yup/try-catch
- **[API Reference](./07-api-reference.md)** - Full function reference
