import { describe, it, expect } from 'bun:test'
import { valid, invalid, fromPredicate } from '../constructors'
import { collectErrors } from '../collectErrors'
import { validate } from '../validate'
import { validateAll } from '../validateAll'
import { schema, partial } from '../schema'
import { isValid, isInvalid } from '../guards'

describe('Validation Combinators', () => {
  describe('collectErrors', () => {
    it('returns Valid with all values when all validations are Valid', () => {
      const result = collectErrors([valid(1), valid(2), valid(3)])

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual([1, 2, 3])
      }
    })

    it('accumulates ALL errors when validations are Invalid', () => {
      const result = collectErrors([
        invalid(['error1']),
        invalid(['error2']),
        invalid(['error3']),
      ])

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual(['error1', 'error2', 'error3'])
      }
    })

    it('accumulates errors from mixed Valid and Invalid', () => {
      const result = collectErrors([
        valid(1),
        invalid(['error1']),
        valid(2),
        invalid(['error2', 'error3']),
      ])

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        // Should have all 3 errors accumulated
        expect(result.errors).toEqual(['error1', 'error2', 'error3'])
      }
    })

    it('handles empty array', () => {
      const result = collectErrors([])

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual([])
      }
    })

    it('accumulates multiple errors per validation', () => {
      const result = collectErrors([
        invalid(['error1', 'error2']),
        invalid(['error3', 'error4']),
      ])

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual(['error1', 'error2', 'error3', 'error4'])
      }
    })
  })

  describe('validate', () => {
    it('returns Valid when all validators pass', () => {
      const validators = [
        fromPredicate((n: number) => n > 0, 'Must be positive'),
        fromPredicate((n: number) => n < 100, 'Must be less than 100'),
        fromPredicate((n: number) => n % 2 === 0, 'Must be even'),
      ]

      const result = validate(10, validators)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toBe(10)
      }
    })

    it('accumulates ALL errors when validators fail', () => {
      const validators = [
        fromPredicate((n: number) => n > 0, 'Must be positive'),
        fromPredicate((n: number) => n < 100, 'Must be less than 100'),
        fromPredicate((n: number) => n % 2 === 0, 'Must be even'),
      ]

      const result = validate(-5, validators)

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        // Should have 2 errors (not positive, not even)
        expect(result.errors).toContain('Must be positive')
        expect(result.errors).toContain('Must be even')
        expect(result.errors.length).toBe(2)
      }
    })

    it('validates password with multiple rules', () => {
      const validatePassword = (password: string) =>
        validate(password, [
          fromPredicate((s) => s.length >= 8, 'At least 8 characters'),
          fromPredicate((s) => /[A-Z]/.test(s), 'At least one uppercase'),
          fromPredicate((s) => /[0-9]/.test(s), 'At least one number'),
        ])

      const result = validatePassword('weak')

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual([
          'At least 8 characters',
          'At least one uppercase',
          'At least one number',
        ])
      }
    })
  })

  describe('validateAll', () => {
    it('returns Valid when all elements are valid', () => {
      const isPositive = fromPredicate(
        (n: number) => n > 0,
        (n: number) => `${n} is not positive`
      )

      const result = validateAll([1, 2, 3], isPositive)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual([1, 2, 3])
      }
    })

    it('accumulates ALL errors from invalid elements', () => {
      const isPositive = (n: number) =>
        n > 0 ? valid(n) : invalid(`${n} is not positive`)

      const result = validateAll([1, -2, 3, -4], isPositive)

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual(['-2 is not positive', '-4 is not positive'])
      }
    })

    it('handles empty array', () => {
      const isPositive = fromPredicate((n: number) => n > 0, 'Not positive')
      const result = validateAll([], isPositive)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual([])
      }
    })
  })

  describe('schema', () => {
    interface User {
      name: string
      email: string
      age: number
    }

    const userSchema = {
      name: fromPredicate((n: string) => n.length > 0, 'Name required'),
      email: fromPredicate((e: string) => e.includes('@'), 'Invalid email'),
      age: fromPredicate((a: number) => a >= 18, 'Must be 18+'),
    }

    it('returns Valid when all fields are valid', () => {
      const user: User = { name: 'John', email: 'john@example.com', age: 25 }
      const result = schema(userSchema, user)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual(user)
      }
    })

    it('accumulates ALL field errors', () => {
      const user: User = { name: '', email: 'invalid', age: 17 }
      const result = schema(userSchema, user)

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors.length).toBe(3)
        expect(result.errors.map((e) => e.field)).toEqual(['name', 'email', 'age'])
      }
    })

    it('returns specific field errors', () => {
      const user: User = { name: '', email: 'john@example.com', age: 25 }
      const result = schema(userSchema, user)

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual([{ field: 'name', errors: ['Name required'] }])
      }
    })

    describe('validator outputs', () => {
      interface Signup {
        name: string
        email: string
        role?: string
      }

      const normalize = {
        name: (name: string) => (name.trim().length > 0 ? valid(name.trim()) : invalid('Name required')),
        email: (email: string) => (email.includes('@') ? valid(email.toLowerCase()) : invalid('Invalid email')),
        role: (role: string | undefined) => valid(role ?? 'member'),
      }

      it('returns what the validators return, not the input', () => {
        const result = schema(normalize, { name: '  Ada ', email: 'ADA@Example.com', role: 'admin' } as Signup)

        expect(result).toEqual(valid({ name: 'Ada', email: 'ada@example.com', role: 'admin' }))
      })

      it('lets a validator fill in a default for a missing field', () => {
        const result = schema(normalize, { name: 'Ada', email: 'ada@example.com' } as Signup)

        expect(result).toEqual(valid({ name: 'Ada', email: 'ada@example.com', role: 'member' }))
      })

      it('keeps the fields the schema does not mention', () => {
        const input = { name: ' Ada ', email: 'ada@example.com', role: 'admin', id: 7 }
        const result = schema(normalize, input as Signup)

        expect(result).toEqual(valid({ name: 'Ada', email: 'ada@example.com', role: 'admin', id: 7 }))
      })

      it('does not change the object that was passed in', () => {
        const input: Signup = { name: '  Ada ', email: 'ADA@Example.com' }
        schema(normalize, input)

        expect(input).toEqual({ name: '  Ada ', email: 'ADA@Example.com' })
      })

      it('returns the same object when no validator changes a value', () => {
        const user: User = { name: 'John', email: 'john@example.com', age: 25 }
        const result = schema(userSchema, user)

        expect(isValid(result)).toBe(true)
        if (isValid(result)) {
          expect(result.value).toBe(user)
        }
      })

      it('adds no key for a missing field that stays undefined', () => {
        const optional = { nickname: (nickname: string | undefined) => valid(nickname) }
        const result = schema(optional, {} as { nickname?: string })

        expect(isValid(result)).toBe(true)
        if (isValid(result)) {
          expect(Object.keys(result.value)).toEqual([])
        }
      })

      it('returns only the errors when a field is invalid', () => {
        const result = schema(normalize, { name: '   ', email: 'ADA@Example.com' } as Signup)

        expect(result).toEqual(invalid([{ field: 'name', errors: ['Name required'] }]))
      })

      it('works data-last', () => {
        const result = schema(normalize)({ name: ' Ada ', email: 'A@B.C' } as Signup)

        expect(result).toEqual(valid({ name: 'Ada', email: 'a@b.c', role: 'member' }))
      })
    })
  })

  describe('partial', () => {
    interface User {
      name: string
      email: string
      age: number
    }

    const userSchema = {
      name: fromPredicate((n: string) => n.length > 0, 'Name required'),
      email: fromPredicate((e: string) => e.includes('@'), 'Invalid email'),
      age: fromPredicate((a: number) => a >= 18, 'Must be 18+'),
    }

    it('validates only present fields', () => {
      const partialUser = { name: 'John' }
      const result = partial(userSchema, partialUser)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual({ name: 'John' })
      }
    })

    it('returns errors for invalid present fields', () => {
      const partialUser = { name: '', email: 'invalid' }
      const result = partial(userSchema, partialUser)

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors.length).toBe(2)
        expect(result.errors.map((e) => e.field)).toContain('name')
        expect(result.errors.map((e) => e.field)).toContain('email')
      }
    })

    it('does not validate missing fields', () => {
      const partialUser = {}
      const result = partial(userSchema, partialUser)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toEqual({})
      }
    })

    describe('validator outputs', () => {
      const normalize = {
        name: (name: string) => valid(name.trim()),
        email: (email: string) => valid(email.toLowerCase()),
      }

      it('returns what the validators return for the fields that are present', () => {
        const result = partial(normalize, { email: 'ADA@Example.com' })

        expect(result).toEqual(valid({ email: 'ada@example.com' }))
      })

      it('keeps the fields the schema does not mention', () => {
        const result = partial(normalize, { name: ' Ada ', id: 7 } as { name: string })

        expect(result).toEqual(valid({ name: 'Ada', id: 7 }))
      })

      it('returns the same object when no validator changes a value', () => {
        const patch = { name: 'John' }
        const result = partial(userSchema, patch)

        expect(isValid(result)).toBe(true)
        if (isValid(result)) {
          expect(result.value).toBe(patch)
        }
      })
    })
  })
})
