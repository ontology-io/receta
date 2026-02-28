import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { mapKeys } from '../mapKeys'
import { mapValues } from '../mapValues'
import { filterKeys } from '../filterKeys'
import { filterValues } from '../filterValues'

describe('Object.mapKeys', () => {
  describe('data-first', () => {
    it('transforms all keys', () => {
      const input = { first_name: 'Alice', last_name: 'Smith' }
      const result = mapKeys(input, (key) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()))
      expect(result).toEqual({ firstName: 'Alice', lastName: 'Smith' })
    })

    it('prefixes keys', () => {
      const input = { id: 1, name: 'Alice' }
      const result = mapKeys(input, (key) => `user_${key}`)
      expect(result).toEqual({ user_id: 1, user_name: 'Alice' })
    })

    it('handles key collisions (later values win)', () => {
      const input = { a: 1, b: 2 }
      const result = mapKeys(input, () => 'same')
      expect(result).toEqual({ same: 2 }) // 'b' was processed last
    })

    it('receives key and value', () => {
      const input = { num: 42, str: 'hello' }
      const result = mapKeys(input, (key, value) =>
        typeof value === 'number' ? key.toUpperCase() : key
      )
      expect(result).toEqual({ NUM: 42, str: 'hello' })
    })

    it('handles empty objects', () => {
      expect(mapKeys({}, (key) => key.toUpperCase())).toEqual({})
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const input = { first_name: 'Alice' }
      const result = R.pipe(input, mapKeys((key) => key.toUpperCase()))
      expect(result).toEqual({ FIRST_NAME: 'Alice' })
    })
  })
})

describe('Object.mapValues', () => {
  describe('data-first', () => {
    it('transforms all values', () => {
      const prices = { apple: 1.5, banana: 0.5, orange: 2.0 }
      const result = mapValues(prices, (price) => Math.round(price * 1.1 * 100) / 100)
      expect(result).toEqual({ apple: 1.65, banana: 0.55, orange: 2.2 })
    })

    it('converts types', () => {
      const input = { a: 1, b: 2, c: 3 }
      const result = mapValues(input, (n) => String(n))
      expect(result).toEqual({ a: '1', b: '2', c: '3' })
    })

    it('receives value and key', () => {
      const input = { a: 1, b: 2 }
      const result = mapValues(input, (value, key) => `${key}=${value}`)
      expect(result).toEqual({ a: 'a=1', b: 'b=2' })
    })

    it('handles empty objects', () => {
      expect(mapValues({}, (v) => v)).toEqual({})
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const input = { a: 1, b: 2 }
      const result = R.pipe(input, mapValues((n) => n * 2))
      expect(result).toEqual({ a: 2, b: 4 })
    })
  })
})

describe('Object.filterKeys', () => {
  describe('data-first', () => {
    it('filters keys by predicate', () => {
      const config = {
        api_key: 'secret',
        api_url: 'https://api.example.com',
        db_host: 'localhost',
        db_port: 5432,
      }
      const result = filterKeys(config, (key) => key.startsWith('api_'))
      expect(result).toEqual({
        api_key: 'secret',
        api_url: 'https://api.example.com',
      })
    })

    it('removes private keys', () => {
      const obj = { id: 1, _internal: 'hidden', name: 'Alice', _cache: {} }
      const result = filterKeys(obj, (key) => !key.startsWith('_'))
      expect(result).toEqual({ id: 1, name: 'Alice' })
    })

    it('filters by pattern', () => {
      const data = { abc: 1, def: 2, '123': 3, ghi: 4 }
      const result = filterKeys(data, (key) => /^[a-z]+$/.test(key))
      expect(result).toEqual({ abc: 1, def: 2, ghi: 4 })
    })

    it('returns empty object when no keys match', () => {
      const obj = { a: 1, b: 2 }
      expect(filterKeys(obj, () => false)).toEqual({})
    })

    it('handles empty objects', () => {
      expect(filterKeys({}, () => true)).toEqual({})
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const obj = { api_key: 'secret', api_url: 'https://api.com', user: 'Alice' }
      const result = R.pipe(obj, filterKeys((key) => key.startsWith('api_')))
      expect(result).toEqual({ api_key: 'secret', api_url: 'https://api.com' })
    })
  })
})

describe('Object.filterValues', () => {
  describe('data-first', () => {
    it('filters values by predicate', () => {
      const scores = { alice: 85, bob: 60, charlie: 92, diana: 55 }
      const result = filterValues(scores, (score) => score >= 70)
      expect(result).toEqual({ alice: 85, charlie: 92 })
    })

    it('removes empty strings', () => {
      const data = { a: 'hello', b: '', c: 'world', d: '' }
      const result = filterValues(data, (v) => v !== '')
      expect(result).toEqual({ a: 'hello', c: 'world' })
    })

    it('filters by type', () => {
      const mixed = { a: 1, b: 'two', c: 3, d: 'four' }
      const result = filterValues(mixed, (v) => typeof v === 'number')
      expect(result).toEqual({ a: 1, c: 3 })
    })

    it('receives value and key', () => {
      const data = { a: 5, b: 10, c: 15 }
      const result = filterValues(data, (value, key) => key === 'a' || value > 10)
      expect(result).toEqual({ a: 5, c: 15 })
    })

    it('returns empty object when no values match', () => {
      const obj = { a: 1, b: 2 }
      expect(filterValues(obj, () => false)).toEqual({})
    })

    it('handles empty objects', () => {
      expect(filterValues({}, () => true)).toEqual({})
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const scores = { alice: 85, bob: 60 }
      const result = R.pipe(scores, filterValues((score) => score >= 70))
      expect(result).toEqual({ alice: 85 })
    })
  })
})
