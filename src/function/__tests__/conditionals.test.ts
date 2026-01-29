import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { ifElse, when, unless, cond, guard, switchCase } from '../index'
import { some, none } from '../../option'
import { ok, err, isOk, isErr } from '../../result'

describe('function/conditionals', () => {
  describe('ifElse', () => {
    describe('data-last', () => {
      it('applies onTrue when predicate passes', () => {
        const classify = ifElse(
          (n: number) => n >= 0,
          (n) => 'positive',
          (n) => 'negative'
        )

        expect(classify(5)).toBe('positive')
        expect(classify(0)).toBe('positive')
      })

      it('applies onFalse when predicate fails', () => {
        const classify = ifElse(
          (n: number) => n >= 0,
          (n) => 'positive',
          (n) => 'negative'
        )

        expect(classify(-3)).toBe('negative')
        expect(classify(-100)).toBe('negative')
      })

      it('works in pipe', () => {
        const result = R.pipe(
          25,
          ifElse(
            (age) => age >= 18,
            (age) => ({ status: 'adult' as const, age }),
            (age) => ({ status: 'minor' as const, age })
          )
        )

        expect(result).toEqual({ status: 'adult', age: 25 })
      })
    })

    describe('data-first', () => {
      it('returns result directly', () => {
        const result = ifElse(
          (n: number) => n % 2 === 0,
          (n) => `${n} is even`,
          (n) => `${n} is odd`,
          7
        )

        expect(result).toBe('7 is odd')
      })

      it('handles different return types correctly', () => {
        const result = ifElse(
          (x: string) => x.length > 5,
          (x) => x.toUpperCase(),
          (x) => x.toLowerCase(),
          'hello'
        )

        expect(result).toBe('hello')
      })
    })
  })

  describe('when', () => {
    describe('data-last', () => {
      it('applies function when predicate passes', () => {
        const ensurePositive = when((n: number) => n < 0, (n) => Math.abs(n))

        expect(ensurePositive(-5)).toBe(5)
        expect(ensurePositive(3)).toBe(3)
        expect(ensurePositive(0)).toBe(0)
      })

      it('returns original when predicate fails', () => {
        const addDefault = when((s: string) => s.length === 0, () => 'default')

        expect(addDefault('')).toBe('default')
        expect(addDefault('hello')).toBe('hello')
      })

      it('works in pipe', () => {
        const result = R.pipe(
          '  ',
          (s) => s.trim(),
          when((s) => s.length === 0, () => 'Anonymous'),
          (s) => s.toUpperCase()
        )

        expect(result).toBe('ANONYMOUS')
      })
    })

    describe('data-first', () => {
      it('returns transformed value when condition met', () => {
        const result = when((s: string) => s.startsWith('_'), (s) => s.slice(1), '_private')

        expect(result).toBe('private')
      })

      it('returns original when condition not met', () => {
        const result = when((n: number) => n > 100, (n) => 100, 50)

        expect(result).toBe(50)
      })
    })
  })

  describe('unless', () => {
    describe('data-last', () => {
      it('applies function when predicate fails', () => {
        const ensureArray = unless(Array.isArray, (value) => [value])

        expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3])
        expect(ensureArray(5)).toEqual([5])
        expect(ensureArray('hello')).toEqual(['hello'])
      })

      it('returns original when predicate passes', () => {
        const addProtocol = unless(
          (s: string) => s.startsWith('http'),
          (s) => `https://${s}`
        )

        expect(addProtocol('example.com')).toBe('https://example.com')
        expect(addProtocol('http://example.com')).toBe('http://example.com')
        expect(addProtocol('https://example.com')).toBe('https://example.com')
      })

      it('works in pipe', () => {
        const result = R.pipe(
          { name: 'Alice' },
          unless((config) => 'apiKey' in config, (config) => ({ ...config, apiKey: 'default' }))
        )

        expect(result).toEqual({ name: 'Alice', apiKey: 'default' })
      })
    })

    describe('data-first', () => {
      it('transforms when condition not met', () => {
        const result = unless((n: number) => n > 0, (n) => -n, -5)

        expect(result).toBe(5)
      })

      it('returns original when condition met', () => {
        const result = unless((n: number) => n > 0, (n) => -n, 5)

        expect(result).toBe(5)
      })
    })
  })

  describe('cond', () => {
    describe('data-last', () => {
      it('applies first matching predicate', () => {
        const classifyNumber = cond<number, string>([
          [(n) => n < 0, (n) => 'negative'],
          [(n) => n === 0, () => 'zero'],
          [(n) => n > 0 && n < 10, (n) => 'small positive'],
          [(n) => n >= 10, (n) => 'large positive'],
        ])

        expect(classifyNumber(-5)).toEqual(some('negative'))
        expect(classifyNumber(0)).toEqual(some('zero'))
        expect(classifyNumber(3)).toEqual(some('small positive'))
        expect(classifyNumber(100)).toEqual(some('large positive'))
      })

      it('returns None when no predicate matches', () => {
        const onlyPositive = cond<number, string>([[(n) => n > 0, () => 'positive']])

        expect(onlyPositive(-5)).toEqual(none)
        expect(onlyPositive(0)).toEqual(none)
      })

      it('works in pipe', () => {
        const handleStatus = cond<number, string>([
          [(s) => s >= 200 && s < 300, () => 'success'],
          [(s) => s >= 300 && s < 400, () => 'redirect'],
          [(s) => s >= 400 && s < 500, () => 'client error'],
          [(s) => s >= 500, () => 'server error'],
        ])

        const result = R.pipe(404, handleStatus)

        expect(result).toEqual(some('client error'))
      })

      it('stops at first match', () => {
        let callCount = 0
        const countingCond = cond<number, string>([
          [
            (n) => {
              callCount++
              return n > 0
            },
            () => 'positive',
          ],
          [
            (n) => {
              callCount++
              return n > 10
            },
            () => 'large',
          ],
        ])

        const result = countingCond(15)
        expect(result).toEqual(some('positive'))
        expect(callCount).toBe(1) // Only first predicate called
      })
    })

    describe('data-first', () => {
      it('returns Some with result when matched', () => {
        const result = cond<string, number>(
          [
            [(s) => s === 'low', () => 1],
            [(s) => s === 'medium', () => 5],
            [(s) => s === 'high', () => 10],
          ],
          'medium'
        )

        expect(result).toEqual(some(5))
      })

      it('returns None when not matched', () => {
        const result = cond<string, number>(
          [
            [(s) => s === 'low', () => 1],
            [(s) => s === 'high', () => 10],
          ],
          'medium'
        )

        expect(result).toEqual(none)
      })
    })

    describe('empty pairs', () => {
      it('returns None for empty pairs array', () => {
        const noOp = cond<number, string>([])

        expect(noOp(42)).toEqual(none)
      })
    })
  })

  describe('guard', () => {
    describe('data-last', () => {
      it('returns Ok when all guards pass', () => {
        type User = { age: number; email: string; name: string }

        const validateUser = guard<User, string>([
          [(u) => u.age >= 18, 'Must be 18 or older'],
          [(u) => u.email.includes('@'), 'Invalid email format'],
          [(u) => u.name.trim().length > 0, 'Name is required'],
        ])

        const validUser = { age: 25, email: 'test@example.com', name: 'Alice' }
        const result = validateUser(validUser)

        expect(isOk(result)).toBe(true)
        expect(result).toEqual(ok(validUser))
      })

      it('returns Err with first failing guard error', () => {
        const validateNumber = guard<number, string>([
          [(n) => n > 0, 'Must be positive'],
          [(n) => n < 100, 'Must be less than 100'],
          [(n) => Number.isInteger(n), 'Must be an integer'],
        ])

        expect(validateNumber(-5)).toEqual(err('Must be positive'))
        expect(validateNumber(150)).toEqual(err('Must be less than 100'))
        expect(validateNumber(50.5)).toEqual(err('Must be an integer'))
      })

      it('stops at first failure (early return)', () => {
        let callCount = 0
        const countingGuard = guard<number, string>([
          [
            (n) => {
              callCount++
              return n > 0
            },
            'positive check failed',
          ],
          [
            (n) => {
              callCount++
              return n < 100
            },
            'less than 100 check failed',
          ],
        ])

        const result = countingGuard(-5)
        expect(isErr(result)).toBe(true)
        expect(callCount).toBe(1) // Only first guard called
      })

      it('works in pipe with Result chain', () => {
        const result = R.pipe(
          { username: 'alice', password: 'Secret123' },
          guard<{ username: string; password: string }, string>([
            [(data) => data.username.length >= 3, 'Username too short'],
            [(data) => data.password.length >= 8, 'Password too short'],
            [(data) => /[A-Z]/.test(data.password), 'Password needs uppercase'],
          ])
        )

        expect(isOk(result)).toBe(true)
      })
    })

    describe('data-first', () => {
      it('returns Ok when all guards pass', () => {
        const result = guard<number, string>(
          [
            [(n) => n > 0, 'Must be positive'],
            [(n) => n < 100, 'Must be less than 100'],
          ],
          42
        )

        expect(result).toEqual(ok(42))
      })

      it('returns Err when guard fails', () => {
        const result = guard<string, string>(
          [
            [(s) => s.length > 0, 'Cannot be empty'],
            [(s) => s.length <= 10, 'Too long'],
          ],
          'this is way too long'
        )

        expect(result).toEqual(err('Too long'))
      })
    })

    describe('with structured errors', () => {
      type ValidationError = { field: string; message: string }

      it('returns structured errors', () => {
        const validatePassword = guard<string, ValidationError>([
          [
            (pwd) => pwd.length >= 8,
            { field: 'password', message: 'Password must be at least 8 characters' },
          ],
          [
            (pwd) => /[A-Z]/.test(pwd),
            { field: 'password', message: 'Password must contain uppercase letter' },
          ],
          [
            (pwd) => /[0-9]/.test(pwd),
            { field: 'password', message: 'Password must contain a number' },
          ],
        ])

        const result = validatePassword('short')
        expect(result).toEqual(
          err({ field: 'password', message: 'Password must be at least 8 characters' })
        )
      })
    })

    describe('empty guards', () => {
      it('returns Ok for empty guards array', () => {
        const noGuards = guard<number, string>([])
        expect(noGuards(42)).toEqual(ok(42))
      })
    })
  })

  describe('switchCase', () => {
    describe('data-last', () => {
      it('returns first matching case', () => {
        const getPriority = switchCase<string, number>(
          [
            [(s) => s === 'critical', () => 1],
            [(s) => s === 'high', () => 2],
            [(s) => s === 'medium', () => 3],
            [(s) => s === 'low', () => 4],
          ],
          5
        )

        expect(getPriority('critical')).toBe(1)
        expect(getPriority('high')).toBe(2)
        expect(getPriority('medium')).toBe(3)
        expect(getPriority('low')).toBe(4)
      })

      it('returns default when no case matches', () => {
        const getPriority = switchCase<string, number>(
          [
            [(s) => s === 'critical', () => 1],
            [(s) => s === 'high', () => 2],
          ],
          999
        )

        expect(getPriority('unknown')).toBe(999)
        expect(getPriority('something')).toBe(999)
      })

      it('stops at first match', () => {
        let callCount = 0
        const countingSwitch = switchCase<number, string>(
          [
            [
              (n) => {
                callCount++
                return n > 0
              },
              () => 'positive',
            ],
            [
              (n) => {
                callCount++
                return n > 10
              },
              () => 'large',
            ],
          ],
          'default'
        )

        const result = countingSwitch(15)
        expect(result).toBe('positive')
        expect(callCount).toBe(1) // Only first predicate called
      })

      it('works in pipe', () => {
        const result = R.pipe(
          404,
          switchCase<number, string>(
            [
              [(s) => s >= 200 && s < 300, () => 'success'],
              [(s) => s >= 300 && s < 400, () => 'redirect'],
              [(s) => s >= 400 && s < 500, () => 'client error'],
              [(s) => s >= 500, () => 'server error'],
            ],
            'unknown status'
          )
        )

        expect(result).toBe('client error')
      })

      it('handles complex return types', () => {
        type Permissions = { read: boolean; write: boolean; delete: boolean }
        type Role = 'admin' | 'editor' | 'viewer'

        const getPermissions = switchCase<Role, Permissions>(
          [
            [(r) => r === 'admin', () => ({ read: true, write: true, delete: true })],
            [(r) => r === 'editor', () => ({ read: true, write: true, delete: false })],
            [(r) => r === 'viewer', () => ({ read: true, write: false, delete: false })],
          ],
          { read: false, write: false, delete: false }
        )

        expect(getPermissions('admin')).toEqual({ read: true, write: true, delete: true })
        expect(getPermissions('viewer')).toEqual({ read: true, write: false, delete: false })
      })
    })

    describe('data-first', () => {
      it('returns matched value', () => {
        const result = switchCase<string, number>(
          [
            [(s) => s === 'small', () => 10],
            [(s) => s === 'medium', () => 20],
            [(s) => s === 'large', () => 30],
          ],
          15,
          'medium'
        )

        expect(result).toBe(20)
      })

      it('returns default when no match', () => {
        const result = switchCase<string, number>(
          [
            [(s) => s === 'yes', () => 1],
            [(s) => s === 'no', () => 0],
          ],
          -1,
          'maybe'
        )

        expect(result).toBe(-1)
      })
    })

    describe('empty pairs', () => {
      it('returns default for empty pairs array', () => {
        const alwaysDefault = switchCase<number, string>([], 'default')
        expect(alwaysDefault(42)).toBe('default')
      })
    })

    describe('real-world examples', () => {
      it('file extension to MIME type', () => {
        const getMimeType = switchCase<string, string>(
          [
            [(ext) => ext === 'jpg' || ext === 'jpeg', () => 'image/jpeg'],
            [(ext) => ext === 'png', () => 'image/png'],
            [(ext) => ext === 'gif', () => 'image/gif'],
            [(ext) => ext === 'pdf', () => 'application/pdf'],
            [(ext) => ext === 'json', () => 'application/json'],
          ],
          'application/octet-stream'
        )

        expect(getMimeType('jpg')).toBe('image/jpeg')
        expect(getMimeType('png')).toBe('image/png')
        expect(getMimeType('unknown')).toBe('application/octet-stream')
      })

      it('HTTP status message', () => {
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

        expect(getStatusMessage(200)).toBe('Success')
        expect(getStatusMessage(404)).toBe('Not Found')
        expect(getStatusMessage(500)).toBe('Server Error')
        expect(getStatusMessage(999)).toBe('Unknown Status')
      })
    })
  })
})
