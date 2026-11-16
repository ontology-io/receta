// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
// memoize and memoizeAsync use the first argument as the cache key, whatever its type.
import { lruCache, memoize, memoizeAsync, memoizeBy, ttlCache, weakCache, type Cache } from '../index'

interface User {
  id: number
  name: string
}

declare const loadUser: (id: number) => Promise<User>
declare const loadReport: (query: { id: string; type: string }) => Promise<string>

// A cache keyed by a number
const doubles: Cache<number, number> = lruCache<number, number>(10)
export const double = memoize((id: number) => id * 2, { cache: doubles })

// A cache keyed by an object
export const nameOf = memoize((user: User) => user.name, { cache: weakCache<User, string>() })

// A string key works as before, and so does a cache with no type arguments
export const length = memoize((id: string) => id.length, { cache: lruCache<string, number>(10) })
export const inferred = memoize((id: number) => id * 2, { cache: ttlCache(1000) })
export const bounded = memoize((id: number) => id * 2, { maxSize: 10, ttl: 1000 })

// memoizeAsync: the first argument, or whatever keyFn returns
export const user = memoizeAsync(loadUser, { cache: ttlCache<number, Promise<User>>(1000) })
export const report = memoizeAsync(loadReport, {
  keyFn: (query) => `${query.id}:${query.type}`,
  cache: lruCache<string, Promise<string>>(50),
})
export const reportByKeyOnly = memoizeAsync(loadReport, { keyFn: (query) => query.id })
export const userBounded = memoizeAsync(loadUser, { maxSize: 100 })
export const loaded: Promise<User> = user(1)

// memoizeBy already typed its key
export const byId = memoizeBy((u: User) => u.name, (u) => u.id, { cache: lruCache<number, string>(10) })

// @ts-expect-error the cache is keyed by a string but the first argument is a number
memoize((id: number) => id * 2, { cache: lruCache<string, number>(10) })
// @ts-expect-error the cache is keyed by a number but keyFn returns a string
memoizeAsync(loadReport, { keyFn: (query) => query.id, cache: lruCache<number, Promise<string>>(10) })
