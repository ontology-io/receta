/**
 * Examples demonstrating guard and switchCase functions
 * from the function module.
 */

import * as R from 'remeda'
import { guard, switchCase } from '../src/function'
import * as Result from '../src/result'
import { isOk, isErr, type Result as ResultType } from '../src/result'

// ============================================================================
// GUARD - Early Return Pattern for Validation
// ============================================================================

console.log('\n=== GUARD Examples ===\n')

// Example 1: User Validation
type User = {
  age: number
  email: string
  name: string
  username: string
}

const validateUser = guard<User, string>([
  [(u) => u.age >= 18, 'Must be 18 or older'],
  [(u) => u.email.includes('@'), 'Invalid email format'],
  [(u) => u.name.trim().length > 0, 'Name is required'],
  [(u) => u.username.length >= 3, 'Username must be at least 3 characters'],
])

const validUser: User = {
  age: 25,
  email: 'alice@example.com',
  name: 'Alice Smith',
  username: 'alice',
}

const invalidUser: User = {
  age: 16,
  email: 'bob@example.com',
  name: 'Bob Jones',
  username: 'bob',
}

console.log('Valid user:', validateUser(validUser))
// => Ok({ age: 25, email: 'alice@example.com', name: 'Alice Smith', username: 'alice' })

console.log('Invalid user (too young):', validateUser(invalidUser))
// => Err('Must be 18 or older')

// Example 2: Password Validation with Structured Errors
type ValidationError = {
  field: string
  message: string
  code: string
}

const validatePassword = guard<string, ValidationError>([
  [
    (pwd) => pwd.length >= 8,
    {
      field: 'password',
      message: 'Password must be at least 8 characters',
      code: 'PASSWORD_TOO_SHORT',
    },
  ],
  [
    (pwd) => /[A-Z]/.test(pwd),
    {
      field: 'password',
      message: 'Password must contain an uppercase letter',
      code: 'PASSWORD_NO_UPPERCASE',
    },
  ],
  [
    (pwd) => /[a-z]/.test(pwd),
    {
      field: 'password',
      message: 'Password must contain a lowercase letter',
      code: 'PASSWORD_NO_LOWERCASE',
    },
  ],
  [
    (pwd) => /[0-9]/.test(pwd),
    {
      field: 'password',
      message: 'Password must contain a number',
      code: 'PASSWORD_NO_NUMBER',
    },
  ],
])

console.log('\nPassword validation:')
console.log('Valid:', validatePassword('Secret123'))
// => Ok('Secret123')

console.log('Too short:', validatePassword('Short1'))
// => Err({ field: 'password', message: '...', code: 'PASSWORD_TOO_SHORT' })

console.log('No uppercase:', validatePassword('secret123'))
// => Err({ field: 'password', message: '...', code: 'PASSWORD_NO_UPPERCASE' })

// Example 3: Guard in a Pipe (Validation Chain)
type FormData = {
  username: string
  email: string
  password: string
}

const processRegistration = (data: FormData): ResultType<User, string> =>
  R.pipe(
    data,
    guard<FormData, string>([
      [(d) => d.username.length >= 3, 'Username must be at least 3 characters'],
      [(d) => d.email.includes('@'), 'Invalid email format'],
      [(d) => d.password.length >= 8, 'Password must be at least 8 characters'],
    ]),
    Result.map((validData) => ({
      age: 25, // default value
      email: validData.email,
      name: validData.username,
      username: validData.username,
    }))
  )

const registrationData: FormData = {
  username: 'alice',
  email: 'alice@example.com',
  password: 'Secret123',
}

console.log('\nRegistration processing:', processRegistration(registrationData))

// ============================================================================
// SWITCHCASE - Pattern Matching with Required Default
// ============================================================================

console.log('\n\n=== SWITCHCASE Examples ===\n')

// Example 1: Priority Mapping
const getPriority = switchCase<string, number>(
  [
    [(level) => level === 'critical', () => 1],
    [(level) => level === 'high', () => 2],
    [(level) => level === 'medium', () => 3],
    [(level) => level === 'low', () => 4],
  ],
  5 // default priority for unknown levels
)

console.log('Priority levels:')
console.log('critical:', getPriority('critical')) // => 1
console.log('high:', getPriority('high')) // => 2
console.log('unknown:', getPriority('unknown')) // => 5 (default)

// Example 2: HTTP Status Messages
const getStatusMessage = switchCase<number, string>(
  [
    [(s) => s >= 200 && s < 300, () => 'Success'],
    [(s) => s >= 300 && s < 400, () => 'Redirect'],
    [(s) => s === 404, () => 'Not Found'],
    [(s) => s >= 400 && s < 500, () => 'Client Error'],
    [(s) => s >= 500 && s < 600, () => 'Server Error'],
  ],
  'Unknown Status'
)

console.log('\nHTTP status messages:')
console.log('200:', getStatusMessage(200)) // => 'Success'
console.log('404:', getStatusMessage(404)) // => 'Not Found'
console.log('500:', getStatusMessage(500)) // => 'Server Error'
console.log('999:', getStatusMessage(999)) // => 'Unknown Status'

// Example 3: Role-Based Permissions
type Permissions = {
  read: boolean
  write: boolean
  delete: boolean
}

type Role = 'admin' | 'editor' | 'viewer' | 'guest'

const getPermissions = switchCase<Role, Permissions>(
  [
    [(r) => r === 'admin', () => ({ read: true, write: true, delete: true })],
    [(r) => r === 'editor', () => ({ read: true, write: true, delete: false })],
    [(r) => r === 'viewer', () => ({ read: true, write: false, delete: false })],
  ],
  { read: false, write: false, delete: false } // default for 'guest' and unknown
)

console.log('\nRole permissions:')
console.log('admin:', getPermissions('admin'))
console.log('editor:', getPermissions('editor'))
console.log('viewer:', getPermissions('viewer'))
console.log('guest:', getPermissions('guest'))

// Example 4: File Extension to MIME Type
const getMimeType = switchCase<string, string>(
  [
    [(ext) => ext === 'jpg' || ext === 'jpeg', () => 'image/jpeg'],
    [(ext) => ext === 'png', () => 'image/png'],
    [(ext) => ext === 'gif', () => 'image/gif'],
    [(ext) => ext === 'pdf', () => 'application/pdf'],
    [(ext) => ext === 'json', () => 'application/json'],
    [(ext) => ext === 'txt', () => 'text/plain'],
  ],
  'application/octet-stream' // default MIME type
)

console.log('\nMIME types:')
console.log('jpg:', getMimeType('jpg'))
console.log('pdf:', getMimeType('pdf'))
console.log('unknown:', getMimeType('unknown'))

// Example 5: switchCase in a Pipe
type ApiResponse = {
  status: number
  data: unknown
}

const handleApiResponse = (response: ApiResponse): string =>
  R.pipe(
    response.status,
    switchCase<number, string>(
      [
        [(s) => s === 200, () => 'Request successful'],
        [(s) => s === 201, () => 'Resource created'],
        [(s) => s === 204, () => 'No content'],
        [(s) => s === 400, () => 'Bad request'],
        [(s) => s === 401, () => 'Unauthorized'],
        [(s) => s === 403, () => 'Forbidden'],
        [(s) => s === 404, () => 'Resource not found'],
        [(s) => s === 500, () => 'Internal server error'],
      ],
      'Unexpected response'
    )
  )

console.log('\nAPI response handling:')
console.log('200:', handleApiResponse({ status: 200, data: {} }))
console.log('404:', handleApiResponse({ status: 404, data: null }))
console.log('999:', handleApiResponse({ status: 999, data: null }))

// ============================================================================
// COMPARISON: guard vs switchCase vs cond
// ============================================================================

console.log('\n\n=== Comparison ===\n')

// guard: Returns Result<T, E> for validation
// - Returns Ok(value) if all predicates pass
// - Returns Err(error) at first failure
console.log('guard: Early-return validation pattern')
console.log(guard<number, string>([[(n) => n > 0, 'Must be positive']], 5))
console.log(guard<number, string>([[(n) => n > 0, 'Must be positive']], -5))

// switchCase: Returns U directly (always has a value via default)
// - Returns result of first matching predicate-function pair
// - Returns default if no match
console.log('\nswitchCase: Pattern matching with required default')
console.log(
  switchCase<string, number>(
    [
      [(s) => s === 'yes', () => 1],
      [(s) => s === 'no', () => 0],
    ],
    -1,
    'maybe'
  )
)

// cond: Returns Option<U> (can be None)
// - Returns Some(result) if a predicate matches
// - Returns None if no match
console.log('\ncond: Pattern matching that can return None')
import { cond } from '../src/function'
console.log(
  cond<string, number>(
    [
      [(s) => s === 'yes', () => 1],
      [(s) => s === 'no', () => 0],
    ],
    'maybe'
  )
)
