import * as R from 'remeda'
import { describe, it, expect } from 'bun:test'
import {
  promiseAllSettled,
  extractFulfilled,
  extractRejected,
  toResults,
} from '../promiseAllSettled'
import { isOk, isErr } from '../../result'

describe('Async.promiseAllSettled', () => {
  describe('basic functionality', () => {
    it('waits for all promises to settle', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ])

      expect(results).toHaveLength(3)
      expect(results.every((r) => r.status === 'fulfilled')).toBe(true)
    })

    it('returns both fulfilled and rejected results', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject(new Error('Failed')),
        Promise.resolve(3),
      ])

      expect(results).toHaveLength(3)
      expect(results[0]?.status).toBe('fulfilled')
      expect(results[1]?.status).toBe('rejected')
      expect(results[2]?.status).toBe('fulfilled')
    })

    it('handles all rejections', async () => {
      const results = await promiseAllSettled([
        Promise.reject('error1'),
        Promise.reject('error2'),
        Promise.reject('error3'),
      ])

      expect(results).toHaveLength(3)
      expect(results.every((r) => r.status === 'rejected')).toBe(true)
    })

    it('handles empty array', async () => {
      const results = await promiseAllSettled([])

      expect(results).toHaveLength(0)
    })
  })

  describe('type preservation', () => {
    it('preserves fulfilled value types', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(42),
        Promise.resolve(84),
      ])

      if (results[0]?.status === 'fulfilled') {
        const value: number = results[0].value
        expect(value).toBe(42)
      }
    })

    it('handles different value types', async () => {
      const results = await promiseAllSettled([
        Promise.resolve('string'),
        Promise.reject(123),
      ])

      expect(results[0]?.status).toBe('fulfilled')
      if (results[0]?.status === 'fulfilled') {
        expect(typeof results[0].value).toBe('string')
      }

      expect(results[1]?.status).toBe('rejected')
      if (results[1]?.status === 'rejected') {
        expect(results[1].reason).toBe(123)
      }
    })
  })
})

describe('Async.extractFulfilled', () => {
  describe('filtering fulfilled results', () => {
    it('extracts all fulfilled values', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ])

      const values = extractFulfilled(results)

      expect(values).toEqual([1, 2, 3])
    })

    it('excludes rejected promises', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject('error'),
        Promise.resolve(3),
      ])

      const values = extractFulfilled(results)

      expect(values).toEqual([1, 3])
    })

    it('returns empty array when all rejected', async () => {
      const results = await promiseAllSettled([
        Promise.reject('error1'),
        Promise.reject('error2'),
      ])

      const values = extractFulfilled(results)

      expect(values).toEqual([])
    })

    it('handles empty results', () => {
      const values = extractFulfilled([])

      expect(values).toEqual([])
    })
  })

  describe('type preservation', () => {
    it('preserves array element types', async () => {
      const results = await promiseAllSettled([
        Promise.resolve({ id: 1, name: 'Alice' }),
        Promise.reject('error'),
        Promise.resolve({ id: 2, name: 'Bob' }),
      ])

      const users = extractFulfilled(results)

      expect(users).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ])
      expect(users[0]?.id).toBe(1)
      expect(users[0]?.name).toBe('Alice')
    })
  })

  describe('real-world scenarios', () => {
    it('processes partial API results', async () => {
      const mockFetch = async (id: number) => {
        if (id === 999) throw new Error('Not found')
        return { id, name: `User ${id}` }
      }

      const results = await promiseAllSettled([
        mockFetch(1),
        mockFetch(2),
        mockFetch(999),
        mockFetch(4),
      ])

      const users = extractFulfilled(results)

      expect(users).toHaveLength(3)
      expect(users.map((u) => u.id)).toEqual([1, 2, 4])
    })
  })
})

describe('Async.extractRejected', () => {
  describe('filtering rejected results', () => {
    it('extracts all rejection reasons', async () => {
      const results = await promiseAllSettled([
        Promise.reject('error1'),
        Promise.reject('error2'),
        Promise.reject('error3'),
      ])

      const errors = extractRejected<string>(results)

      expect(errors).toEqual(['error1', 'error2', 'error3'])
    })

    it('excludes fulfilled promises', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject('error1'),
        Promise.resolve(2),
        Promise.reject('error2'),
      ])

      const errors = extractRejected<string>(results)

      expect(errors).toEqual(['error1', 'error2'])
    })

    it('returns empty array when all fulfilled', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.resolve(2),
      ])

      const errors = extractRejected(results)

      expect(errors).toEqual([])
    })

    it('handles empty results', () => {
      const errors = extractRejected([])

      expect(errors).toEqual([])
    })
  })

  describe('error type handling', () => {
    it('handles Error objects', async () => {
      const error1 = new Error('Network error')
      const error2 = new Error('Timeout')

      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject(error1),
        Promise.reject(error2),
      ])

      const errors = extractRejected<Error>(results)

      expect(errors).toHaveLength(2)
      expect(errors[0]).toBe(error1)
      expect(errors[1]).toBe(error2)
      expect(errors[0]?.message).toBe('Network error')
    })

    it('handles mixed error types', async () => {
      const results = await promiseAllSettled([
        Promise.reject(new Error('Error object')),
        Promise.reject('String error'),
        Promise.reject({ code: 'CUSTOM' }),
      ])

      const errors = extractRejected(results)

      expect(errors).toHaveLength(3)
      expect(errors[0]).toBeInstanceOf(Error)
      expect(errors[1]).toBe('String error')
      expect(errors[2]).toEqual({ code: 'CUSTOM' })
    })
  })

  describe('real-world scenarios', () => {
    it('logs failed operations', async () => {
      const mockOperation = async (id: number) => {
        if (id % 2 === 0) throw new Error(`Failed: ${id}`)
        return id
      }

      const results = await promiseAllSettled([
        mockOperation(1),
        mockOperation(2),
        mockOperation(3),
        mockOperation(4),
      ])

      const errors = extractRejected<Error>(results)

      expect(errors).toHaveLength(2)
      expect(errors.map((e) => e.message)).toEqual(['Failed: 2', 'Failed: 4'])
    })
  })
})

describe('Async.toResults', () => {
  describe('conversion to Result type', () => {
    it('converts fulfilled to Ok', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ])

      const resultArray = toResults(results)

      expect(resultArray).toHaveLength(3)
      expect(resultArray.every(isOk)).toBe(true)

      if (isOk(resultArray[0]!)) {
        expect(resultArray[0].value).toBe(1)
      }
    })

    it('converts rejected to Err', async () => {
      const results = await promiseAllSettled([
        Promise.reject('error1'),
        Promise.reject('error2'),
      ])

      const resultArray = toResults(results)

      expect(resultArray).toHaveLength(2)
      expect(resultArray.every(isErr)).toBe(true)

      if (isErr(resultArray[0]!)) {
        expect(resultArray[0].error).toBe('error1')
      }
    })

    it('converts mixed results', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject('error'),
        Promise.resolve(3),
      ])

      const resultArray = toResults(results)

      expect(resultArray).toHaveLength(3)
      expect(isOk(resultArray[0]!)).toBe(true)
      expect(isErr(resultArray[1]!)).toBe(true)
      expect(isOk(resultArray[2]!)).toBe(true)
    })

    it('handles empty array', async () => {
      const results = await promiseAllSettled([])
      const resultArray = toResults(results)

      expect(resultArray).toEqual([])
    })
  })

  describe('composability with Result utilities', () => {
    it('composes with map', async () => {
      const { map } = await import('../../result/map')

      const results = await promiseAllSettled([
        Promise.resolve(5),
        Promise.reject('error'),
        Promise.resolve(10),
      ])

      const resultArray = toResults(results)
      const doubled = resultArray.map((r) => map(r, (n) => n * 2))

      expect(isOk(doubled[0]!)).toBe(true)
      if (isOk(doubled[0]!)) {
        expect(doubled[0].value).toBe(10)
      }

      expect(isErr(doubled[1]!)).toBe(true)

      expect(isOk(doubled[2]!)).toBe(true)
      if (isOk(doubled[2]!)) {
        expect(doubled[2].value).toBe(20)
      }
    })

    it('composes with unwrapOr', async () => {
      const { unwrapOr } = await import('../../result/unwrap')

      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject('error'),
        Promise.resolve(3),
      ])

      const values = toResults(results).map((r) => unwrapOr(r, 0))

      expect(values).toEqual([1, 0, 3])
    })

    it('composes with partition', async () => {
      const { partition } = await import('../../result/partition')

      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject('error1'),
        Promise.resolve(3),
        Promise.reject('error2'),
      ])

      const [successes, failures] = partition(toResults(results))

      expect(successes).toEqual([1, 3])
      expect(failures).toEqual(['error1', 'error2'])
    })
  })

  describe('real-world scenarios', () => {
    it('processes API batch requests', async () => {
      const { unwrapOr } = await import('../../result/unwrap')
      const { map } = await import('../../result/map')

      interface User {
        id: number
        name: string
      }

      const mockFetch = async (id: number): Promise<User> => {
        if (id === 999) throw new Error('Not found')
        return { id, name: `User ${id}` }
      }

      const results = await promiseAllSettled([
        mockFetch(1),
        mockFetch(999),
        mockFetch(3),
      ])

      const names = R.pipe(
  toResults(results),
  R.map((r) => map(r, (user) => user.name)),
  R.map((r) => unwrapOr(r, 'Unknown'))
)

      expect(names).toEqual(['User 1', 'Unknown', 'User 3'])
    })

    it('tracks success/failure stats', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.reject('error1'),
        Promise.reject('error2'),
        Promise.resolve(5),
      ])

      const resultArray = toResults(results)
      const successCount = resultArray.filter(isOk).length
      const failureCount = resultArray.filter(isErr).length

      expect(successCount).toBe(3)
      expect(failureCount).toBe(2)
    })
  })

  describe('error type preservation', () => {
    it('preserves error types', async () => {
      interface CustomError {
        code: string
        message: string
      }

      const error: CustomError = { code: 'ERR_001', message: 'Custom error' }

      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject(error),
      ])

      const resultArray = toResults<number, CustomError>(results)

      if (isErr(resultArray[1]!)) {
        expect(resultArray[1].error.code).toBe('ERR_001')
        expect(resultArray[1].error.message).toBe('Custom error')
      }
    })
  })
})

describe('integration scenarios', () => {
  describe('combining helper functions', () => {
    it('extracts both successes and failures', async () => {
      const results = await promiseAllSettled([
        Promise.resolve(1),
        Promise.reject('error1'),
        Promise.resolve(3),
        Promise.reject('error2'),
        Promise.resolve(5),
      ])

      const successes = extractFulfilled(results)
      const failures = extractRejected<string>(results)

      expect(successes).toEqual([1, 3, 5])
      expect(failures).toEqual(['error1', 'error2'])
      expect(successes.length + failures.length).toBe(results.length)
    })
  })

  describe('batch operations', () => {
    it('processes batch API calls with partial failures', async () => {
      interface User {
        id: number
        name: string
      }

      const fetchUser = async (id: number): Promise<User> => {
        if (id % 3 === 0) throw new Error(`User ${id} not found`)
        return { id, name: `User ${id}` }
      }

      const userIds = [1, 2, 3, 4, 5, 6]
      const results = await promiseAllSettled(userIds.map(fetchUser))

      const users = extractFulfilled(results)
      const errors = extractRejected<Error>(results)

      expect(users).toHaveLength(4)
      expect(errors).toHaveLength(2)
      expect(users.map((u) => u.id)).toEqual([1, 2, 4, 5])
      expect(errors.map((e) => e.message)).toEqual([
        'User 3 not found',
        'User 6 not found',
      ])
    })
  })
})
