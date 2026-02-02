import { describe, it, expect, vi } from 'vitest'
import { memoizeBy } from '../memoizeBy'
import { some } from '../../option'

describe('memoizeBy', () => {
  describe('custom key extraction', () => {
    it('uses custom key function', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = memoizeBy(fn, (a, b) => `${a},${b}`)

      expect(memoized(2, 3)).toBe(5)
      expect(memoized(2, 3)).toBe(5)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles different argument combinations', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = memoizeBy(fn, (a, b) => `${a},${b}`)

      expect(memoized(2, 3)).toBe(5)
      expect(memoized(3, 2)).toBe(5)
      expect(fn).toHaveBeenCalledTimes(2) // Different keys
    })
  })

  describe('object arguments', () => {
    it('serializes object to JSON key', () => {
      interface FetchOpts {
        id: string
        include?: string[]
      }

      const fn = vi.fn((opts: FetchOpts) => `User ${opts.id}`)
      const memoized = memoizeBy(fn, (opts) => JSON.stringify(opts))

      expect(memoized({ id: '123' })).toBe('User 123')
      expect(memoized({ id: '123' })).toBe('User 123')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('distinguishes different object values', () => {
      interface FetchOpts {
        id: string
        type: string
      }

      const fn = vi.fn((opts: FetchOpts) => `${opts.type}:${opts.id}`)
      const memoized = memoizeBy(
        fn,
        (opts) => `${opts.id}:${opts.type}`
      )

      expect(memoized({ id: '1', type: 'user' })).toBe('user:1')
      expect(memoized({ id: '1', type: 'post' })).toBe('post:1')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('object keys', () => {
    it('uses object itself as key', () => {
      interface Node {
        id: string
        value: number
      }

      const fn = vi.fn((node: Node) => node.value * 2)
      const memoized = memoizeBy(fn, (node) => node)

      const node1 = { id: 'a', value: 5 }
      const node2 = { id: 'b', value: 10 }

      expect(memoized(node1)).toBe(10)
      expect(memoized(node1)).toBe(10) // Cached
      expect(memoized(node2)).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('complex key functions', () => {
    it('combines multiple arguments into key', () => {
      const fn = vi.fn((id: string, type: string, page: number) =>
        `${type}:${id}:${page}`
      )
      const memoized = memoizeBy(
        fn,
        (id, type, page) => `${id}-${type}-${page}`
      )

      expect(memoized('123', 'user', 1)).toBe('user:123:1')
      expect(memoized('123', 'user', 1)).toBe('user:123:1')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('normalizes keys', () => {
      const fn = vi.fn((str: string) => str.toLowerCase())
      const memoized = memoizeBy(fn, (str) => str.toLowerCase())

      expect(memoized('HELLO')).toBe('hello')
      expect(memoized('hello')).toBe('hello') // Same normalized key
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('cache access', () => {
    it('exposes cache property', () => {
      const fn = (n: number) => n * 2
      const memoized = memoizeBy(fn, (n) => String(n))

      memoized(5)

      expect(memoized.cache.has('5')).toBe(true)
      expect(memoized.cache.get('5')).toEqual(some(10))
    })

    it('exposes clear method', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoizeBy(fn, (n) => String(n))

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      memoized.clear()

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('maxSize option', () => {
    it('evicts oldest entry when max size exceeded', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoizeBy(fn, (n) => n, { maxSize: 2 })

      memoized(1)
      memoized(2)
      memoized(3) // Evicts 1

      expect(fn).toHaveBeenCalledTimes(3)

      memoized(2) // Cached
      memoized(3) // Cached
      memoized(1) // Recomputed

      expect(fn).toHaveBeenCalledTimes(4)
    })
  })

  describe('edge cases', () => {
    it('handles key function returning undefined', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoizeBy(fn, () => undefined)

      expect(memoized(5)).toBe(10)
      expect(memoized(10)).toBe(10) // Same key (undefined), cached!
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles key function returning null', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoizeBy(fn, () => null)

      expect(memoized(5)).toBe(10)
      expect(memoized(10)).toBe(10) // Same key (null), cached!
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('type inference', () => {
    it('preserves function signature', () => {
      const fn = (a: number, b: string): string => `${a}-${b}`
      const memoized = memoizeBy(fn, (a, b) => `${a}:${b}`)

      const result: string = memoized(42, 'hello')
      expect(result).toBe('42-hello')
    })
  })
})
