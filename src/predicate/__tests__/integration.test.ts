import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { gt, lt, eq, between, startsWith, includes } from '../comparison'
import { and, or, not } from '../combinators'
import { where, oneOf, prop, by } from '../builders'
import { isString, isNumber, isDefined } from '../guards'

describe('Predicate.integration', () => {
  describe('SQL-like queries', () => {
    it('SELECT * FROM users WHERE age > 18 AND active = true', () => {
      const users = [
        { id: 1, age: 25, active: true, name: 'Alice' },
        { id: 2, age: 17, active: true, name: 'Bob' },
        { id: 3, age: 30, active: false, name: 'Charlie' },
        { id: 4, age: 22, active: true, name: 'Diana' },
      ]

      const result = R.filter(
        users,
        where({
          age: gt(18),
          active: eq(true),
        })
      )

      expect(result).toEqual([
        { id: 1, age: 25, active: true, name: 'Alice' },
        { id: 4, age: 22, active: true, name: 'Diana' },
      ])
    })

    it('WHERE status IN ("pending", "shipped") AND amount > 100', () => {
      const orders = [
        { id: 1, status: 'pending', amount: 150 },
        { id: 2, status: 'shipped', amount: 50 },
        { id: 3, status: 'pending', amount: 200 },
        { id: 4, status: 'delivered', amount: 300 },
      ]

      const result = R.filter(
        orders,
        where({
          status: oneOf(['pending', 'shipped']),
          amount: gt(100),
        })
      )

      expect(result).toEqual([
        { id: 1, status: 'pending', amount: 150 },
        { id: 3, status: 'pending', amount: 200 },
      ])
    })

    it('WHERE price BETWEEN 10 AND 50 AND category = "electronics"', () => {
      const products = [
        { id: 1, name: 'Phone', price: 500, category: 'electronics' },
        { id: 2, name: 'Cable', price: 15, category: 'electronics' },
        { id: 3, name: 'Book', price: 25, category: 'books' },
        { id: 4, name: 'Adapter', price: 30, category: 'electronics' },
      ]

      const result = R.filter(
        products,
        where({
          price: between(10, 50),
          category: eq('electronics'),
        })
      )

      expect(result).toEqual([
        { id: 2, name: 'Cable', price: 15, category: 'electronics' },
        { id: 4, name: 'Adapter', price: 30, category: 'electronics' },
      ])
    })
  })

  describe('E-commerce filters', () => {
    it('filters products by multiple criteria', () => {
      const products = [
        { id: 1, name: 'Laptop', price: 1000, rating: 4.5, inStock: true },
        { id: 2, name: 'Mouse', price: 25, rating: 3.5, inStock: true },
        { id: 3, name: 'Keyboard', price: 75, rating: 4.8, inStock: false },
        { id: 4, name: 'Monitor', price: 300, rating: 4.2, inStock: true },
      ]

      const result = R.pipe(
        products,
        R.filter(
          where({
            inStock: Boolean,
            price: between(50, 500),
            rating: gt(4.0),
          })
        )
      )

      expect(result).toEqual([{ id: 4, name: 'Monitor', price: 300, rating: 4.2, inStock: true }])
    })

    it('search with multiple conditions', () => {
      const products = [
        { name: 'Gaming Laptop', tags: ['electronics', 'gaming'] },
        { name: 'Office Laptop', tags: ['electronics', 'office'] },
        { name: 'Gaming Mouse', tags: ['electronics', 'gaming'] },
        { name: 'Gaming Chair', tags: ['furniture', 'gaming'] },
      ]

      const searchTerm = 'Gaming'
      const category = 'electronics'

      const result = R.filter(
        products,
        and(
          prop('name', includes(searchTerm)),
          (p) => p.tags.includes(category)
        )
      )

      expect(result).toEqual([
        { name: 'Gaming Laptop', tags: ['electronics', 'gaming'] },
        { name: 'Gaming Mouse', tags: ['electronics', 'gaming'] },
      ])
    })
  })

  describe('Complex business logic', () => {
    it('filters users eligible for promotion', () => {
      const users = [
        { id: 1, purchases: 12, totalSpent: 1200, memberSince: 2020, verified: true },
        { id: 2, purchases: 5, totalSpent: 500, memberSince: 2023, verified: true },
        { id: 3, purchases: 15, totalSpent: 800, memberSince: 2021, verified: false },
        { id: 4, purchases: 20, totalSpent: 2000, memberSince: 2019, verified: true },
      ]

      // Eligible if: verified AND (purchases > 10 OR totalSpent > 1000) AND memberSince <= 2021
      const result = R.filter(
        users,
        and(
          prop('verified', Boolean),
          or((u) => u.purchases > 10, (u) => u.totalSpent > 1000),
          (u) => u.memberSince <= 2021
        )
      )

      expect(result).toEqual([
        { id: 1, purchases: 12, totalSpent: 1200, memberSince: 2020, verified: true },
        { id: 4, purchases: 20, totalSpent: 2000, memberSince: 2019, verified: true },
      ])
    })

    it('filters items by derived properties', () => {
      const items = [
        { name: 'Item A', price: 100, discount: 0.2, quantity: 5 },
        { name: 'Item B', price: 50, discount: 0.1, quantity: 10 },
        { name: 'Item C', price: 200, discount: 0.3, quantity: 2 },
      ]

      // Filter items where final price > 70 AND total value < 500
      const result = R.filter(
        items,
        and(
          by((item) => item.price * (1 - item.discount), gt(70)),
          by((item) => item.price * item.quantity, lt(500))
        )
      )

      // Item A: finalPrice = 100 * 0.8 = 80 > 70 ✓, totalValue = 100 * 5 = 500 NOT < 500 ✗
      // Item B: finalPrice = 50 * 0.9 = 45 NOT > 70 ✗
      // Item C: finalPrice = 200 * 0.7 = 140 > 70 ✓, totalValue = 200 * 2 = 400 < 500 ✓
      expect(result).toEqual([{ name: 'Item C', price: 200, discount: 0.3, quantity: 2 }])
    })
  })

  describe('Type narrowing', () => {
    it('filters and narrows heterogeneous data', () => {
      interface StringItem {
        type: 'string'
        value: string
      }
      interface NumberItem {
        type: 'number'
        value: number
      }

      type Item = StringItem | NumberItem

      const items: Item[] = [
        { type: 'string', value: 'hello' },
        { type: 'number', value: 42 },
        { type: 'string', value: 'world' },
        { type: 'number', value: 100 },
      ]

      const strings = R.filter(items, prop('type', eq('string')))
      expect(strings).toEqual([
        { type: 'string', value: 'hello' },
        { type: 'string', value: 'world' },
      ])

      const numbers = R.filter(items, prop('type', eq('number')))
      expect(numbers).toEqual([
        { type: 'number', value: 42 },
        { type: 'number', value: 100 },
      ])
    })

    it('filters mixed types with type guards', () => {
      const mixed: unknown[] = ['hello', 42, true, null, 'world', undefined, 100, false]

      const strings = R.filter(mixed, isString)
      expect(strings).toEqual(['hello', 'world'])

      const numbers = R.filter(mixed, isNumber)
      expect(numbers).toEqual([42, 100])

      const defined = R.filter(mixed, isDefined)
      expect(defined).toHaveLength(6)
    })
  })

  describe('Real-world API filtering', () => {
    it('GitHub-like issue filtering', () => {
      const issues = [
        { id: 1, state: 'open', labels: ['bug', 'high-priority'], assignee: 'alice' },
        { id: 2, state: 'closed', labels: ['feature'], assignee: null },
        { id: 3, state: 'open', labels: ['bug'], assignee: 'bob' },
        { id: 4, state: 'open', labels: ['docs', 'good-first-issue'], assignee: null },
      ]

      // Open bugs assigned to someone
      const result = R.filter(
        issues,
        where({
          state: eq('open'),
          labels: (labels: string[]) => labels.includes('bug'),
          assignee: isDefined,
        })
      )

      expect(result).toEqual([
        { id: 1, state: 'open', labels: ['bug', 'high-priority'], assignee: 'alice' },
        { id: 3, state: 'open', labels: ['bug'], assignee: 'bob' },
      ])
    })

    it('Stripe-like transaction filtering', () => {
      const transactions = [
        { id: 1, amount: 1000, status: 'succeeded', currency: 'usd', refunded: false },
        { id: 2, amount: 500, status: 'failed', currency: 'usd', refunded: false },
        { id: 3, amount: 2000, status: 'succeeded', currency: 'eur', refunded: false },
        { id: 4, amount: 1500, status: 'succeeded', currency: 'usd', refunded: true },
      ]

      // Successful USD transactions over $10, not refunded
      const result = R.filter(
        transactions,
        and(
          prop('status', eq('succeeded')),
          prop('currency', eq('usd')),
          prop('amount', gt(1000)),
          prop('refunded', not(Boolean))
        )
      )

      expect(result).toEqual([])

      // Successful transactions over $500
      const successful = R.filter(
        transactions,
        where({
          status: eq('succeeded'),
          amount: gt(500),
        })
      )

      expect(successful).toHaveLength(3)
    })
  })

  describe('Pipeline composition', () => {
    it('chains multiple filtering steps', () => {
      const data = [
        { id: 1, name: 'Alice Anderson', age: 25, score: 85 },
        { id: 2, name: 'Bob Brown', age: 17, score: 92 },
        { id: 3, name: 'Alice Baker', age: 30, score: 78 },
        { id: 4, name: 'Charlie Anderson', age: 22, score: 88 },
      ]

      const result = R.pipe(
        data,
        R.filter(prop('age', gt(18))), // Adults only
        R.filter(prop('name', startsWith('Alice'))), // Names starting with Alice
        R.filter(prop('score', gt(80))) // High scorers
      )

      expect(result).toEqual([{ id: 1, name: 'Alice Anderson', age: 25, score: 85 }])
    })
  })
})
