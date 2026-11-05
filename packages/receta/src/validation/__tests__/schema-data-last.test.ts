import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { valid, invalid } from '../constructors'
import { partial, schema } from '../schema'
import type { ValidationSchema } from '../types'

type User = { name: string; age: number }

const userRules: ValidationSchema<User, string> = {
  name: (name) => (name.length > 0 ? valid(name) : invalid('Name required')),
  age: (age) => (age >= 18 ? valid(age) : invalid('Must be 18+')),
}

describe('schema data-last', () => {
  const validateUser = schema(userRules)

  it('returns Valid with the object', () => {
    const user = { name: 'Ada', age: 36 }
    expect(validateUser(user)).toEqual(valid(user))
  })

  it('accumulates field errors', () => {
    expect(validateUser({ name: '', age: 12 })).toEqual(
      invalid([
        { field: 'name', errors: ['Name required'] },
        { field: 'age', errors: ['Must be 18+'] },
      ]),
    )
  })

  it('matches the data-first form', () => {
    const user = { name: '', age: 40 }
    expect(validateUser(user)).toEqual(schema(userRules, user))
  })

  it('works in a pipe', () => {
    const user = { name: 'Ada', age: 36 }
    expect(R.pipe(user, schema(userRules))).toEqual(valid(user))
  })
})

describe('partial data-last', () => {
  const validatePatch = partial(userRules)

  it('checks only the fields that are present', () => {
    expect(validatePatch({ name: 'Ada' })).toEqual(valid({ name: 'Ada' }))
  })

  it('accumulates field errors', () => {
    expect(validatePatch({ age: 12 })).toEqual(invalid([{ field: 'age', errors: ['Must be 18+'] }]))
  })

  it('works in a pipe', () => {
    expect(R.pipe({ name: 'Ada' }, partial(userRules))).toEqual(valid({ name: 'Ada' }))
  })
})
