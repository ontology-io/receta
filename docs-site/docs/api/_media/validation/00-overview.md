# Validation: Error Accumulation for Forms & APIs

> **TL;DR**: Like Result, but collects *all* errors instead of stopping at the first one. Perfect for form validation where users need to see every field error at once.

## The Problem: "Fix one error, submit, find another error"

### The Frustrating User Experience

You've experienced this as a user filling out a form:

```typescript
// Traditional validation with try/catch or Result
function validateForm(data) {
  if (data.email.length === 0) throw new Error('Email required')
  if (!data.email.includes('@')) throw new Error('Invalid email')  // Never reached!
  if (data.password.length < 8) throw new Error('Password too short')  // Never reached!
  if (!/[A-Z]/.test(data.password)) throw new Error('Need uppercase')  // Never reached!
  return data
}

// User sees: "Email required"
// User fixes email, submits again
// User sees: "Invalid email"
// User fixes email, submits again
// User sees: "Password too short"
// User fixes password, submits again
// User sees: "Need uppercase"
// 😤 User gives up
```

**The user had 4 errors but only learned about them one at a time.**

### How Modern Products Handle This

**Stripe Checkout** (actual behavior):
```
When you submit invalid payment info, Stripe shows:
❌ Email address is invalid
❌ Card number is incomplete
❌ Expiration date is invalid
❌ CVC is incomplete

All at once. You fix everything, then submit.
```

**GitHub Pull Request** (actual behavior):
```
When PR validation fails:
❌ Title cannot be empty
❌ At least one reviewer is required
❌ All CI checks must pass
❌ Branch has merge conflicts

All errors shown immediately.
```

**Vercel Deployment** (actual behavior):
```
Build validation errors:
❌ Missing environment variable: DATABASE_URL
❌ Missing environment variable: API_KEY
❌ Invalid Node version: requires >=18.0.0

All configuration errors at once.
```

## The Solution: Validation with Error Accumulation

```typescript
import { validate, schema, collectErrors } from 'receta/validation'

// Validation accumulates ALL errors
const validatePassword = (password: string) =>
  validate(password, [
    fromPredicate(s => s.length >= 8, 'At least 8 characters'),
    fromPredicate(s => /[A-Z]/.test(s), 'At least one uppercase'),
    fromPredicate(s => /[0-9]/.test(s), 'At least one number'),
    fromPredicate(s => /[^A-Za-z0-9]/.test(s), 'At least one special char')
  ])

validatePassword('weak')
// => Invalid([
//   'At least 8 characters',
//   'At least one uppercase',
//   'At least one number',
//   'At least one special char'
// ])
// User sees ALL 4 errors immediately! ✨
```

### Multi-Field Forms

```typescript
const userSchema = schema({
  email: pipe(required, email),
  password: validatePassword,
  age: pipe(required, min(18)),
  country: oneOf(['US', 'UK', 'CA', 'AU'])
})

validateForm({ email: '', password: 'weak', age: 15, country: 'XX' })
// => Invalid([
//   { field: 'email', errors: ['Email is required'] },
//   { field: 'password', errors: ['At least 8 characters', ...] },
//   { field: 'age', errors: ['Must be at least 18'] },
//   { field: 'country', errors: ['Invalid country'] }
// ])
// Shows ALL field errors at once!
```

## Validation vs Result: When to Use Which?

### Result: Fail-Fast (Stop at First Error)

```typescript
import { Result } from 'receta/result'

// Result.collect stops at first error
Result.collect([
  ok(1),
  err('error1'),  // Stops here!
  err('error2'),  // Never checked
  err('error3')   // Never checked
])
// => Err('error1')
```

**Use Result when:**
- ✅ Business logic validation (auth, permissions)
- ✅ Sequential operations (database → API → cache)
- ✅ Early termination is desired
- ✅ First error is enough context

**Example: User authentication**
```typescript
pipe(
  validateToken(token),           // Stop if token invalid
  Result.flatMap(getUser),        // Stop if user not found
  Result.flatMap(checkPermissions) // Stop if no permission
)
// No point checking permissions if token is invalid!
```

### Validation: Error Accumulation (Collect All Errors)

```typescript
import { Validation } from 'receta/validation'

// collectErrors accumulates all errors
collectErrors([
  invalid(['error1']),
  invalid(['error2']),
  invalid(['error3'])
])
// => Invalid(['error1', 'error2', 'error3'])
```

**Use Validation when:**
- ✅ Form validation (show all field errors)
- ✅ API request validation (return all invalid fields)
- ✅ Bulk data validation (CSV import, batch processing)
- ✅ Configuration validation (all missing env vars)

**Example: Form submission**
```typescript
// User needs to see ALL errors to fix the form
collectErrors([
  validateEmail(form.email),     // Check all fields
  validatePassword(form.password),
  validateAge(form.age),
  validateCountry(form.country)
])
// => All errors at once, better UX!
```

## Comparison Table

| Feature | Result | Validation |
|---------|--------|------------|
| Error handling | Single error | Array of errors |
| Behavior | **Fail-fast** (stops at first) | **Accumulates all** |
| Best for | Sequential operations | Independent fields |
| Use case | Business logic, API calls | Forms, bulk validation |
| Example | Auth → DB → Process | Form with 10 fields |

## Real-World Use Cases

### 1. Form Validation

**Problem**: Registration form with multiple fields.
**Solution**: Show all validation errors at once.

```typescript
const registrationSchema = schema({
  username: pipe(required, minLength(3), maxLength(20)),
  email: pipe(required, email),
  password: pipe(required, minLength(8), hasUppercase, hasNumber),
  age: pipe(required, min(18), max(120)),
  terms: equals(true, 'You must accept the terms')
})

// Shows all invalid fields immediately
validateForm(formData)
```

### 2. API Request Validation

**Problem**: REST API needs to validate request body.
**Solution**: Return all validation errors in single response.

```typescript
app.post('/api/users', (req, res) => {
  const validation = validateCreateUser(req.body)

  match(validation, {
    onValid: (user) => res.status(201).json(user),
    onInvalid: (errors) => res.status(400).json({ errors })
  })
})

// Response shows all field errors:
// { errors: [
//   { field: 'email', errors: ['Invalid email'] },
//   { field: 'age', errors: ['Must be 18+'] }
// ] }
```

### 3. CSV Import / Bulk Validation

**Problem**: Importing 1000 rows from CSV.
**Solution**: Get complete error report for all invalid rows.

```typescript
const validateAll(csvRows, validateProduct)
// => Invalid([...all errors from all rows...])

// Show user: "Rows 5, 23, 157, 892 have errors"
// Instead of: "Row 5 has error" (then rerun to find row 23...)
```

### 4. Configuration Validation

**Problem**: App startup with environment variables.
**Solution**: Show all missing/invalid config at once.

```typescript
const configSchema = schema({
  DATABASE_URL: pipe(required, url),
  API_KEY: pipe(required, minLength(32)),
  PORT: pipe(required, integer, between(1000, 65535)),
  NODE_ENV: oneOf(['development', 'production', 'test'])
})

validateConfig(process.env)
// => Shows ALL missing env vars, not just first one
```

### 5. Multi-Step Wizards

**Problem**: 5-step wizard, validate all steps before final submit.
**Solution**: Accumulate errors across all steps.

```typescript
const validateWizard = collectErrors([
  validateStep1(data.step1),
  validateStep2(data.step2),
  validateStep3(data.step3),
  validateStep4(data.step4),
  validateStep5(data.step5)
])

// Show: "Steps 2 and 4 have errors"
// User can jump directly to those steps
```

## Mental Model: Quality Control Inspector

Think of Validation like a quality control inspector checking products on an assembly line:

**Result (Fail-Fast Inspector)**:
```
Inspector checks products one by one:
✓ Product 1: OK
❌ Product 2: Defect found! STOP LINE!
  (Products 3, 4, 5 never checked)

Good when: One defect means stop everything
```

**Validation (Thorough Inspector)**:
```
Inspector checks ALL products first:
✓ Product 1: OK
❌ Product 2: Defect A
✓ Product 3: OK
❌ Product 4: Defects B, C
❌ Product 5: Defect D

Report: "Found 4 defects across 3 products: A, B, C, D"

Good when: Need complete report before fixing
```

## Core Concepts

### 1. Error Accumulation

```typescript
// Multiple validators on single value
validate(password, [
  validator1,  // ❌ Fails
  validator2,  // ❌ Fails
  validator3   // ✓ Passes
])
// => Accumulates errors from validator1 AND validator2
```

### 2. Field-Level Errors

```typescript
// Object validation with field tracking
schema(userSchema, userData)
// => Invalid([
//   { field: 'email', errors: ['Invalid'] },
//   { field: 'age', errors: ['Too young'] }
// ])
// Knows WHICH fields failed
```

### 3. Composable Validators

```typescript
// Build complex validators from simple ones
const strongPassword = pipe(
  required,
  minLength(8),
  hasUppercase,
  hasNumber,
  hasSpecialChar
)

// Reuse across your app
```

## When to Use Validation

### ✅ Use Validation When:

1. **Forms with multiple fields** - Show all errors at once
2. **API request validation** - Return complete error details
3. **Bulk operations** - Process all items, report all failures
4. **Independent validations** - Each check is unrelated to others
5. **User needs full feedback** - Better UX with complete error list

### ❌ Don't Use Validation When:

1. **Sequential dependencies** - Later steps depend on earlier ones
2. **Early termination needed** - First error is enough
3. **Performance critical** - Don't want to run unnecessary checks
4. **Single validation** - No need for accumulation
5. **Business logic** - Use Result instead

### Examples:

```typescript
// ✅ Good: Form validation (independent fields)
schema(formSchema, formData)

// ❌ Bad: Authentication chain (sequential dependencies)
// Use Result instead:
pipe(
  validateToken(token),
  Result.flatMap(loadUser),
  Result.flatMap(checkPermissions)
)

// ✅ Good: API batch validation
validateAll(requests, validateRequest)

// ❌ Bad: File processing pipeline
// Use Result instead:
pipe(
  readFile(path),
  Result.flatMap(parseJSON),
  Result.flatMap(validateSchema),
  Result.flatMap(transform)
)
```

## What's Next?

Now that you understand **why** Validation exists, learn **how** to use it:

1. **[Constructors](./01-constructors.md)** - Creating validations with `valid`, `invalid`, `fromPredicate`
2. **[Transformers](./02-transformers.md)** - Transforming values with `map`, `flatMap`
3. **[Validators](./03-validators.md)** - Built-in validators for common cases
4. **[Combinators](./04-combinators.md)** - Combining validations with `collectErrors`, `validate`, `schema`
5. **[Patterns](./05-patterns.md)** - Real-world recipes for forms, APIs, bulk validation
6. **[Migration](./06-migration.md)** - Moving from try-catch, Zod, or Yup
7. **[API Reference](./07-api-reference.md)** - Complete function reference

Or jump straight to **[Common Patterns](./05-patterns.md)** for copy-paste examples!
