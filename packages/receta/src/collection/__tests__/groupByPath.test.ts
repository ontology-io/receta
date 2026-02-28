import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { groupByPath } from '../groupByPath'

describe('Collection.groupByPath', () => {
  describe('data-first', () => {
    it('groups by single-level path', () => {
      const users = [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' },
        { name: 'Charlie', role: 'admin' },
      ]

      const result = groupByPath(users, 'role')

      expect(result).toEqual({
        admin: [
          { name: 'Alice', role: 'admin' },
          { name: 'Charlie', role: 'admin' },
        ],
        user: [{ name: 'Bob', role: 'user' }],
      })
    })

    it('groups by nested path', () => {
      const users = [
        { name: 'Alice', profile: { role: 'admin' } },
        { name: 'Bob', profile: { role: 'user' } },
        { name: 'Charlie', profile: { role: 'admin' } },
      ]

      const result = groupByPath(users, 'profile.role')

      expect(result).toEqual({
        admin: [
          { name: 'Alice', profile: { role: 'admin' } },
          { name: 'Charlie', profile: { role: 'admin' } },
        ],
        user: [{ name: 'Bob', profile: { role: 'user' } }],
      })
    })

    it('groups by deeply nested path', () => {
      const data = [
        { id: 1, meta: { user: { role: 'admin' } } },
        { id: 2, meta: { user: { role: 'user' } } },
        { id: 3, meta: { user: { role: 'admin' } } },
      ]

      const result = groupByPath(data, 'meta.user.role')

      expect(result).toEqual({
        admin: [
          { id: 1, meta: { user: { role: 'admin' } } },
          { id: 3, meta: { user: { role: 'admin' } } },
        ],
        user: [{ id: 2, meta: { user: { role: 'user' } } }],
      })
    })

    it('handles undefined/null values in path', () => {
      const users = [
        { name: 'Alice', profile: { role: 'admin' } },
        { name: 'Bob', profile: null },
        { name: 'Charlie', profile: undefined },
      ]

      const result = groupByPath(users, 'profile.role')

      expect(result).toEqual({
        admin: [{ name: 'Alice', profile: { role: 'admin' } }],
        undefined: [
          { name: 'Bob', profile: null },
          { name: 'Charlie', profile: undefined },
        ],
      })
    })

    it('handles empty array', () => {
      const result = groupByPath([], 'role')
      expect(result).toEqual({})
    })

    it('converts numeric values to strings', () => {
      const items = [
        { id: 1, priority: 1 },
        { id: 2, priority: 2 },
        { id: 3, priority: 1 },
      ]

      const result = groupByPath(items, 'priority')

      expect(result).toEqual({
        '1': [
          { id: 1, priority: 1 },
          { id: 3, priority: 1 },
        ],
        '2': [{ id: 2, priority: 2 }],
      })
    })

    it('handles boolean values', () => {
      const items = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true },
      ]

      const result = groupByPath(items, 'active')

      expect(result).toEqual({
        true: [
          { id: 1, active: true },
          { id: 3, active: true },
        ],
        false: [{ id: 2, active: false }],
      })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const users = [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' },
      ]

      const result = R.pipe(users, groupByPath('role'))

      expect(Object.keys(result).sort()).toEqual(['admin', 'user'])
    })

    it('chains with other operations', () => {
      const users = [
        { name: 'Alice', role: 'admin', active: true },
        { name: 'Bob', role: 'user', active: false },
        { name: 'Charlie', role: 'admin', active: true },
      ]

      const result = R.pipe(
        users,
        R.filter((u) => u.active),
        groupByPath('role')
      )

      expect(result).toEqual({
        admin: [
          { name: 'Alice', role: 'admin', active: true },
          { name: 'Charlie', role: 'admin', active: true },
        ],
      })
    })
  })

  describe('real-world scenarios', () => {
    it('groups API responses by nested status', () => {
      const orders = [
        { id: 1, payment: { status: 'paid' } },
        { id: 2, payment: { status: 'pending' } },
        { id: 3, payment: { status: 'paid' } },
      ]

      const byStatus = groupByPath(orders, 'payment.status')

      expect(byStatus.paid?.length).toBe(2)
      expect(byStatus.pending?.length).toBe(1)
    })

    it('groups GitHub-style events by repo and action', () => {
      const events = [
        { repo: { name: 'foo' }, type: 'push' },
        { repo: { name: 'bar' }, type: 'push' },
        { repo: { name: 'foo' }, type: 'push' },
      ]

      const byRepo = groupByPath(events, 'repo.name')

      expect(byRepo.foo?.length).toBe(2)
      expect(byRepo.bar?.length).toBe(1)
    })

    it('groups Stripe-style charges by customer email', () => {
      const charges = [
        { id: 'ch_1', customer: { email: 'alice@example.com' } },
        { id: 'ch_2', customer: { email: 'bob@example.com' } },
        { id: 'ch_3', customer: { email: 'alice@example.com' } },
      ]

      const byCustomer = groupByPath(charges, 'customer.email')

      expect(byCustomer['alice@example.com']?.length).toBe(2)
      expect(byCustomer['bob@example.com']?.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles objects with missing intermediate keys', () => {
      const items = [
        { id: 1, a: { b: { c: 'value1' } } },
        { id: 2, a: { b: null } }, // b is null, can't access c
        { id: 3, a: null }, // a is null
      ]

      const result = groupByPath(items, 'a.b.c')

      expect(result).toEqual({
        value1: [{ id: 1, a: { b: { c: 'value1' } } }],
        undefined: [
          { id: 2, a: { b: null } },
          { id: 3, a: null },
        ],
      })
    })

    it('handles complex nested structures', () => {
      const logs = [
        { timestamp: '2024-01-01', event: { user: { profile: { tier: 'premium' } } } },
        { timestamp: '2024-01-02', event: { user: { profile: { tier: 'free' } } } },
        { timestamp: '2024-01-03', event: { user: { profile: { tier: 'premium' } } } },
      ]

      const result = groupByPath(logs, 'event.user.profile.tier')

      expect(result.premium?.length).toBe(2)
      expect(result.free?.length).toBe(1)
    })
  })
})
