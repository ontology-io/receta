// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import { invalid, valid } from '../constructors'
import { partial, schema } from '../schema'
import type { ValidationSchema } from '../types'

interface Signup {
  email: string
  age: number
}

const rules: ValidationSchema<Signup, string> = {
  email: (email) => (email.includes('@') ? valid(email) : invalid('Invalid email')),
  age: (age) => (age >= 18 ? valid(age) : invalid('Must be 18+')),
}

const signup: Signup = { email: 'a@b.c', age: 30 }

export const dataFirst = schema(rules, signup)
export const dataLast = schema(rules)(signup)
export const patch = partial(rules, { age: 30 })
export const patchLast = partial(rules)({ email: 'a@b.c' })
