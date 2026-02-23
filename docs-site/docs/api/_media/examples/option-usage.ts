/**
 * Option Usage Examples
 *
 * Run with: bun run examples/option-usage.ts
 */

import * as R from 'remeda'
import {
  some,
  none,
  fromNullable,
  fromResult,
  map,
  flatMap,
  filter,
  unwrapOr,
  match,
  collect,
  partition,
  toResult,
  type Option,
} from '../src/option'
import { ok, err } from '../src/result'

console.log('=== Example 1: Basic Option Construction ===\n')

// Creating Options
const someValue = some(42)
const noneValue = none()

console.log('Some value:', someValue) // { _tag: 'Some', value: 42 }
console.log('None value:', noneValue) // { _tag: 'None' }

// Converting from nullable
const maybeNumber = fromNullable(42)
const maybeNull = fromNullable(null)
const maybeUndefined = fromNullable(undefined)

console.log('From 42:', maybeNumber) // Some(42)
console.log('From null:', maybeNull) // None
console.log('From undefined:', maybeUndefined) // None

console.log('\n=== Example 2: Database Query Pattern ===\n')

// Simulating database
type User = { id: string; name: string; email: string; age: number }

const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: '2', name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 35 },
]

// findById returns Option instead of undefined
const findUserById = (id: string): Option<User> => fromNullable(users.find((u) => u.id === id))

const user1 = findUserById('1')
const user99 = findUserById('99')

console.log(
  'Found user:',
  match(user1, {
    onSome: (u) => `${u.name} (${u.email})`,
    onNone: () => 'User not found',
  })
)

console.log(
  'Missing user:',
  match(user99, {
    onSome: (u) => `${u.name} (${u.email})`,
    onNone: () => 'User not found',
  })
)

console.log('\n=== Example 3: Chaining with Pipe ===\n')

// Complex transformation pipeline
const getUserEmail = (id: string): string =>
  R.pipe(
    findUserById(id),
    map((u) => u.email),
    map((email) => email.toUpperCase()),
    unwrapOr('NO EMAIL')
  )

console.log('User 1 email:', getUserEmail('1')) // ALICE@EXAMPLE.COM
console.log('User 99 email:', getUserEmail('99')) // NO EMAIL

// With flatMap for nested operations
const findUserByEmail = (email: string): Option<User> =>
  fromNullable(users.find((u) => u.email === email))

const getUserNameFromEmail = (email: string): Option<string> =>
  R.pipe(findUserByEmail(email), map((u) => u.name))

console.log(
  'User from email:',
  unwrapOr(getUserNameFromEmail('bob@example.com'), 'Unknown')
) // Bob
console.log(
  'User from invalid email:',
  unwrapOr(getUserNameFromEmail('invalid@example.com'), 'Unknown')
) // Unknown

console.log('\n=== Example 4: Configuration Loading ===\n')

// Simulating environment config
const env: Record<string, string | undefined> = {
  API_KEY: 'sk_test_123',
  DATABASE_URL: 'postgres://localhost/db',
  // DEBUG is not set
}

// Type-safe configuration access
const getConfig = (key: string): Option<string> => fromNullable(env[key])

const config = {
  apiKey: unwrapOr(getConfig('API_KEY'), 'default-key'),
  dbUrl: unwrapOr(getConfig('DATABASE_URL'), 'sqlite::memory:'),
  debug: unwrapOr(getConfig('DEBUG'), 'false'),
}

console.log('Configuration:')
console.log('  API_KEY:', config.apiKey) // sk_test_123
console.log('  DATABASE_URL:', config.dbUrl) // postgres://localhost/db
console.log('  DEBUG:', config.debug) // false (default)

console.log('\n=== Example 5: Form Validation with Filter ===\n')

type FormData = {
  email: string
  age: string
  terms: boolean
}

const validateEmail = (email: string): Option<string> =>
  R.pipe(fromNullable(email), filter((e) => e.includes('@') && e.length > 3))

const validateAge = (ageStr: string): Option<number> =>
  R.pipe(
    fromNullable(ageStr),
    map((s) => Number(s)),
    filter((age) => !Number.isNaN(age) && age >= 18 && age <= 120)
  )

const validateForm = (form: FormData): Option<{ email: string; age: number }> => {
  const validEmail = validateEmail(form.email)
  const validAge = validateAge(form.age)

  return R.pipe(
    collect([validEmail, validAge]),
    map(([email, age]) => ({ email, age }))
  )
}

const validForm = validateForm({
  email: 'user@example.com',
  age: '25',
  terms: true,
})

const invalidEmail = validateForm({
  email: 'invalid',
  age: '25',
  terms: true,
})

const invalidAge = validateForm({
  email: 'user@example.com',
  age: '15',
  terms: true,
})

console.log(
  'Valid form:',
  match(validForm, {
    onSome: (data) => `✓ Email: ${data.email}, Age: ${data.age}`,
    onNone: () => '✗ Invalid form',
  })
)

console.log(
  'Invalid email:',
  match(invalidEmail, {
    onSome: (data) => `✓ Email: ${data.email}, Age: ${data.age}`,
    onNone: () => '✗ Invalid form',
  })
)

console.log(
  'Invalid age:',
  match(invalidAge, {
    onSome: (data) => `✓ Email: ${data.email}, Age: ${data.age}`,
    onNone: () => '✗ Invalid form',
  })
)

console.log('\n=== Example 6: Batch Processing with Partition ===\n')

// Processing multiple IDs
const processUserIds = (ids: string[]) => {
  const results = ids.map(findUserById)
  const [foundUsers, notFoundCount] = partition(results)

  console.log(`Processed ${ids.length} IDs:`)
  console.log(`  Found: ${foundUsers.length} users`)
  console.log(`  Not found: ${notFoundCount} users`)

  foundUsers.forEach((user) => {
    console.log(`  - ${user.name} (${user.id})`)
  })

  return foundUsers
}

processUserIds(['1', '2', '99', '3', '88'])

console.log('\n=== Example 7: Integration with Result ===\n')

// Converting between Option and Result
const getUserOrError = (id: string) =>
  R.pipe(
    findUserById(id),
    toResult({ code: 'USER_NOT_FOUND', message: `User ${id} not found` })
  )

const result1 = getUserOrError('1')
const result2 = getUserOrError('99')

console.log('Result for user 1:', result1) // Ok({ id: '1', name: 'Alice', ... })
console.log('Result for user 99:', result2) // Err({ code: 'USER_NOT_FOUND', ... })

// Converting Result to Option (discarding error details)
const parseAge = (ageStr: string) => {
  const num = Number(ageStr)
  return Number.isNaN(num) ? err('Invalid number') : ok(num)
}

const maybeAge1 = fromResult(parseAge('25'))
const maybeAge2 = fromResult(parseAge('invalid'))

console.log('Parsed age (valid):', maybeAge1) // Some(25)
console.log('Parsed age (invalid):', maybeAge2) // None (error discarded)

console.log('\n=== Option Module Examples Complete ===')
