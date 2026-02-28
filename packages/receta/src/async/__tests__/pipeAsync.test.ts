import { describe, it, expect } from 'bun:test'
import { pipeAsync } from '../pipeAsync'

describe('Async.pipeAsync', () => {
  describe('basic composition', () => {
    it('composes single async function', async () => {
      const result = await pipeAsync(5, async (n) => n * 2)

      expect(result).toBe(10)
    })

    it('composes two async functions', async () => {
      const result = await pipeAsync(
        5,
        async (n) => n * 2,
        async (n) => n + 3
      )

      expect(result).toBe(13) // (5 * 2) + 3
    })

    it('composes three async functions', async () => {
      const result = await pipeAsync(
        5,
        async (n) => n * 2,
        async (n) => n + 3,
        async (n) => n.toString()
      )

      expect(result).toBe('13')
    })

    it('composes up to 10 functions', async () => {
      const result = await pipeAsync(
        1,
        async (n) => n + 1, // 2
        async (n) => n + 1, // 3
        async (n) => n + 1, // 4
        async (n) => n + 1, // 5
        async (n) => n + 1, // 6
        async (n) => n + 1, // 7
        async (n) => n + 1, // 8
        async (n) => n + 1, // 9
        async (n) => n + 1, // 10
        async (n) => n + 1 // 11
      )

      expect(result).toBe(11)
    })
  })

  describe('sync and async mix', () => {
    it('handles sync function followed by async', async () => {
      const result = await pipeAsync(
        5,
        (n) => n * 2, // sync
        async (n) => n + 3 // async
      )

      expect(result).toBe(13)
    })

    it('handles async function followed by sync', async () => {
      const result = await pipeAsync(
        5,
        async (n) => n * 2, // async
        (n) => n + 3 // sync
      )

      expect(result).toBe(13)
    })

    it('handles mixed sync and async functions', async () => {
      const result = await pipeAsync(
        'hello',
        (s) => s.toUpperCase(), // sync
        async (s) => s + ' WORLD', // async
        (s) => s.length, // sync
        async (n) => n * 2 // async
      )

      expect(result).toBe(22) // 'HELLO WORLD'.length * 2
    })
  })

  describe('type transformations', () => {
    it('transforms number to string', async () => {
      const result = await pipeAsync(
        42,
        async (n) => n.toString(),
        async (s) => s.padStart(5, '0')
      )

      expect(result).toBe('00042')
      expect(typeof result).toBe('string')
    })

    it('transforms string to array to number', async () => {
      const result = await pipeAsync(
        'a,b,c',
        async (s) => s.split(','),
        async (arr) => arr.length,
        async (n) => n * 10
      )

      expect(result).toBe(30)
    })

    it('transforms primitives to objects', async () => {
      interface User {
        id: number
        name: string
      }

      const result = await pipeAsync(
        42,
        async (id): Promise<User> => ({ id, name: 'John' }),
        async (user) => user.name.toUpperCase()
      )

      expect(result).toBe('JOHN')
    })
  })

  describe('sequential execution', () => {
    it('executes functions in order', async () => {
      const order: number[] = []

      await pipeAsync(
        0,
        async (n) => {
          order.push(1)
          return n + 1
        },
        async (n) => {
          order.push(2)
          return n + 1
        },
        async (n) => {
          order.push(3)
          return n + 1
        }
      )

      expect(order).toEqual([1, 2, 3])
    })

    it('waits for each async function to complete', async () => {
      const results: number[] = []

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      await pipeAsync(
        0,
        async (n) => {
          await delay(30)
          results.push(1)
          return n + 1
        },
        async (n) => {
          await delay(20)
          results.push(2)
          return n + 1
        },
        async (n) => {
          await delay(10)
          results.push(3)
          return n + 1
        }
      )

      // Despite different delays, execution is sequential
      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('error handling', () => {
    it('propagates errors from async functions', async () => {
      await expect(
        pipeAsync(
          5,
          async (n) => n * 2,
          async (n) => {
            throw new Error('Failed at step 2')
          },
          async (n) => n + 3
        )
      ).rejects.toThrow('Failed at step 2')
    })

    it('propagates errors from sync functions', async () => {
      await expect(
        pipeAsync(
          5,
          async (n) => n * 2,
          (n) => {
            throw new Error('Sync error')
          },
          async (n) => n + 3
        )
      ).rejects.toThrow('Sync error')
    })

    it('stops execution on first error', async () => {
      let reached = false

      await expect(
        pipeAsync(
          5,
          async (n) => {
            throw new Error('Early error')
          },
          async (n) => {
            reached = true
            return n
          }
        )
      ).rejects.toThrow('Early error')

      expect(reached).toBe(false)
    })
  })

  describe('real-world scenarios', () => {
    it('chains data transformations', async () => {
      interface User {
        id: number
        name: string
        email: string
      }

      const fetchUser = async (id: number): Promise<User> => ({
        id,
        name: 'John Doe',
        email: 'john@example.com',
      })

      const normalizeEmail = (user: User) => ({
        ...user,
        email: user.email.toLowerCase(),
      })

      const extractDomain = (user: User) => user.email.split('@')[1]

      const result = await pipeAsync(
        42,
        fetchUser,
        normalizeEmail,
        extractDomain
      )

      expect(result).toBe('example.com')
    })

    it('processes arrays asynchronously', async () => {
      const numbers = [1, 2, 3, 4, 5]

      const result = await pipeAsync(
        numbers,
        async (arr) => arr.filter((n) => n % 2 === 0),
        async (arr) => arr.map((n) => n * 2),
        async (arr) => arr.reduce((sum, n) => sum + n, 0)
      )

      expect(result).toBe(12) // [2, 4] => [4, 8] => 12
    })

    it('handles API response transformations', async () => {
      interface ApiResponse {
        data: { items: Array<{ id: number; value: string }> }
        meta: { total: number }
      }

      const mockApiCall = async (): Promise<ApiResponse> => ({
        data: {
          items: [
            { id: 1, value: 'a' },
            { id: 2, value: 'b' },
          ],
        },
        meta: { total: 2 },
      })

      const result = await pipeAsync(
        undefined,
        () => mockApiCall(),
        async (response) => response.data.items,
        async (items) => items.map((item) => item.value),
        async (values) => values.join(',')
      )

      expect(result).toBe('a,b')
    })
  })

  describe('edge cases', () => {
    it('handles undefined values', async () => {
      const result = await pipeAsync(
        undefined,
        async (val) => val ?? 'default',
        async (s) => s.toUpperCase()
      )

      expect(result).toBe('DEFAULT')
    })

    it('handles null values', async () => {
      const result = await pipeAsync(
        null,
        async (val) => val ?? 42,
        async (n) => n * 2
      )

      expect(result).toBe(84)
    })

    it('handles empty arrays', async () => {
      const result = await pipeAsync(
        [],
        async (arr: number[]) => arr.concat([1, 2, 3]),
        async (arr) => arr.length
      )

      expect(result).toBe(3)
    })

    it('preserves object references when not modified', async () => {
      const obj = { id: 1, name: 'test' }

      const result = await pipeAsync(
        obj,
        async (o) => o // pass through
      )

      expect(result).toBe(obj) // same reference
    })
  })

  describe('type inference', () => {
    it('infers types correctly through chain', async () => {
      const result = await pipeAsync(
        42,
        async (n: number) => n.toString(),
        async (s: string) => s.length,
        async (n: number) => n > 1
      )

      // TypeScript should infer result as boolean
      const isBoolean: boolean = result
      expect(isBoolean).toBe(true)
    })
  })
})
