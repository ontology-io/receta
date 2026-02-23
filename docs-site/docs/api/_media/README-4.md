# Validation Documentation

Complete guide to the Validation module - data validation with error accumulation.

## Quick Start

```typescript
import { validate, schema, email, minLength, min } from 'receta/validation'

// Single field with multiple rules
const validatePassword = (password: string) =>
  validate(password, [
    fromPredicate(s => s.length >= 8, 'At least 8 characters'),
    fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase letter'),
    fromPredicate(s => /[0-9]/.test(s), 'Need number')
  ])

// Multi-field form
const userSchema = schema({
  email: pipe(required, email),
  password: validatePassword,
  age: pipe(required, min(18))
})

validateForm(formData)
// => Shows ALL errors at once, not just first one!
```

## Documentation Structure

### 📚 Learning Path

**New to Validation?** Follow this order:

1. **[Overview](./00-overview.md)** (~10 min) - Why Validation? When to use it vs Result?
2. **[Constructors](./01-constructors.md)** (~5 min) - Creating validations: `valid`, `invalid`, `fromPredicate`
3. **[Validators](./03-validators.md)** (~10 min) - Built-in validators: `email`, `minLength`, `min`, etc.
4. **[Combinators](./04-combinators.md)** (~10 min) - **Core feature**: `collectErrors`, `validate`, `schema`
5. **[Patterns](./05-patterns.md)** (~15 min) - Real-world examples: forms, APIs, CSV import

**Already familiar with FP?** Skip to [Combinators](./04-combinators.md) for the key differentiator.

### 📖 By Topic

#### I want to understand...
- **Why use Validation over Result?** → [Overview](./00-overview.md#validation-vs-result)
- **Error accumulation concept** → [Overview](./00-overview.md#the-solution)
- **When to use which** → [Overview](./00-overview.md#when-to-use-validation)

#### I want examples for...
- **Form validation** → [Patterns](./05-patterns.md#form-validation)
- **API request validation** → [Patterns](./05-patterns.md#api-validation)
- **CSV/bulk import** → [Patterns](./05-patterns.md#bulk-validation)
- **Multi-step wizard** → [Patterns](./05-patterns.md#wizard-validation)

#### I need to...
- **Create a validation** → [Constructors](./01-constructors.md)
- **Validate email/password** → [Validators](./03-validators.md)
- **Combine multiple validations** → [Combinators](./04-combinators.md)
- **Convert from Zod/Yup** → [Migration](./06-migration.md)

## Key Concepts

### Error Accumulation (The Differentiator)

```typescript
// Result: Stops at first error (fail-fast)
Result.collect([err('e1'), err('e2'), err('e3')])
// => Err('e1')  ← Only first error!

// Validation: Accumulates all errors (fail-slow)
collectErrors([invalid('e1'), invalid('e2'), invalid('e3')])
// => Invalid(['e1', 'e2', 'e3'])  ← All errors!
```

### Use Cases

| Use Case | Tool | Why? |
|----------|------|------|
| Form validation | Validation | Show all field errors |
| Auth pipeline | Result | Stop if token invalid |
| API validation | Validation | Return all invalid fields |
| Database query | Result | Stop on connection error |
| CSV import | Validation | Report all invalid rows |
| Sequential operations | Result | Dependent steps |

## Common Patterns

### Form Validation

```typescript
const registrationSchema = schema({
  username: pipe(required, minLength(3), maxLength(20)),
  email: pipe(required, email),
  password: pipe(required, minLength(8), hasUppercase),
  age: pipe(required, min(18))
})

const result = schema(registrationSchema, formData)
// => Shows ALL field errors at once
```

### API Request

```typescript
app.post('/api/users', (req, res) => {
  const validation = validateUser(req.body)

  match(validation, {
    onValid: (user) => res.status(201).json(user),
    onInvalid: (errors) => res.status(400).json({ errors })
  })
})
```

### Password Validation

```typescript
const validatePassword = (password: string) =>
  validate(password, [
    minLength(8, 'At least 8 characters'),
    fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase'),
    fromPredicate(s => /[0-9]/.test(s), 'Need number'),
    fromPredicate(s => /[^A-Za-z0-9]/.test(s), 'Need special char')
  ])
```

## Quick Reference

### Core Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `valid(value)` | Create successful validation | `Valid<T>` |
| `invalid(errors)` | Create failed validation | `Invalid<E>` |
| `fromPredicate(pred, err)` | Validator from predicate | `Validator<T, T, E>` |
| `validate(value, validators)` | Apply multiple validators | `Validation<T, E>` |
| `schema(schema, obj)` | Validate object fields | `Validation<T, FieldError<E>>` |
| `collectErrors(validations)` | **Accumulate all errors** | `Validation<T[], E>` |

### Built-in Validators

**String**: `required`, `email`, `url`, `minLength`, `maxLength`, `alphanumeric`
**Number**: `min`, `max`, `between`, `positive`, `integer`, `finite`
**Array**: `nonEmpty`, `minItems`, `maxItems`
**Generic**: `oneOf`, `equals`, `defined`

## Best Practices

### ✅ Do

- Use Validation for **independent fields** (forms, multi-field validation)
- Use `schema` for object validation with field-level errors
- Compose validators with `pipe` for reusability
- Use built-in validators (`email`, `minLength`) before custom ones
- Return Validation from API validators

### ❌ Don't

- Don't use Validation for **sequential operations** (use Result)
- Don't mix Validation and Result arbitrarily
- Don't validate dependent fields independently
- Don't ignore error accumulation benefits
- Don't use throwing functions (use `tryCatch`)

## TypeScript Tips

### Inference Works Great

```typescript
// TypeScript infers Validation<string, string>
const result = validate('password', [
  minLength(8, 'Too short'),
  fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase')
])
```

### Type Guards for Safety

```typescript
if (isValid(validation)) {
  // TypeScript knows: validation.value exists
  console.log(validation.value)
}

if (isInvalid(validation)) {
  // TypeScript knows: validation.errors exists
  console.log(validation.errors)
}
```

### Custom Error Types

```typescript
interface ApiError {
  code: string
  message: string
  field?: string
}

const validator: Validator<string, string, ApiError> =
  (value) => value.length > 0
    ? valid(value)
    : invalid({ code: 'REQUIRED', message: 'Field required' })
```

## Performance

- **Error accumulation**: Runs all validators (vs Result's early termination)
- **Trade-off**: Better UX (show all errors) vs slightly more computation
- **When it matters**: Bulk validation with thousands of items
- **Optimization**: Use `Result.collect` for sequential operations

## Testing

```typescript
import { expect } from 'bun:test'
import { validatePassword, isValid, isInvalid } from './validators'

test('password validation accumulates errors', () => {
  const result = validatePassword('weak')

  expect(isInvalid(result)).toBe(true)
  if (isInvalid(result)) {
    expect(result.errors).toContain('At least 8 characters')
    expect(result.errors).toContain('Need uppercase')
    expect(result.errors.length).toBe(4)  // All 4 errors!
  }
})
```

## Getting Help

- **Examples**: See [examples/validation-usage.ts](../../examples/validation-usage.ts)
- **API Reference**: [07-api-reference.md](./07-api-reference.md)
- **Patterns**: [05-patterns.md](./05-patterns.md)
- **Issues**: Report at [GitHub Issues](https://github.com/your-repo/issues)

## Next Steps

1. **New to Validation?** Start with [Overview](./00-overview.md)
2. **Want to build forms?** Jump to [Patterns](./05-patterns.md#form-validation)
3. **Coming from Zod?** Read [Migration Guide](./06-migration.md)
4. **Need API docs?** Check [API Reference](./07-api-reference.md)
