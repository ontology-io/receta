import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { getPath } from '../getPath'
import { setPath } from '../setPath'
import { updatePath } from '../updatePath'
import { isSome, isNone } from '../../option/guards'

describe('Object.getPath', () => {
  describe('data-first', () => {
    it('retrieves nested values', () => {
      const config = { database: { host: 'localhost', port: 5432 } }
      const result = getPath(config, ['database', 'host'])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('localhost')
      }
    })

    it('returns None for non-existent paths', () => {
      const config = { database: { host: 'localhost' } }
      const result = getPath(config, ['database', 'user'])
      expect(isNone(result)).toBe(true)
    })

    it('returns None when intermediate path is undefined', () => {
      const config = { database: { host: 'localhost' } }
      const result = getPath(config, ['api', 'key'])
      expect(isNone(result)).toBe(true)
    })

    it('handles empty path', () => {
      const obj = { name: 'Alice' }
      const result = getPath(obj, [])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toEqual(obj)
      }
    })

    it('handles array indices', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = getPath(obj, ['items', 1])
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('b')
      }
    })

    it('returns None for null values', () => {
      const obj = { value: null }
      const result = getPath(obj, ['value', 'nested'])
      expect(isNone(result)).toBe(true)
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const config = { database: { host: 'localhost' } }
      const result = R.pipe(config, getPath(['database', 'host']))
      expect(isSome(result)).toBe(true)
    })
  })
})

describe('Object.setPath', () => {
  describe('data-first', () => {
    it('sets nested values immutably', () => {
      const config = { database: { host: 'localhost' } }
      const result = setPath(config, ['database', 'port'], 5432)
      expect(result).toEqual({ database: { host: 'localhost', port: 5432 } })
      // Original unchanged
      expect(config).toEqual({ database: { host: 'localhost' } })
    })

    it('creates intermediate paths', () => {
      const result = setPath({}, ['api', 'endpoints', 'users'], '/api/v1/users')
      expect(result).toEqual({
        api: { endpoints: { users: '/api/v1/users' } },
      })
    })

    it('handles array indices', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = setPath(obj, ['items', 1], 'updated')
      expect(result).toEqual({ items: ['a', 'updated', 'c'] })
    })

    it('replaces primitive values with objects', () => {
      const obj = { value: 'string' }
      const result = setPath(obj, ['value', 'nested'], 42)
      expect(result).toEqual({ value: { nested: 42 } })
    })

    it('handles empty path by replacing entire object', () => {
      const obj = { a: 1 }
      const result = setPath(obj, [], { b: 2 })
      expect(result).toEqual({ b: 2 })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const config = { database: { host: 'localhost' } }
      const result = R.pipe(
        config,
        setPath(['database', 'port'], 5432),
        setPath(['database', 'user'], 'admin')
      )
      expect(result).toEqual({
        database: { host: 'localhost', port: 5432, user: 'admin' },
      })
    })
  })
})

describe('Object.updatePath', () => {
  describe('data-first', () => {
    it('updates value with function', () => {
      const user = { profile: { views: 10 } }
      const result = updatePath(user, ['profile', 'views'], (n: number) => n + 1)
      expect(result).toEqual({ profile: { views: 11 } })
    })

    it('returns original when path not found', () => {
      const user = { profile: { views: 10 } }
      const result = updatePath(user, ['profile', 'likes'], (n: number) => n + 1)
      expect(result).toBe(user) // Same reference
    })

    it('transforms nested values', () => {
      const config = { database: { host: 'localhost' } }
      const result = updatePath(config, ['database', 'host'], (s: string) => s.toUpperCase())
      expect(result).toEqual({ database: { host: 'LOCALHOST' } })
    })

    it('handles array values', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = updatePath(obj, ['items'], (arr: string[]) => [...arr, 'd'])
      expect(result).toEqual({ items: ['a', 'b', 'c', 'd'] })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const user = { profile: { views: 10, likes: 5 } }
      const result = R.pipe(
        user,
        updatePath(['profile', 'views'], (n: number) => n + 1),
        updatePath(['profile', 'likes'], (n: number) => n + 1)
      )
      expect(result).toEqual({ profile: { views: 11, likes: 6 } })
    })
  })
})
