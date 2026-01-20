import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { ok, err } from '../constructors'
import { collect } from '../collect'
import { partition } from '../partition'
import { fromNullable } from '../fromNullable'
import { map } from '../map'

describe('Result Combinators', () => {
  describe('collect', () => {
    it('collects all Ok values', () => {
      const results = [ok(1), ok(2), ok(3)]
      expect(collect(results)).toEqual(ok([1, 2, 3]))
    })

    it('returns first Err encountered', () => {
      const results = [ok(1), err('fail'), ok(3)]
      expect(collect(results)).toEqual(err('fail'))
    })

    it('returns first Err even with multiple errors', () => {
      const results = [ok(1), err('first'), err('second')]
      expect(collect(results)).toEqual(err('first'))
    })

    it('handles empty array', () => {
      expect(collect([])).toEqual(ok([]))
    })

    it('works with data-last in pipe', () => {
      const result = R.pipe(
        [ok(1), ok(2), ok(3)],
        collect
      )
      expect(result).toEqual(ok([1, 2, 3]))
    })

    it('validates multiple fields', () => {
      const validateName = (name: string) =>
        name.length > 0 ? ok(name) : err('Name required')

      const validateAge = (age: number) =>
        age >= 18 ? ok(age) : err('Must be 18+')

      const validateEmail = (email: string) =>
        email.includes('@') ? ok(email) : err('Invalid email')

      const result = R.pipe(
        [
          validateName('John'),
          validateAge(25),
          validateEmail('john@example.com')
        ],
        collect,
        map(([name, age, email]) => ({ name, age, email }))
      )

      expect(result).toEqual(ok({
        name: 'John',
        age: 25,
        email: 'john@example.com'
      }))
    })

    it('short-circuits on validation failure', () => {
      const validateName = (name: string) =>
        name.length > 0 ? ok(name) : err('Name required')

      const validateAge = (age: number) =>
        age >= 18 ? ok(age) : err('Must be 18+')

      const result = R.pipe(
        [
          validateName(''),
          validateAge(25)
        ],
        collect
      )

      expect(result).toEqual(err('Name required'))
    })
  })

  describe('partition', () => {
    it('separates Ok and Err values', () => {
      const results = [ok(1), err('fail1'), ok(2), err('fail2'), ok(3)]
      expect(partition(results)).toEqual([[1, 2, 3], ['fail1', 'fail2']])
    })

    it('handles all Ok values', () => {
      const results = [ok(1), ok(2), ok(3)]
      expect(partition(results)).toEqual([[1, 2, 3], []])
    })

    it('handles all Err values', () => {
      const results = [err('fail1'), err('fail2'), err('fail3')]
      expect(partition(results)).toEqual([[], ['fail1', 'fail2', 'fail3']])
    })

    it('handles empty array', () => {
      expect(partition([])).toEqual([[], []])
    })

    it('works with data-last in pipe', () => {
      const result = R.pipe(
        [ok(1), err('fail'), ok(2)],
        partition
      )
      expect(result).toEqual([[1, 2], ['fail']])
    })

    it('bulk validation with error collection', () => {
      const validateUser = (data: { name: string; age: number }) => {
        if (!data.name) return err('Missing name')
        if (data.age < 18) return err('Too young')
        return ok(data)
      }

      const users = [
        { name: 'John', age: 25 },
        { name: '', age: 30 },
        { name: 'Jane', age: 15 }
      ]

      const [valid, errors] = R.pipe(
        users,
        R.map(validateUser),
        partition
      )

      expect(valid).toHaveLength(1)
      expect(errors).toEqual(['Missing name', 'Too young'])
    })
  })

  describe('fromNullable', () => {
    it('converts non-null value to Ok (data-first)', () => {
      expect(fromNullable(42, 'No value')).toEqual(ok(42))
      expect(fromNullable('hello', 'No value')).toEqual(ok('hello'))
      expect(fromNullable(0, 'No value')).toEqual(ok(0))
      expect(fromNullable('', 'No value')).toEqual(ok(''))
      expect(fromNullable(false, 'No value')).toEqual(ok(false))
    })

    it('converts null to Err (data-first)', () => {
      expect(fromNullable(null, 'No value')).toEqual(err('No value'))
    })

    it('converts undefined to Err (data-first)', () => {
      expect(fromNullable(undefined, 'No value')).toEqual(err('No value'))
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        42 as number | null,
        fromNullable('Not found')
      )
      expect(result).toEqual(ok(42))
    })

    it('handles Array.find results', () => {
      const users = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]

      const result = R.pipe(
        users.find(u => u.id === 3),
        fromNullable('User not found'),
        map(user => user.name)
      )

      expect(result).toEqual(err('User not found'))
    })

    it('handles optional config values', () => {
      const config: Record<string, string | undefined> = {
        apiUrl: 'https://api.example.com'
      }

      const getApiKey = () =>
        R.pipe(
          config['apiKey'],
          fromNullable('API key not configured')
        )

      expect(getApiKey()).toEqual(err('API key not configured'))
    })

    it('allows custom error types', () => {
      type ConfigError = { code: 'MISSING_VALUE'; key: string }

      const result = fromNullable(
        null,
        { code: 'MISSING_VALUE', key: 'apiKey' } as ConfigError
      )

      expect(result).toEqual(err({ code: 'MISSING_VALUE', key: 'apiKey' }))
    })
  })

  describe('integration: combining combinators', () => {
    it('collect and partition in workflow', () => {
      const items = [1, 2, 3, 4, 5]

      // Try to process all items
      const results = items.map(n =>
        n % 2 === 0 ? ok(n * 2) : err(`${n} is odd`)
      )

      // Can either collect (fail-fast) or partition (collect all)
      expect(collect(results)).toEqual(err('1 is odd'))

      const [evens, odds] = partition(results)
      expect(evens).toEqual([4, 8])
      expect(odds).toEqual(['1 is odd', '3 is odd', '5 is odd'])
    })

    it('fromNullable into collect pattern', () => {
      const data = {
        name: 'John',
        age: 25,
        email: null as string | null
      }

      const result = R.pipe(
        [
          fromNullable(data.name, 'Name required'),
          fromNullable(data.age, 'Age required'),
          fromNullable(data.email, 'Email required')
        ],
        collect
      )

      expect(result).toEqual(err('Email required'))
    })
  })
})
