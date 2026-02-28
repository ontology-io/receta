/**
 * Validation Usage Examples
 *
 * Demonstrates real-world usage of the Validation module for error accumulation,
 * form validation, API validation, and bulk data validation.
 *
 * Run with: bun run examples/validation-usage.ts
 */

import * as R from 'remeda'
import {
  valid,
  invalid,
  validate,
  collectErrors,
  validateAll,
  schema,
  fromPredicate,
  match,
  map,
  flatMap,
  isValid,
  isInvalid,
  // Built-in validators
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  between,
  oneOf,
  type Validation,
  type FieldError,
} from '@ontologyio/receta/validation'

console.log('=== Validation Module Examples ===\n')

// =============================================================================
// Example 1: Basic Validation - Single Field with Multiple Rules
// =============================================================================

console.log('--- Example 1: Password Validation with Multiple Rules ---')

const validatePassword = (password: string): Validation<string, string> =>
  validate(password, [
    fromPredicate((s) => s.length >= 8, 'At least 8 characters'),
    fromPredicate((s) => /[A-Z]/.test(s), 'At least one uppercase letter'),
    fromPredicate((s) => /[a-z]/.test(s), 'At least one lowercase letter'),
    fromPredicate((s) => /[0-9]/.test(s), 'At least one number'),
    fromPredicate((s) => /[^A-Za-z0-9]/.test(s), 'At least one special character'),
  ])

// Weak password - accumulates ALL errors
const weakPassword = validatePassword('weak')
console.log('\nWeak password "weak":')
if (isInvalid(weakPassword)) {
  console.log('Errors:', weakPassword.errors)
  // => All 5 validation rules fail
}

// Strong password - passes all rules
const strongPassword = validatePassword('Strong@Pass123')
console.log('\nStrong password "Strong@Pass123":')
if (isValid(strongPassword)) {
  console.log('Valid password:', strongPassword.value)
}

// =============================================================================
// Example 2: Form Validation - Multiple Fields with Schema
// =============================================================================

console.log('\n\n--- Example 2: Registration Form Validation ---')

interface RegistrationForm {
  username: string
  email: string
  password: string
  age: number
  country: string
}

const registrationSchema = {
  username: (u: string) =>
    validate(u, [
      required('Username is required'),
      minLength(3, 'Username must be at least 3 characters'),
      maxLength(20, 'Username must be at most 20 characters'),
      fromPredicate((s) => /^[a-zA-Z0-9_]+$/.test(s), 'Only letters, numbers, and underscores'),
    ]),
  email: (e: string) =>
    validate(e, [required('Email is required'), email('Invalid email format')]),
  password: validatePassword,
  age: (a: number) =>
    validate(a, [
      min(18, 'Must be at least 18 years old'),
      max(120, 'Invalid age'),
      fromPredicate((n) => Number.isInteger(n), 'Age must be a whole number'),
    ]),
  country: (c: string) =>
    oneOf(
      ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'],
      'Please select a valid country'
    )(c),
}

// Valid form
const validForm: RegistrationForm = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'Strong@Pass123',
  age: 25,
  country: 'US',
}

console.log('\nValidating valid form...')
const validResult = schema(registrationSchema, validForm)
if (isValid(validResult)) {
  console.log('✓ Form is valid!')
}

// Invalid form - shows ALL field errors
const invalidForm: RegistrationForm = {
  username: 'ab', // too short
  email: 'invalid-email', // no @
  password: 'weak', // fails multiple rules
  age: 15, // under 18
  country: 'XX', // invalid country
}

console.log('\nValidating invalid form...')
const invalidResult = schema(registrationSchema, invalidForm)
if (isInvalid(invalidResult)) {
  console.log('✗ Form has errors:')
  invalidResult.errors.forEach(({ field, errors }) => {
    console.log(`  ${field}:`)
    errors.forEach((err) => console.log(`    - ${err}`))
  })
}

// =============================================================================
// Example 3: Error Accumulation vs Fail-Fast
// =============================================================================

console.log('\n\n--- Example 3: Error Accumulation (Key Feature) ---')

// Validation: Accumulates ALL errors
console.log('\nValidation.collectErrors - Accumulates ALL errors:')
const allValidations = [
  invalid(['Error from field 1']),
  invalid(['Error from field 2']),
  invalid(['Error from field 3']),
  invalid(['Error from field 4']),
]

const accumulated = collectErrors(allValidations)
if (isInvalid(accumulated)) {
  console.log('All errors accumulated:', accumulated.errors)
  // => ['Error from field 1', 'Error from field 2', 'Error from field 3', 'Error from field 4']
}

// =============================================================================
// Example 4: API Request Validation
// =============================================================================

console.log('\n\n--- Example 4: API Request Validation ---')

interface CreateUserRequest {
  email: string
  name: string
  role: 'admin' | 'user' | 'moderator'
  age: number
}

const validateCreateUser = (data: unknown): Validation<CreateUserRequest, FieldError<string>> => {
  // Type guard for unknown data
  const isObject = (val: unknown): val is Record<string, unknown> =>
    typeof val === 'object' && val !== null

  if (!isObject(data)) {
    return invalid({ field: 'body', errors: ['Request body must be an object'] })
  }

  const createUserSchema = {
    email: (e: unknown) =>
      typeof e === 'string'
        ? validate(e, [required('Email is required'), email('Invalid email')])
        : invalid('Email must be a string'),
    name: (n: unknown) =>
      typeof n === 'string'
        ? validate(n, [
            required('Name is required'),
            minLength(2, 'Name too short'),
            maxLength(50, 'Name too long'),
          ])
        : invalid('Name must be a string'),
    role: (r: unknown) =>
      typeof r === 'string'
        ? oneOf(['admin', 'user', 'moderator'] as const, 'Invalid role')(r as string)
        : invalid('Role must be a string'),
    age: (a: unknown) =>
      typeof a === 'number'
        ? validate(a, [min(18, 'Must be 18+'), max(120, 'Invalid age')])
        : invalid('Age must be a number'),
  }

  return schema(createUserSchema, data as CreateUserRequest)
}

// Valid API request
const validRequest = {
  email: 'alice@example.com',
  name: 'Alice',
  role: 'user' as const,
  age: 28,
}

console.log('\nValidating API request...')
const apiResult = validateCreateUser(validRequest)
match(apiResult, {
  onValid: (user) => {
    console.log('✓ Valid user data:', user)
    // In real API: save to database
  },
  onInvalid: (errors) => {
    console.log('✗ Validation errors:')
    errors.forEach(({ field, errors: fieldErrors }) => {
      console.log(`  ${field}: ${fieldErrors.join(', ')}`)
    })
    // In real API: return 400 Bad Request
  },
})

// Invalid API request
const invalidRequest = {
  email: 'not-an-email',
  name: 'A', // too short
  role: 'superadmin', // invalid role
  age: 15, // too young
}

console.log('\nValidating invalid API request...')
const invalidApiResult = validateCreateUser(invalidRequest)
if (isInvalid(invalidApiResult)) {
  console.log('✗ API validation failed with errors:')
  invalidApiResult.errors.forEach(({ field, errors }) => {
    console.log(`  ${field}: ${errors.join(', ')}`)
  })
}

// =============================================================================
// Example 5: Bulk Validation (CSV Import)
// =============================================================================

console.log('\n\n--- Example 5: Bulk Data Validation (CSV Import) ---')

interface Product {
  name: string
  price: number
  sku: string
}

const validateProduct = (data: unknown): Validation<Product, string> => {
  const isObject = (val: unknown): val is Record<string, unknown> =>
    typeof val === 'object' && val !== null

  if (!isObject(data)) {
    return invalid('Product must be an object')
  }

  const { name, price, sku } = data

  return R.pipe(
    collectErrors([
      typeof name === 'string'
        ? validate(name, [
            required('Name is required'),
            minLength(3, 'Name must be at least 3 characters'),
          ])
        : invalid('Name must be a string'),
      typeof price === 'number'
        ? validate(price, [min(0, 'Price must be positive')])
        : invalid('Price must be a number'),
      typeof sku === 'string'
        ? validate(sku, [
            required('SKU is required'),
            fromPredicate((s: string) => /^[A-Z0-9-]+$/.test(s), 'Invalid SKU format'),
          ])
        : invalid('SKU must be a string'),
    ]),
    map(([validName, validPrice, validSku]) => ({
      name: validName,
      price: validPrice,
      sku: validSku,
    }))
  )
}

// Simulated CSV data
const csvRows = [
  { name: 'Product 1', price: 29.99, sku: 'PROD-001' },
  { name: 'AB', price: -5, sku: 'invalid sku' }, // Multiple errors
  { name: 'Product 3', price: 49.99, sku: 'PROD-003' },
  { name: '', price: 19.99, sku: 'PROD-004' }, // Empty name
]

console.log('\nValidating CSV import (4 rows)...')
const bulkResult = validateAll(csvRows, validateProduct)

if (isInvalid(bulkResult)) {
  console.log(`✗ Bulk validation failed. Errors found:`)
  console.log(`  Total errors: ${bulkResult.errors.length}`)
  console.log('  All errors:', bulkResult.errors)
  // In real app: Show detailed error report with row numbers
} else {
  console.log('✓ All products valid!')
}

// =============================================================================
// Example 6: Chaining Validations
// =============================================================================

console.log('\n\n--- Example 6: Chaining Validations ---')

const parseAge = (str: string): Validation<number, string> => {
  const parsed = Number(str)
  return Number.isNaN(parsed) ? invalid('Not a valid number') : valid(parsed)
}

const validateAge = (age: number): Validation<number, string> =>
  validate(age, [
    min(0, 'Age cannot be negative'),
    max(150, 'Age seems unrealistic'),
    fromPredicate((n) => Number.isInteger(n), 'Age must be a whole number'),
  ])

const parseAndValidateAge = (str: string): Validation<number, string> =>
  R.pipe(parseAge(str), flatMap(validateAge))

console.log('\nParsing and validating "25":')
const validAge = parseAndValidateAge('25')
if (isValid(validAge)) {
  console.log('✓ Valid age:', validAge.value)
}

console.log('\nParsing and validating "25.5":')
const decimalAge = parseAndValidateAge('25.5')
if (isInvalid(decimalAge)) {
  console.log('✗ Invalid:', decimalAge.errors)
}

console.log('\nParsing and validating "not-a-number":')
const invalidAge = parseAndValidateAge('not-a-number')
if (isInvalid(invalidAge)) {
  console.log('✗ Invalid:', invalidAge.errors)
}

// =============================================================================
// Example 7: Conditional Validation
// =============================================================================

console.log('\n\n--- Example 7: Conditional Validation ---')

interface PaymentMethod {
  type: 'card' | 'bank'
  cardNumber?: string
  accountNumber?: string
}

const validatePaymentMethod = (method: PaymentMethod): Validation<PaymentMethod, string> => {
  if (method.type === 'card') {
    return method.cardNumber
      ? R.pipe(
          validate(method.cardNumber, [
            fromPredicate((s: string) => s.length === 16, 'Card number must be 16 digits'),
            fromPredicate((s: string) => /^[0-9]+$/.test(s), 'Card number must contain only digits'),
          ]),
          map(() => method)
        )
      : invalid('Card number is required for card payments')
  } else {
    return method.accountNumber
      ? R.pipe(
          validate(method.accountNumber, [
            fromPredicate((s: string) => s.length >= 8, 'Account number too short'),
            fromPredicate((s: string) => /^[0-9]+$/.test(s), 'Account number must contain only digits'),
          ]),
          map(() => method)
        )
      : invalid('Account number is required for bank payments')
  }
}

const cardMethod: PaymentMethod = { type: 'card', cardNumber: '1234567812345678' }
console.log('\nValidating card payment:')
const cardResult = validatePaymentMethod(cardMethod)
if (isValid(cardResult)) {
  console.log('✓ Valid payment method')
}

const invalidCard: PaymentMethod = { type: 'card', cardNumber: '123' }
console.log('\nValidating invalid card payment:')
const invalidCardResult = validatePaymentMethod(invalidCard)
if (isInvalid(invalidCardResult)) {
  console.log('✗ Errors:', invalidCardResult.errors)
}

console.log('\n=== End of Examples ===')
