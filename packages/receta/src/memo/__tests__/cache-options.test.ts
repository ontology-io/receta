import { describe, it, expect, vi } from 'bun:test'
import { isNone, isSome, some } from '../../option'
import { lruCache, ttlCache, weakCache } from '../caches'
import { invalidateWhere } from '../invalidation'
import { memoize } from '../memoize'
import { memoizeAsync } from '../memoizeAsync'
import { memoizeBy } from '../memoizeBy'

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('the ttl option', () => {
  it('expires entries in memoize', async () => {
    const fn = vi.fn((n: number) => n * 2)
    const memoized = memoize(fn, { ttl: 50 })

    memoized(1)
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(1)

    await pause(80)
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('expires entries in memoizeBy', async () => {
    const fn = vi.fn((a: number, b: number) => a + b)
    const memoized = memoizeBy(fn, (a, b) => `${a}:${b}`, { ttl: 50 })

    memoized(1, 2)
    memoized(1, 2)
    expect(fn).toHaveBeenCalledTimes(1)

    await pause(80)
    memoized(1, 2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('expires entries in memoizeAsync', async () => {
    const fn = vi.fn(async (n: number) => n * 2)
    const memoized = memoizeAsync(fn, { ttl: 50 })

    await memoized(1)
    await memoized(1)
    expect(fn).toHaveBeenCalledTimes(1)

    await pause(80)
    await memoized(1)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('works with maxSize', async () => {
    const fn = vi.fn((n: number) => n * 2)
    const memoized = memoize(fn, { ttl: 50, maxSize: 2 })

    memoized(1)
    memoized(2)
    memoized(3)
    expect(memoized.cache.has(1)).toBe(false)
    expect(memoized.cache.has(3)).toBe(true)

    await pause(80)
    expect(memoized.cache.has(3)).toBe(false)
  })

  it('never expires without a ttl', async () => {
    const fn = vi.fn((n: number) => n * 2)
    const memoized = memoize(fn)

    memoized(1)
    await pause(20)
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('gives way to a cache that is passed in', async () => {
    const fn = vi.fn((n: number) => n * 2)
    const memoized = memoize(fn, { ttl: 1, cache: lruCache(10) })

    memoized(1)
    await pause(20)
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('invalidateWhere on the built-in caches', () => {
  const double = (n: number) => n * 2

  it('removes matching entries from a ttlCache', () => {
    const memoized = memoize(double, { cache: ttlCache(1000) })
    memoized(1)
    memoized(2)

    invalidateWhere<number>(memoized, (key) => key === 1)

    expect(memoized.cache.has(1)).toBe(false)
    expect(memoized.cache.has(2)).toBe(true)
  })

  it('removes matching entries from a lruCache', () => {
    const memoized = memoize(double, { cache: lruCache(10) })
    memoized(1)
    memoized(2)

    invalidateWhere<number>(memoized, (key) => key === 1)

    expect(memoized.cache.has(1)).toBe(false)
    expect(memoized.cache.has(2)).toBe(true)
  })

  it('passes each cached value', () => {
    const memoized = memoize(double, { cache: ttlCache(1000) })
    memoized(1)
    memoized(2)

    invalidateWhere<number, number>(memoized, (_key, value) => value === 4)

    expect(memoized.cache.has(1)).toBe(true)
    expect(memoized.cache.has(2)).toBe(false)
  })

  it('skips expired ttlCache entries', async () => {
    const memoized = memoize(double, { cache: ttlCache(10) })
    memoized(1)
    await pause(30)

    const seen = vi.fn(() => false)
    invalidateWhere(memoized, seen)

    expect(seen).not.toHaveBeenCalled()
  })

  it('does not change which lruCache entry is evicted next', () => {
    const cache = lruCache<number, string>(2)
    cache.set(1, 'one')
    cache.set(2, 'two')

    cache.forEach?.(() => undefined)
    cache.set(3, 'three')

    expect(cache.has(1)).toBe(false)
    expect(cache.has(2)).toBe(true)
  })

  it('still throws for a weakCache, which cannot be listed', () => {
    const memoized = memoize((key: object) => key, { cache: weakCache() })
    expect(() => invalidateWhere(memoized, () => true)).toThrow('WeakMap')
  })
})

describe('cached values that are empty', () => {
  it('lruCache keeps undefined', () => {
    const cache = lruCache<string, undefined>(2)
    cache.set('a', undefined)
    expect(cache.get('a')).toEqual(some(undefined))
  })

  it('memoize with a lruCache computes undefined once', () => {
    const fn = vi.fn((_key: string): undefined => undefined)
    const memoized = memoize(fn, { cache: lruCache(2) })

    expect(memoized('a')).toBeUndefined()
    expect(memoized('a')).toBeUndefined()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('weakCache keeps null', () => {
    const key = {}
    const cache = weakCache<object, null>()
    cache.set(key, null)
    expect(cache.get(key)).toEqual(some(null))
  })

  it('memoize with a weakCache computes null once', () => {
    const key = {}
    const fn = vi.fn((_key: object): null => null)
    const memoized = memoize(fn, { cache: weakCache() })

    expect(memoized(key)).toBeNull()
    expect(memoized(key)).toBeNull()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('reports a missing key as None', () => {
    expect(isNone(lruCache<string, number>(2).get('missing'))).toBe(true)
    expect(isNone(weakCache<object, number>().get({}))).toBe(true)
    expect(isSome(some(undefined))).toBe(true)
  })
})
