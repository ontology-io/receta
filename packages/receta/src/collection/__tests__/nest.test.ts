import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { nest } from '../nest'

describe('Collection.nest', () => {
  describe('data-first', () => {
    it('nests items by single key', () => {
      const items = [
        { userId: 1, text: 'Hello' },
        { userId: 2, text: 'World' },
        { userId: 1, text: 'Foo' },
      ]

      const result = nest(items, ['userId'])

      expect(result).toEqual({
        '1': [
          { userId: 1, text: 'Hello' },
          { userId: 1, text: 'Foo' },
        ],
        '2': [{ userId: 2, text: 'World' }],
      })
    })

    it('nests items by multiple keys', () => {
      const items = [
        { userId: 1, postId: 10, text: 'Hello' },
        { userId: 1, postId: 10, text: 'World' },
        { userId: 1, postId: 20, text: 'Foo' },
        { userId: 2, postId: 10, text: 'Bar' },
      ]

      const result = nest(items, ['userId', 'postId'])

      expect(result).toEqual({
        '1': {
          '10': [
            { userId: 1, postId: 10, text: 'Hello' },
            { userId: 1, postId: 10, text: 'World' },
          ],
          '20': [{ userId: 1, postId: 20, text: 'Foo' }],
        },
        '2': {
          '10': [{ userId: 2, postId: 10, text: 'Bar' }],
        },
      })
    })

    it('nests items with function selectors', () => {
      const items = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 25 },
      ]

      const result = nest(items, [(item) => (item.age >= 30 ? 'senior' : 'junior')])

      expect(result).toEqual({
        junior: [
          { name: 'Alice', age: 25 },
          { name: 'Charlie', age: 25 },
        ],
        senior: [{ name: 'Bob', age: 30 }],
      })
    })

    it('handles empty array', () => {
      const result = nest([], ['userId'])
      expect(result).toEqual({})
    })

    it('handles empty keys array', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const result = nest(items, [])
      expect(result).toEqual(items)
    })

    it('nests with three levels', () => {
      const items = [
        { category: 'food', subcategory: 'fruit', item: 'apple' },
        { category: 'food', subcategory: 'fruit', item: 'banana' },
        { category: 'food', subcategory: 'vegetable', item: 'carrot' },
        { category: 'electronics', subcategory: 'phone', item: 'iphone' },
      ]

      const result = nest(items, ['category', 'subcategory'])

      expect(result).toEqual({
        food: {
          fruit: [
            { category: 'food', subcategory: 'fruit', item: 'apple' },
            { category: 'food', subcategory: 'fruit', item: 'banana' },
          ],
          vegetable: [{ category: 'food', subcategory: 'vegetable', item: 'carrot' }],
        },
        electronics: {
          phone: [{ category: 'electronics', subcategory: 'phone', item: 'iphone' }],
        },
      })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const items = [
        { userId: 1, text: 'Hello' },
        { userId: 2, text: 'World' },
      ]

      const result = R.pipe(items, nest(['userId']))

      expect(result).toEqual({
        '1': [{ userId: 1, text: 'Hello' }],
        '2': [{ userId: 2, text: 'World' }],
      })
    })

    it('chains with other operations', () => {
      const items = [
        { userId: 1, active: true, text: 'Hello' },
        { userId: 2, active: false, text: 'World' },
        { userId: 1, active: true, text: 'Foo' },
      ]

      const result = R.pipe(
        items,
        R.filter((item) => item.active),
        nest(['userId'])
      )

      expect(result).toEqual({
        '1': [
          { userId: 1, active: true, text: 'Hello' },
          { userId: 1, active: true, text: 'Foo' },
        ],
      })
    })
  })

  describe('edge cases', () => {
    it('handles numeric keys', () => {
      const items = [
        { priority: 1, task: 'urgent' },
        { priority: 2, task: 'normal' },
        { priority: 1, task: 'critical' },
      ]

      const result = nest(items, ['priority'])

      expect(result).toEqual({
        '1': [
          { priority: 1, task: 'urgent' },
          { priority: 1, task: 'critical' },
        ],
        '2': [{ priority: 2, task: 'normal' }],
      })
    })

    it('handles mixed key types', () => {
      const items = [
        { type: 'user', id: 1, name: 'Alice' },
        { type: 'post', id: 1, title: 'Hello' },
        { type: 'user', id: 2, name: 'Bob' },
      ]

      const result = nest(items, ['type', 'id'])

      expect(result).toEqual({
        user: {
          '1': [{ type: 'user', id: 1, name: 'Alice' }],
          '2': [{ type: 'user', id: 2, name: 'Bob' }],
        },
        post: {
          '1': [{ type: 'post', id: 1, title: 'Hello' }],
        },
      })
    })
  })
})
