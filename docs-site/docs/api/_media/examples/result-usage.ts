/**
 * Result Module Usage Examples
 *
 * Run with: bun run examples/result-usage.ts
 */

import * as R from 'remeda'
import {
  ok,
  err,
  tryCatch,
  map,
  flatMap,
  unwrapOr,
  match,
  collect,
  partition,
  fromNullable,
  type Result,
} from '../src/result'

// Example 1: Safe JSON parsing
console.log('=== Example 1: Safe JSON Parsing ===')

const parseJSON = <T>(str: string): Result<T, string> =>
  tryCatch(
    () => JSON.parse(str) as T,
    (e) => `Parse error: ${e}`
  )

const validJSON = parseJSON('{"name":"John","age":30}')
const invalidJSON = parseJSON('invalid json')

console.log('Valid:', validJSON)
console.log('Invalid:', invalidJSON)

// Example 2: Chaining operations with pipe
console.log('\n=== Example 2: Chaining Operations ===')

interface Config {
  port: number
  host: string
}

const getConfig = (jsonStr: string) =>
  R.pipe(
    parseJSON<Config>(jsonStr),
    map((config) => ({
      ...config,
      url: `http://${config.host}:${config.port}`,
    })),
    unwrapOr({ port: 3000, host: 'localhost', url: 'http://localhost:3000' })
  )

console.log('Config:', getConfig('{"port":8080,"host":"api.example.com"}'))
console.log('Fallback:', getConfig('invalid'))

// Example 3: Validation with collect
console.log('\n=== Example 3: Form Validation ===')

interface User {
  name: string
  email: string
  age: number
}

const validateName = (name: string): Result<string, string> =>
  name.length > 0 ? ok(name) : err('Name is required')

const validateEmail = (email: string): Result<string, string> =>
  email.includes('@') ? ok(email) : err('Invalid email format')

const validateAge = (age: number): Result<number, string> =>
  age >= 18 ? ok(age) : err('Must be 18 or older')

const validateUser = (data: {
  name: string
  email: string
  age: number
}): Result<User, string> =>
  R.pipe(
    [validateName(data.name), validateEmail(data.email), validateAge(data.age)],
    collect,
    map(([name, email, age]) => ({ name, email, age }))
  )

const validUser = validateUser({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
})

const invalidUser = validateUser({
  name: '',
  email: 'john@example.com',
  age: 25,
})

console.log('Valid user:', validUser)
console.log('Invalid user:', invalidUser)

// Example 4: Bulk processing with partition
console.log('\n=== Example 4: Bulk Processing ===')

const users = [
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: '', email: 'bob@example.com', age: 30 },
  { name: 'Charlie', email: 'charlie@example.com', age: 15 },
  { name: 'Diana', email: 'diana@example.com', age: 22 },
]

const [validUsers, errors] = R.pipe(
  users,
  R.map((u) => validateUser(u)),
  partition
)

console.log(`Validated ${validUsers.length} users`)
console.log(`Found ${errors.length} errors:`, errors)

// Example 5: Pattern matching with match
console.log('\n=== Example 5: Pattern Matching ===')

const fetchUser = (id: number): Result<{ id: number; name: string }, string> =>
  id > 0 ? ok({ id, name: `User${id}` }) : err('Invalid user ID')

const renderUser = (id: number) =>
  R.pipe(
    fetchUser(id),
    match({
      onOk: (user) => `<div>Welcome, ${user.name}!</div>`,
      onErr: (error) => `<div class="error">${error}</div>`,
    })
  )

console.log('User 1:', renderUser(1))
console.log('User -1:', renderUser(-1))

// Example 6: Nullable conversion
console.log('\n=== Example 6: Nullable Conversion ===')

const config: Record<string, string | undefined> = {
  apiUrl: 'https://api.example.com',
  apiKey: undefined,
}

const getApiUrl = () =>
  R.pipe(config['apiUrl'], fromNullable('API URL not configured'), unwrapOr('http://localhost'))

const getApiKey = () =>
  R.pipe(
    config['apiKey'],
    fromNullable('API key not configured'),
    match({
      onOk: (key) => `Using key: ${key}`,
      onErr: (err) => `Warning: ${err}`,
    })
  )

console.log('API URL:', getApiUrl())
console.log('API Key:', getApiKey())

// Example 7: Complex error handling
console.log('\n=== Example 7: Complex Error Handling ===')

const divide = (a: number, b: number): Result<number, string> =>
  b === 0 ? err('Division by zero') : ok(a / b)

const calculate = (input: string) =>
  R.pipe(
    input,
    parseJSON<{ numerator: number; denominator: number }>,
    flatMap((data) => divide(data.numerator, data.denominator)),
    map((result) => `Result: ${result.toFixed(2)}`),
    unwrapOr('Calculation failed')
  )

console.log('Valid calc:', calculate('{"numerator":10,"denominator":2}'))
console.log('Division by zero:', calculate('{"numerator":10,"denominator":0}'))
console.log('Invalid JSON:', calculate('invalid'))

console.log('\n✓ All examples completed!')
