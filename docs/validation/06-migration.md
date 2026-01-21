# Migration Guide

Step-by-step guide for migrating from try-catch, Zod, Yup, or other validation approaches to Receta Validation.

## Table of Contents

1. [From try-catch](#from-try-catch)
2. [From Zod](#from-zod)
3. [From Yup](#from-yup)
4. [From Result](#from-result)
5. [Migration Strategy](#migration-strategy)

## From try-catch

### Before: try-catch Validation

```typescript
// ❌ Old approach: Shows one error at a time
function validateUser(data: any) {
  if (!data.email) {
    throw new Error('Email is required')
  }
  if (!data.email.includes('@')) {
    throw new Error('Invalid email')  // Never reached if first check fails
  }
  if (!data.password) {
    throw new Error('Password is required')  // Never reached if email fails
  }
  if (data.password.length < 8) {
    throw new Error('Password too short')  // Never reached
  }
  return data
}

// Usage
try {
  const user = validateUser(formData)
  await saveUser(user)
} catch (error) {
  showError(error.message)  // Only shows FIRST error
}
```

### After: Validation with Error Accumulation

```typescript
// ✅ New approach: Shows ALL errors at once
import { schema, validate, required, email, minLength } from 'receta/validation'

const validateUser = (data: UserData) => {
  return schema({
    email: (e: string) =>
      validate(e, [
        required('Email is required'),
        email('Invalid email')
      ]),
    password: (p: string) =>
      validate(p, [
        required('Password is required'),
        minLength(8, 'Password too short')
      ])
  }, data)
}

// Usage
const validation = validateUser(formData)

match(validation, {
  onValid: async (user) => {
    await saveUser(user)
  },
  onInvalid: (errors) => {
    // Shows ALL errors at once!
    errors.forEach(({ field, errors }) => {
      showFieldError(field, errors)
    })
  }
})
```

### Step-by-Step Migration

**Step 1**: Identify validation code

```typescript
// Find code like this:
if (!value) throw new Error('...')
if (condition) throw new Error('...')
```

**Step 2**: Convert to validators

```typescript
// Replace with:
validate(value, [
  required('...'),
  fromPredicate(condition, '...')
])
```

**Step 3**: Group related validations

```typescript
// Multiple fields? Use schema:
schema({
  field1: validator1,
  field2: validator2
}, data)
```

**Step 4**: Replace try-catch with match

```typescript
// Replace:
try {
  validate()
} catch (e) {
  handleError(e)
}

// With:
match(validation, {
  onValid: handleSuccess,
  onInvalid: handleErrors
})
```

## From Zod

### Before: Zod Schema

```typescript
import { z } from 'zod'

// ❌ Zod approach
const userSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: z.string().email('Invalid email'),
  age: z.number().int().min(18, 'Must be 18+').max(120)
})

// Usage
try {
  const user = userSchema.parse(formData)
  await saveUser(user)
} catch (error) {
  if (error instanceof z.ZodError) {
    // Zod accumulates errors too, but different API
    const fieldErrors = error.flatten().fieldErrors
    showErrors(fieldErrors)
  }
}
```

### After: Receta Validation

```typescript
import { schema, validate, required, email, minLength, maxLength, matches, min, max, integer } from 'receta/validation'

// ✅ Receta approach
const userSchema = {
  username: (u: string) =>
    validate(u, [
      minLength(3, 'Username must be at least 3 characters'),
      maxLength(20, 'Username must be at most 20 characters'),
      matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores')
    ]),
  email: (e: string) =>
    email('Invalid email')(e),
  age: (a: number) =>
    validate(a, [
      integer('Age must be an integer'),
      min(18, 'Must be 18+'),
      max(120, 'Invalid age')
    ])
}

// Usage
const validation = schema(userSchema, formData)

match(validation, {
  onValid: async (user) => {
    await saveUser(user)
  },
  onInvalid: (errors) => {
    showErrors(errors)
  }
})
```

### Key Differences

| Feature | Zod | Receta Validation |
|---------|-----|-------------------|
| **API Style** | Method chaining | Function composition |
| **Type Inference** | Schema → Type | Type → Schema |
| **Pipe Support** | No | Yes (Remeda pipe) |
| **Error Accumulation** | Yes | Yes |
| **Async Validation** | `.refine()` method | Native Promise support |
| **Bundle Size** | ~13kb | Tree-shakeable (smaller) |

### Migration Steps

**Step 1**: Convert Zod validators to Receta

```typescript
// Zod
z.string().min(3).max(20).email()

// Receta
validate(value, [minLength(3), maxLength(20), email()])
```

**Step 2**: Convert object schemas

```typescript
// Zod
z.object({ field: z.string() })

// Receta
schema({ field: (v: string) => validate(v, [...]) }, data)
```

**Step 3**: Replace `.parse()` with `match()`

```typescript
// Zod
try {
  const data = schema.parse(input)
} catch (error) {
  // handle
}

// Receta
match(schema(schemaObj, input), {
  onValid: (data) => {...},
  onInvalid: (errors) => {...}
})
```

## From Yup

### Before: Yup Schema

```typescript
import * as yup from 'yup'

// ❌ Yup approach
const userSchema = yup.object({
  username: yup.string()
    .required('Username required')
    .min(3, 'Min 3 characters')
    .max(20, 'Max 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Invalid characters'),
  email: yup.string()
    .required('Email required')
    .email('Invalid email'),
  age: yup.number()
    .required('Age required')
    .integer('Must be integer')
    .min(18, 'Must be 18+')
})

// Usage
try {
  const user = await userSchema.validate(formData, { abortEarly: false })
  await saveUser(user)
} catch (error) {
  if (error instanceof yup.ValidationError) {
    const errors = error.inner.map(err => ({
      field: err.path,
      message: err.message
    }))
    showErrors(errors)
  }
}
```

### After: Receta Validation

```typescript
import { schema, validate, required, email, minLength, maxLength, matches, min, integer } from 'receta/validation'

// ✅ Receta approach
const userSchema = {
  username: (u: string) =>
    validate(u, [
      required('Username required'),
      minLength(3, 'Min 3 characters'),
      maxLength(20, 'Max 20 characters'),
      matches(/^[a-zA-Z0-9_]+$/, 'Invalid characters')
    ]),
  email: (e: string) =>
    validate(e, [
      required('Email required'),
      email('Invalid email')
    ]),
  age: (a: number) =>
    validate(a, [
      min(18, 'Must be 18+'),
      integer('Must be integer')
    ])
}

// Usage (synchronous by default)
const validation = schema(userSchema, formData)

match(validation, {
  onValid: async (user) => {
    await saveUser(user)
  },
  onInvalid: (errors) => {
    showErrors(errors)
  }
})
```

### Key Differences

| Feature | Yup | Receta Validation |
|---------|-----|-------------------|
| **API Style** | Method chaining | Function composition |
| **Async by Default** | Yes | No (explicit async when needed) |
| **Error Accumulation** | `abortEarly: false` | Always accumulates |
| **Type Safety** | Weak | Strong (TypeScript first) |
| **Pipe Support** | No | Yes |
| **Bundle Size** | ~14kb | Smaller (tree-shakeable) |

## From Result

### When to Migrate from Result to Validation

**Use Result** when:
- Sequential operations (auth → DB → process)
- Early termination desired
- First error is enough context

**Migrate to Validation** when:
- Independent field validations
- Users need to see all errors
- Forms, APIs, bulk operations

### Before: Result for Form Validation

```typescript
// ❌ Result shows only first error
import { Result, ok, err } from 'receta/result'

const validateForm = (data: FormData): Result<FormData, string> => {
  return Result.collect([
    validateEmail(data.email),      // Stops here if this fails
    validatePassword(data.password), // Never checked if email fails
    validateAge(data.age)            // Never checked if email fails
  ]).map(() => data)
}

// User sees only: "Invalid email"
// User fixes email, submits
// User sees: "Password too short"
// 😤 Frustrating UX!
```

### After: Validation Shows All Errors

```typescript
// ✅ Validation shows ALL errors
import { collectErrors, valid, invalid } from 'receta/validation'

const validateForm = (data: FormData): Validation<FormData, string> => {
  return collectErrors([
    validateEmail(data.email),      // Checks all three
    validatePassword(data.password), // Even if email fails
    validateAge(data.age)            // Shows all errors at once
  ]).map(() => data)
}

// User sees: "Invalid email", "Password too short", "Must be 18+"
// User fixes everything, submits once
// ✅ Better UX!
```

### Side-by-Side Comparison

```typescript
// Result: Fail-fast
Result.collect([
  err('error1'),
  err('error2'),  // Never checked
  err('error3')   // Never checked
])
// => Err('error1')

// Validation: Error accumulation
collectErrors([
  invalid('error1'),
  invalid('error2'),
  invalid('error3')
])
// => Invalid(['error1', 'error2', 'error3'])
```

## Migration Strategy

### Incremental Migration

You can migrate gradually without rewriting everything at once:

**Step 1**: Start with new forms

```typescript
// New forms: Use Validation
const validateNewForm = (data) => schema({...}, data)

// Existing code: Keep Result
const processData = (data) => Result.collect([...])
```

**Step 2**: Migrate high-traffic forms

```typescript
// Forms with user complaints about UX
const validateRegistration = (data) => schema({...}, data)
const validateCheckout = (data) => schema({...}, data)
```

**Step 3**: Keep Result for business logic

```typescript
// Keep Result for sequential operations
const processOrder = (order) =>
  pipe(
    validateAuth(token),
    Result.flatMap(checkInventory),
    Result.flatMap(chargePayment),
    Result.flatMap(createShipment)
  )
```

### Coexistence Pattern

Result and Validation work well together:

```typescript
// Validation for input
const validateInput = (data: unknown): Validation<UserData, FieldError<string>> => {
  return schema(userSchema, data)
}

// Result for processing
const processUser = (user: UserData): Result<ProcessedUser, ProcessError> => {
  return pipe(
    saveToDatabase(user),
    Result.flatMap(sendWelcomeEmail),
    Result.flatMap(createSession)
  )
}

// Combined workflow
const handleUserCreation = (data: unknown) => {
  const validation = validateInput(data)

  return match(validation, {
    onValid: (user) => processUser(user),  // Returns Result
    onInvalid: (errors) => err({ type: 'validation', errors })
  })
}
```

### Conversion Functions

```typescript
// Validation → Result (loses accumulation)
import { toResult } from 'receta/validation'

const validation = validateForm(data)
const result = toResult(validation)
// Invalid(['e1', 'e2']) => Err(['e1', 'e2'])

// Result → Validation
import { fromResult } from 'receta/validation'

const result = fetchUser(id)
const validation = fromResult(result)
// Err('error') => Invalid(['error'])
```

## Common Migration Patterns

### Pattern 1: Form Validation

```typescript
// Before
function validateForm(data: any) {
  const errors: string[] = []

  if (!data.email) errors.push('Email required')
  if (data.email && !isEmail(data.email)) errors.push('Invalid email')
  if (!data.password) errors.push('Password required')
  if (data.password && data.password.length < 8) errors.push('Password too short')

  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }

  return data
}

// After
const validateForm = (data: FormData) =>
  schema({
    email: (e: string) =>
      validate(e, [required('Email required'), email('Invalid email')]),
    password: (p: string) =>
      validate(p, [required('Password required'), minLength(8, 'Password too short')])
  }, data)
```

### Pattern 2: API Validation

```typescript
// Before
app.post('/api/users', (req, res) => {
  const errors: any[] = []

  if (!req.body.email) errors.push({ field: 'email', message: 'Required' })
  if (!req.body.name) errors.push({ field: 'name', message: 'Required' })

  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  const user = createUser(req.body)
  res.json(user)
})

// After
app.post('/api/users', (req, res) => {
  const validation = validateUser(req.body)

  match(validation, {
    onValid: (user) => {
      const created = createUser(user)
      res.json(created)
    },
    onInvalid: (errors) => {
      res.status(400).json({ errors })
    }
  })
})
```

## Migration Checklist

- [ ] Identify validation code (try-catch, if-throw, Zod, Yup)
- [ ] Determine if Result or Validation is better fit
  - [ ] Independent fields? → Validation
  - [ ] Sequential operations? → Result
- [ ] Convert validators to Receta validators
- [ ] Group related validations into schemas
- [ ] Replace error handling with `match`
- [ ] Test with invalid data (ensure all errors show)
- [ ] Update error display UI to show multiple errors
- [ ] Remove old validation library dependencies
- [ ] Update tests

## Troubleshooting

### "I'm not seeing all errors"

Check you're using Validation, not Result:

```typescript
// ❌ Result stops at first error
Result.collect([...])

// ✅ Validation accumulates all errors
collectErrors([...])
```

### "Too many errors showing"

That's the feature! But you can limit:

```typescript
const validation = validateForm(data)

if (isInvalid(validation)) {
  // Show first 5 errors only
  const limitedErrors = validation.errors.slice(0, 5)
  showErrors(limitedErrors)

  if (validation.errors.length > 5) {
    showMessage(`... and ${validation.errors.length - 5} more errors`)
  }
}
```

### "How do I validate dependent fields?"

Use `flatMap` for sequential validation:

```typescript
pipe(
  validatePassword(data.password),
  flatMap((password) =>
    data.confirmPassword === password
      ? valid(password)
      : invalid('Passwords must match')
  )
)
```

## Next Steps

- **[Patterns](./05-patterns.md)** - Real-world validation recipes
- **[API Reference](./07-api-reference.md)** - Complete function reference
- **[Examples](../../examples/validation-usage.ts)** - Runnable examples
