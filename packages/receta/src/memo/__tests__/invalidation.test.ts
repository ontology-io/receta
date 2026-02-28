import { describe, it, expect, vi } from 'vitest'
import { memoize, memoizeBy, memoizeAsync } from '../index'
import { invalidateMany, invalidateWhere, invalidateAll } from '../invalidation'
import { lruCache } from '../caches/lruCache'
import { weakCache } from '../caches/weakCache'

describe('Invalidation Utilities', () => {
  describe('invalidateMany', () => {
    it('invalidates multiple cache entries', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      memoized(2)
      memoized(3)
      expect(fn).toHaveBeenCalledTimes(3)

      // All cached
      memoized(1)
      memoized(2)
      memoized(3)
      expect(fn).toHaveBeenCalledTimes(3)

      // Invalidate 1 and 3
      invalidateMany(memoized, [1, 3])

      memoized(1) // Recomputed
      memoized(2) // Cached
      memoized(3) // Recomputed

      expect(fn).toHaveBeenCalledTimes(5) // 3 initial + 2 recomputed
    })

    it('works with empty array', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      invalidateMany(memoized, [])

      memoized(1) // Still cached
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('works with async memoized functions', async () => {
      const fn = vi.fn(async (id: string) => `User ${id}`)
      const memoized = memoizeAsync(fn)

      await memoized('1')
      await memoized('2')
      await memoized('3')
      expect(fn).toHaveBeenCalledTimes(3)

      invalidateMany(memoized, ['1', '3'])

      await memoized('1') // Recomputed
      await memoized('2') // Cached
      await memoized('3') // Recomputed

      expect(fn).toHaveBeenCalledTimes(5)
    })

    it('works with custom key function', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = memoizeBy(fn, (a, b) => `${a},${b}`)

      memoized(2, 3)
      memoized(4, 5)
      expect(fn).toHaveBeenCalledTimes(2)

      invalidateMany(memoized, ['2,3'])

      memoized(2, 3) // Recomputed
      memoized(4, 5) // Cached
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('handles non-existent keys gracefully', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      expect(fn).toHaveBeenCalledTimes(1)

      // Invalidate keys that don't exist
      invalidateMany(memoized, [999, 1000])

      memoized(1) // Still cached
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('invalidateWhere', () => {
    it('invalidates entries matching predicate', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      memoized(2)
      memoized(3)
      memoized(4)
      memoized(5)
      expect(fn).toHaveBeenCalledTimes(5)

      // Invalidate even numbers
      invalidateWhere(memoized, (key: number) => key % 2 === 0)

      memoized(1) // Cached
      memoized(2) // Recomputed
      memoized(3) // Cached
      memoized(4) // Recomputed
      memoized(5) // Cached

      expect(fn).toHaveBeenCalledTimes(7) // 5 initial + 2 recomputed
    })

    it('works with string keys and pattern matching', () => {
      const fn = vi.fn((key: string) => `Value for ${key}`)
      const memoized = memoizeBy(
        (id: string, type: string) => fn(`${type}:${id}`),
        (id, type) => `${type}:${id}`
      )

      memoized('1', 'user')
      memoized('2', 'user')
      memoized('3', 'admin')
      memoized('4', 'admin')
      expect(fn).toHaveBeenCalledTimes(4)

      // Invalidate all admin entries
      invalidateWhere(memoized, (key: string) => key.startsWith('admin:'))

      memoized('1', 'user') // Cached
      memoized('2', 'user') // Cached
      memoized('3', 'admin') // Recomputed
      memoized('4', 'admin') // Recomputed

      expect(fn).toHaveBeenCalledTimes(6)
    })

    it('can access cached values in predicate', () => {
      interface User {
        id: string
        active: boolean
      }

      const fn = vi.fn((id: string): User => ({ id, active: id !== '3' }))
      const memoized = memoize(fn)

      memoized('1')
      memoized('2')
      memoized('3')
      memoized('4')
      expect(fn).toHaveBeenCalledTimes(4)

      // Invalidate inactive users
      invalidateWhere(memoized, (_key, value: User | undefined) => {
        return value?.active === false
      })

      memoized('1') // Cached
      memoized('2') // Cached
      memoized('3') // Recomputed (was inactive)
      memoized('4') // Cached

      expect(fn).toHaveBeenCalledTimes(5)
    })

    it('works with default Map cache', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn) // Uses default Map cache

      for (let i = 1; i <= 5; i++) {
        memoized(i)
      }
      expect(fn).toHaveBeenCalledTimes(5)

      invalidateWhere(memoized, (key: number) => key > 3)

      memoized(1) // Cached
      memoized(2) // Cached
      memoized(3) // Cached
      memoized(4) // Recomputed
      memoized(5) // Recomputed

      expect(fn).toHaveBeenCalledTimes(7)
    })

    it('throws error for WeakMap cache', () => {
      const fn = vi.fn((obj: object) => obj)
      const memoized = memoizeBy(fn, (obj) => obj, { cache: weakCache() })

      const obj = {}
      memoized(obj)

      expect(() => {
        invalidateWhere(memoized, () => true)
      }).toThrow(/WeakMap does not support iteration/)
    })

    it('handles no matches gracefully', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      memoized(2)
      expect(fn).toHaveBeenCalledTimes(2)

      // No matches
      invalidateWhere(memoized, (key: number) => key > 100)

      memoized(1) // Still cached
      memoized(2) // Still cached
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('handles all matches (equivalent to clear)', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      memoized(2)
      memoized(3)
      expect(fn).toHaveBeenCalledTimes(3)

      // Match everything
      invalidateWhere(memoized, () => true)

      memoized(1) // Recomputed
      memoized(2) // Recomputed
      memoized(3) // Recomputed
      expect(fn).toHaveBeenCalledTimes(6)
    })
  })

  describe('invalidateAll', () => {
    it('clears multiple memoized functions', () => {
      const fn1 = vi.fn((n: number) => n * 2)
      const fn2 = vi.fn((n: number) => n * 3)
      const fn3 = vi.fn((n: number) => n * 4)

      const memo1 = memoize(fn1)
      const memo2 = memoize(fn2)
      const memo3 = memoize(fn3)

      memo1(5)
      memo2(5)
      memo3(5)
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(fn3).toHaveBeenCalledTimes(1)

      // All cached
      memo1(5)
      memo2(5)
      memo3(5)
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(fn3).toHaveBeenCalledTimes(1)

      // Clear all
      invalidateAll(memo1, memo2, memo3)

      memo1(5) // Recomputed
      memo2(5) // Recomputed
      memo3(5) // Recomputed
      expect(fn1).toHaveBeenCalledTimes(2)
      expect(fn2).toHaveBeenCalledTimes(2)
      expect(fn3).toHaveBeenCalledTimes(2)
    })

    it('works with async memoized functions', async () => {
      const fn1 = vi.fn(async (id: string) => `User ${id}`)
      const fn2 = vi.fn(async (id: string) => `Post ${id}`)

      const memo1 = memoizeAsync(fn1)
      const memo2 = memoizeAsync(fn2)

      await memo1('1')
      await memo2('1')
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)

      invalidateAll(memo1, memo2)

      await memo1('1') // Recomputed
      await memo2('1') // Recomputed
      expect(fn1).toHaveBeenCalledTimes(2)
      expect(fn2).toHaveBeenCalledTimes(2)
    })

    it('works with single function', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      invalidateAll(memoized)

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('works with empty arguments', () => {
      // Should not throw
      expect(() => invalidateAll()).not.toThrow()
    })

    it('works with mixed sync and async functions', async () => {
      const syncFn = vi.fn((n: number) => n * 2)
      const asyncFn = vi.fn(async (n: number) => n * 3)

      const memoSync = memoize(syncFn)
      const memoAsync = memoizeAsync(asyncFn)

      memoSync(5)
      await memoAsync(5)
      expect(syncFn).toHaveBeenCalledTimes(1)
      expect(asyncFn).toHaveBeenCalledTimes(1)

      invalidateAll(memoSync, memoAsync)

      memoSync(5)
      await memoAsync(5)
      expect(syncFn).toHaveBeenCalledTimes(2)
      expect(asyncFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('real-world scenarios', () => {
    it('batch user update with invalidateMany', async () => {
      const fetchUser = vi.fn(async (id: string) => ({ id, name: `User ${id}` }))
      const getUser = memoizeAsync(fetchUser)

      // Initial fetches
      await getUser('1')
      await getUser('2')
      await getUser('3')
      expect(fetchUser).toHaveBeenCalledTimes(3)

      // Simulate batch update
      const updatedIds = ['1', '3']
      invalidateMany(getUser, updatedIds)

      // Only updated users are refetched
      await getUser('1') // Refetched
      await getUser('2') // Cached
      await getUser('3') // Refetched
      expect(fetchUser).toHaveBeenCalledTimes(5)
    })

    it('delete user and clear related caches', async () => {
      const fetchUser = vi.fn(async (id: string) => ({ id, name: `User ${id}` }))
      const fetchPosts = vi.fn(async (userId: string) => [{ userId, title: 'Post' }])
      const fetchComments = vi.fn(async (userId: string) => [{ userId, text: 'Comment' }])

      const getUser = memoizeAsync(fetchUser)
      const getUserPosts = memoizeAsync(fetchPosts)
      const getUserComments = memoizeAsync(fetchComments)

      // Fetch user data
      await getUser('123')
      await getUserPosts('123')
      await getUserComments('123')

      // Delete user - clear all related caches
      invalidateAll(getUser, getUserPosts, getUserComments)

      // All refetch
      await getUser('123')
      await getUserPosts('123')
      await getUserComments('123')

      expect(fetchUser).toHaveBeenCalledTimes(2)
      expect(fetchPosts).toHaveBeenCalledTimes(2)
      expect(fetchComments).toHaveBeenCalledTimes(2)
    })

    it('invalidate admin users with invalidateWhere', () => {
      interface User {
        id: string
        role: 'admin' | 'user'
        name: string
      }

      const fetchUser = vi.fn((id: string): User => ({
        id,
        role: id.startsWith('admin') ? 'admin' : 'user',
        name: `User ${id}`,
      }))

      const getUser = memoizeBy(fetchUser, (id) => id)

      getUser('admin-1')
      getUser('user-1')
      getUser('admin-2')
      getUser('user-2')
      expect(fetchUser).toHaveBeenCalledTimes(4)

      // Invalidate all admins after permission change
      invalidateWhere(getUser, (_key, value: User | undefined) => value?.role === 'admin')

      getUser('admin-1') // Refetched
      getUser('user-1') // Cached
      getUser('admin-2') // Refetched
      getUser('user-2') // Cached

      expect(fetchUser).toHaveBeenCalledTimes(6)
    })
  })
})
