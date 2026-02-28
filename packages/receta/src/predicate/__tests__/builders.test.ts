import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { where, oneOf, prop, matchesShape, hasProperty, satisfies, by } from '../builders'
import { gt, eq } from '../comparison'

describe('Predicate.builders', () => {
  describe('where', () => {
    it('tests multiple properties', () => {
      interface User {
        age: number
        name: string
        active: boolean
      }
      const users: User[] = [
        { age: 25, name: 'Alice', active: true },
        { age: 17, name: 'Bob', active: true },
        { age: 30, name: 'Charlie', active: false },
      ]

      const predicate = where({
        age: gt(18),
        active: Boolean,
      })

      expect(R.filter(users, predicate)).toEqual([{ age: 25, name: 'Alice', active: true }])
    })

    it('handles empty schema', () => {
      const predicate = where({})
      expect(predicate({ a: 1, b: 2 })).toBe(true)
    })

    it('ignores undefined predicates', () => {
      const predicate = where<{ a: number; b: number }>({
        a: gt(5),
        b: undefined,
      })
      expect(predicate({ a: 10, b: 1 })).toBe(true)
    })

    it('works with custom predicates', () => {
      const products = [
        { price: 10, category: 'electronics', inStock: true },
        { price: 50, category: 'electronics', inStock: false },
        { price: 15, category: 'books', inStock: true },
      ]

      const predicate = where({
        category: eq('electronics'),
        inStock: Boolean,
        price: (p: number) => p < 30,
      })

      expect(R.filter(products, predicate)).toEqual([
        { price: 10, category: 'electronics', inStock: true },
      ])
    })
  })

  describe('oneOf', () => {
    it('checks if value is in list', () => {
      const predicate = oneOf([1, 3, 5])
      expect(predicate(1)).toBe(true)
      expect(predicate(2)).toBe(false)
      expect(predicate(3)).toBe(true)
    })

    it('works with filter', () => {
      const numbers = [1, 2, 3, 4, 5]
      expect(R.filter(numbers, oneOf([1, 3, 5]))).toEqual([1, 3, 5])
    })

    it('works with strings', () => {
      const statuses = ['pending', 'shipped', 'cancelled', 'delivered']
      const activeStatuses = R.filter(statuses, oneOf(['pending', 'shipped']))
      expect(activeStatuses).toEqual(['pending', 'shipped'])
    })

    it('uses strict equality', () => {
      const predicate = oneOf([1, 2, 3])
      expect(predicate('1' as any)).toBe(false)
    })
  })

  describe('prop', () => {
    it('tests a single property', () => {
      const users = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 17 },
        { name: 'Charlie', age: 30 },
      ]

      expect(R.filter(users, prop('age', gt(18)))).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 30 },
      ])
    })

    it('works with oneOf', () => {
      const users = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 17 },
        { name: 'Charlie', age: 30 },
      ]

      expect(R.filter(users, prop('name', oneOf(['Alice', 'Bob'])))).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 17 },
      ])
    })
  })

  describe('matchesShape', () => {
    it('checks if object matches pattern', () => {
      const predicate = matchesShape({ type: 'click' })

      expect(predicate({ type: 'click', x: 100 })).toBe(true)
      expect(predicate({ type: 'keypress', key: 'Enter' })).toBe(false)
    })

    it('works with filter', () => {
      const events = [
        { type: 'click', x: 100, y: 200 },
        { type: 'keypress', key: 'Enter' },
        { type: 'click', x: 150, y: 250 },
      ]

      expect(R.filter(events, matchesShape({ type: 'click' }))).toEqual([
        { type: 'click', x: 100, y: 200 },
        { type: 'click', x: 150, y: 250 },
      ])
    })

    it('checks multiple properties', () => {
      const predicate = matchesShape({ status: 'success', code: 200 })

      expect(predicate({ status: 'success', code: 200 })).toBe(true)
      expect(predicate({ status: 'success', code: 404 })).toBe(false)
    })
  })

  describe('hasProperty', () => {
    it('checks if property exists', () => {
      const predicate = hasProperty('age')

      expect(predicate({ name: 'Alice', age: 25 })).toBe(true)
      expect(predicate({ name: 'Bob' })).toBe(false)
    })

    it('works with filter', () => {
      const objects = [
        { name: 'Alice', age: 25 },
        { name: 'Bob' },
        { name: 'Charlie', age: 30 },
      ]

      expect(R.filter(objects, hasProperty('age'))).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 30 },
      ])
    })
  })

  describe('satisfies', () => {
    it('is an identity function for readability', () => {
      const predicate = satisfies((n: number) => n % 2 === 0)
      expect(predicate(2)).toBe(true)
      expect(predicate(3)).toBe(false)
    })

    it('makes complex predicates readable', () => {
      const users = [
        { name: 'Alice', age: 25, premium: true },
        { name: 'Bob', age: 17, premium: false },
        { name: 'Charlie', age: 30, premium: true },
      ]

      const premiumAdults = R.filter(
        users,
        satisfies((u) => u.age >= 18 && u.premium)
      )

      expect(premiumAdults).toEqual([
        { name: 'Alice', age: 25, premium: true },
        { name: 'Charlie', age: 30, premium: true },
      ])
    })
  })

  describe('by', () => {
    it('tests derived values', () => {
      const users = [
        { name: 'Alice', tags: ['admin', 'user'] },
        { name: 'Bob', tags: ['user'] },
        { name: 'Charlie', tags: ['admin', 'moderator', 'user'] },
      ]

      const predicate = by((u: typeof users[0]) => u.tags.length, gt(1))
      expect(R.filter(users, predicate)).toEqual([
        { name: 'Alice', tags: ['admin', 'user'] },
        { name: 'Charlie', tags: ['admin', 'moderator', 'user'] },
      ])
    })

    it('works with computed values', () => {
      const products = [
        { name: 'A', price: 100, discount: 0.1 },
        { name: 'B', price: 50, discount: 0.2 },
        { name: 'C', price: 150, discount: 0 },
      ]

      const predicate = by((p: typeof products[0]) => p.price * (1 - p.discount), gt(80))
      expect(R.filter(products, predicate)).toEqual([
        { name: 'A', price: 100, discount: 0.1 },
        { name: 'C', price: 150, discount: 0 },
      ])
    })
  })

  describe('real-world scenarios', () => {
    it('complex database-like query', () => {
      const orders = [
        { id: 1, amount: 100, status: 'pending', userId: 1 },
        { id: 2, amount: 250, status: 'shipped', userId: 2 },
        { id: 3, amount: 50, status: 'pending', userId: 1 },
        { id: 4, amount: 300, status: 'delivered', userId: 3 },
      ]

      const predicate = where({
        status: oneOf(['pending', 'shipped']),
        amount: gt(75),
      })

      expect(R.filter(orders, predicate)).toEqual([
        { id: 1, amount: 100, status: 'pending', userId: 1 },
        { id: 2, amount: 250, status: 'shipped', userId: 2 },
      ])
    })
  })
})
