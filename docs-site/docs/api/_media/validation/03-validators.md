# Built-in Validators

Receta provides 25+ ready-to-use validators for common validation scenarios. All validators return `Validation<T, string>` with descriptive error messages.

## Overview

| Category | Validators |
|----------|-----------|
| **String** | `required`, `minLength`, `maxLength`, `lengthBetween`, `matches`, `email`, `url`, `alphanumeric` |
| **Number** | `min`, `max`, `between`, `positive`, `negative`, `integer`, `notNaN`, `finite` |
| **Array** | `nonEmpty`, `minItems`, `maxItems` |
| **Generic** | `oneOf`, `equals`, `defined` |

## String Validators

### required

Validates that a string is not empty (after trimming whitespace).

```typescript
required(errorMessage: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { required } from 'receta/validation'

required('Name is required')('John')
// => Valid('John')

required('Name is required')('')
// => Invalid(['Name is required'])

required('Name is required')('   ')
// => Invalid(['Name is required'])  // Whitespace only
```

### minLength

Validates minimum string length.

```typescript
minLength(min: number, errorMessage?: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { minLength } from 'receta/validation'

minLength(3)('hello')
// => Valid('hello')

minLength(3)('hi')
// => Invalid(['Must be at least 3 characters'])

minLength(3, 'Too short')('hi')
// => Invalid(['Too short'])
```

### maxLength

Validates maximum string length.

```typescript
maxLength(max: number, errorMessage?: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { maxLength } from 'receta/validation'

maxLength(10)('hello')
// => Valid('hello')

maxLength(10)('very long string here')
// => Invalid(['Must be at most 10 characters'])
```

### lengthBetween

Validates string length within a range.

```typescript
lengthBetween(min: number, max: number, errorMessage?: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { lengthBetween } from 'receta/validation'

lengthBetween(3, 10)('hello')
// => Valid('hello')

lengthBetween(3, 10)('hi')
// => Invalid(['Must be between 3 and 10 characters'])

lengthBetween(3, 10)('very long string')
// => Invalid(['Must be between 3 and 10 characters'])
```

### email

Validates email address format.

```typescript
email(errorMessage?: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { email } from 'receta/validation'

email()('user@example.com')
// => Valid('user@example.com')

email()('not-an-email')
// => Invalid(['Invalid email address'])

email('Bad email')('invalid')
// => Invalid(['Bad email'])
```

### url

Validates URL format.

```typescript
url(errorMessage?: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { url } from 'receta/validation'

url()('https://example.com')
// => Valid('https://example.com')

url()('not-a-url')
// => Invalid(['Invalid URL'])
```

### matches

Validates string against regex pattern.

```typescript
matches(pattern: RegExp, errorMessage: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { matches } from 'receta/validation'

// Username pattern
matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores')('john_doe')
// => Valid('john_doe')

matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores')('john@doe')
// => Invalid(['Only letters, numbers, underscores'])

// Phone number
matches(/^\d{3}-\d{3}-\d{4}$/, 'Format: 123-456-7890')('555-123-4567')
// => Valid('555-123-4567')
```

### alphanumeric

Validates string contains only letters and numbers.

```typescript
alphanumeric(errorMessage?: string): Validator<string, string, string>
```

**Examples:**
```typescript
import { alphanumeric } from 'receta/validation'

alphanumeric()('John123')
// => Valid('John123')

alphanumeric()('John@123')
// => Invalid(['Must contain only letters and numbers'])
```

## Number Validators

### min

Validates number is greater than or equal to minimum.

```typescript
min(minimum: number, errorMessage?: string): Validator<number, number, string>
```

**Examples:**
```typescript
import { min } from 'receta/validation'

min(0)(5)
// => Valid(5)

min(0)(-1)
// => Invalid(['Must be at least 0'])

min(18, 'Must be adult')(17)
// => Invalid(['Must be adult'])
```

### max

Validates number is less than or equal to maximum.

```typescript
max(maximum: number, errorMessage?: string): Validator<number, number, string>
```

**Examples:**
```typescript
import { max } from 'receta/validation'

max(100)(50)
// => Valid(50)

max(100)(150)
// => Invalid(['Must be at most 100'])
```

### between

Validates number is within range (inclusive).

```typescript
between(minimum: number, maximum: number, errorMessage?: string): Validator<number, number, string>
```

**Examples:**
```typescript
import { between } from 'receta/validation'

between(0, 100)(50)
// => Valid(50)

between(0, 100)(-1)
// => Invalid(['Must be between 0 and 100'])

between(0, 100)(150)
// => Invalid(['Must be between 0 and 100'])
```

### positive

Validates number is positive (> 0).

```typescript
positive(errorMessage?: string): Validator<number, number, string>
```

**Examples:**
```typescript
import { positive } from 'receta/validation'

positive()(5)
// => Valid(5)

positive()(0)
// => Invalid(['Must be positive'])

positive()(-1)
// => Invalid(['Must be positive'])
```

### integer

Validates number is an integer.

```typescript
integer(errorMessage?: string): Validator<number, number, string>
```

**Examples:**
```typescript
import { integer } from 'receta/validation'

integer()(42)
// => Valid(42)

integer()(42.5)
// => Invalid(['Must be an integer'])
```

## Array Validators

### nonEmpty

Validates array is not empty.

```typescript
nonEmpty<T>(errorMessage: string): Validator<T[], T[], string>
```

**Examples:**
```typescript
import { nonEmpty } from 'receta/validation'

nonEmpty('List cannot be empty')([1, 2, 3])
// => Valid([1, 2, 3])

nonEmpty('List cannot be empty')([])
// => Invalid(['List cannot be empty'])
```

### minItems

Validates array has minimum number of items.

```typescript
minItems<T>(minCount: number, errorMessage?: string): Validator<T[], T[], string>
```

**Examples:**
```typescript
import { minItems } from 'receta/validation'

minItems(2)([1, 2, 3])
// => Valid([1, 2, 3])

minItems(2)([1])
// => Invalid(['Must have at least 2 items'])
```

## Generic Validators

### oneOf

Validates value is one of the allowed values.

```typescript
oneOf<T>(allowed: readonly T[], errorMessage?: string): Validator<T, T, string>
```

**Examples:**
```typescript
import { oneOf } from 'receta/validation'

oneOf(['admin', 'user', 'guest'])('admin')
// => Valid('admin')

oneOf(['admin', 'user', 'guest'])('superadmin')
// => Invalid(['Must be one of: admin, user, guest'])

oneOf([1, 2, 3], 'Invalid option')(2)
// => Valid(2)
```

### equals

Validates value equals expected value.

```typescript
equals<T>(expected: T, errorMessage?: string): Validator<T, T, string>
```

**Examples:**
```typescript
import { equals } from 'receta/validation'

equals('yes')('yes')
// => Valid('yes')

equals('yes')('no')
// => Invalid(['Must equal: yes'])

// Checkbox acceptance
equals(true, 'You must agree to the terms')(true)
// => Valid(true)
```

## Real-World Combinations

### User Registration

```typescript
import { validate, required, email, minLength, between, oneOf } from 'receta/validation'

const validateRegistration = (data: RegistrationForm) => {
  return schema({
    username: (u: string) =>
      validate(u, [
        required('Username required'),
        minLength(3, 'Min 3 characters'),
        maxLength(20, 'Max 20 characters'),
        matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores')
      ]),

    email: (e: string) =>
      validate(e, [
        required('Email required'),
        email('Invalid email')
      ]),

    password: (p: string) =>
      validate(p, [
        required('Password required'),
        minLength(8, 'Min 8 characters'),
        matches(/[A-Z]/, 'Need uppercase'),
        matches(/[0-9]/, 'Need number'),
        matches(/[^A-Za-z0-9]/, 'Need special char')
      ]),

    age: (a: number) =>
      validate(a, [
        min(18, 'Must be 18+'),
        max(120, 'Invalid age'),
        integer('Must be whole number')
      ]),

    country: oneOf(['US', 'UK', 'CA', 'AU'], 'Invalid country')
  }, data)
}
```

### Product Form

```typescript
const validateProduct = (data: ProductForm) => {
  return schema({
    name: (n: string) =>
      validate(n, [
        required('Product name required'),
        minLength(3),
        maxLength(100)
      ]),

    sku: (s: string) =>
      validate(s, [
        required('SKU required'),
        matches(/^[A-Z0-9-]+$/, 'Invalid SKU format')
      ]),

    price: (p: number) =>
      validate(p, [
        min(0, 'Price must be positive'),
        finite('Price must be finite')
      ]),

    category: oneOf(['electronics', 'books', 'clothing']),

    tags: (t: string[]) =>
      validate(t, [
        nonEmpty('At least one tag required'),
        maxItems(10, 'Max 10 tags')
      ])
  }, data)
}
```

### API Request Validation

```typescript
const validateCreateUser = (body: unknown) => {
  // Type narrowing first
  if (typeof body !== 'object' || body === null) {
    return invalid('Request body must be an object')
  }

  return schema({
    email: (e: unknown) =>
      typeof e === 'string'
        ? validate(e, [required('Email required'), email()])
        : invalid('Email must be a string'),

    role: (r: unknown) =>
      typeof r === 'string'
        ? oneOf(['admin', 'user', 'moderator'])(r)
        : invalid('Role must be a string'),

    age: (a: unknown) =>
      typeof a === 'number'
        ? validate(a, [min(18), max(120), integer()])
        : invalid('Age must be a number')
  }, body as any)
}
```

## Composing Validators

### Creating Custom Validators

```typescript
// Password strength validator
const strongPassword = (password: string) =>
  validate(password, [
    minLength(12, 'Strong passwords need 12+ characters'),
    matches(/[A-Z]/, 'Need uppercase'),
    matches(/[a-z]/, 'Need lowercase'),
    matches(/[0-9]/, 'Need number'),
    matches(/[^A-Za-z0-9]/, 'Need special character'),
    matches(/^(?!.*(.)\1{2})/, 'No more than 2 repeated characters')
  ])

// Phone number validator
const usPhoneNumber = matches(
  /^\d{3}-\d{3}-\d{4}$/,
  'Format: 123-456-7890'
)

// Credit card validator (basic)
const creditCard = (card: string) =>
  validate(card, [
    matches(/^\d{16}$/, 'Must be 16 digits'),
    fromPredicate(luhnCheck, 'Invalid card number')
  ])
```

### Reusable Validator Library

```typescript
// validators/common.ts
export const validators = {
  // String
  username: (u: string) =>
    validate(u, [
      required('Username required'),
      minLength(3),
      maxLength(20),
      alphanumeric()
    ]),

  // Email with common providers check
  businessEmail: (e: string) =>
    validate(e, [
      required('Email required'),
      email(),
      fromPredicate(
        (s: string) => !s.endsWith('@gmail.com') && !s.endsWith('@yahoo.com'),
        'Business email required'
      )
    ]),

  // Secure password
  securePassword: strongPassword,

  // Positive integer
  positiveInt: (n: number) =>
    validate(n, [positive(), integer()]),

  // URL with HTTPS
  secureUrl: (u: string) =>
    validate(u, [
      url(),
      fromPredicate((s: string) => s.startsWith('https://'), 'Must use HTTPS')
    ])
}

// Usage
import { validators } from './validators/common'

const result = validators.username('john_doe')
```

## Next Steps

- **[Combinators](./04-combinators.md)** - Combine validators with error accumulation
- **[Patterns](./05-patterns.md)** - Complete validation recipes
- **[API Reference](./07-api-reference.md)** - Full function reference
