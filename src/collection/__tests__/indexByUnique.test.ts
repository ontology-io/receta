import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { indexByUnique } from '../indexByUnique'
import { isOk, isErr } from '../../result'

describe('Collection.indexByUnique', () => {
  describe('data-first', () => {
    it('creates index from unique keys', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]

      const result = indexByUnique(users, (u) => u.id)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual({
          1: { id: 1, name: 'Alice' },
          2: { id: 2, name: 'Bob' },
        })
      }
    })

    it('returns error on duplicate keys by default', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 1, name: 'Alicia' },
      ]

      const result = indexByUnique(users, (u) => u.id)

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.name).toBe('DuplicateKeyError')
        expect(result.error.key).toBe(1)
      }
    })

    it('keeps first item on collision with "first" strategy', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 1, name: 'Alicia' },
        { id: 2, name: 'Bob' },
      ]

      const result = indexByUnique(users, (u) => u.id, { onCollision: 'first' })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value[1]?.name).toBe('Alice')
        expect(result.value[2]?.name).toBe('Bob')
      }
    })

    it('keeps last item on collision with "last" strategy', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 1, name: 'Alicia' },
        { id: 2, name: 'Bob' },
      ]

      const result = indexByUnique(users, (u) => u.id, { onCollision: 'last' })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value[1]?.name).toBe('Alicia')
        expect(result.value[2]?.name).toBe('Bob')
      }
    })

    it('handles string keys', () => {
      const users = [
        { email: 'alice@example.com', name: 'Alice' },
        { email: 'bob@example.com', name: 'Bob' },
      ]

      const result = indexByUnique(users, (u) => u.email)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value['alice@example.com']?.name).toBe('Alice')
      }
    })

    it('handles empty array', () => {
      const result = indexByUnique([], (u: { id: number }) => u.id)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual({})
      }
    })

    it('handles single item', () => {
      const result = indexByUnique([{ id: 1, name: 'Alice' }], (u) => u.id)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual({
          1: { id: 1, name: 'Alice' },
        })
      }
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]

      const result = R.pipe(users, indexByUnique((u) => u.id))

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(Object.keys(result.value).length).toBe(2)
      }
    })

    it('chains with other operations', () => {
      const users = [
        { id: 1, name: 'Alice', active: true },
        { id: 2, name: 'Bob', active: false },
        { id: 3, name: 'Charlie', active: true },
      ]

      const result = R.pipe(
        users,
        R.filter((u) => u.active),
        indexByUnique((u) => u.id)
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(Object.keys(result.value).length).toBe(2)
        expect(result.value[1]?.name).toBe('Alice')
        expect(result.value[3]?.name).toBe('Charlie')
      }
    })
  })

  describe('edge cases', () => {
    it('handles multiple duplicates', () => {
      const items = [
        { id: 1, value: 'A' },
        { id: 1, value: 'B' },
        { id: 1, value: 'C' },
      ]

      const resultError = indexByUnique(items, (i) => i.id)
      expect(isErr(resultError)).toBe(true)

      const resultFirst = indexByUnique(items, (i) => i.id, { onCollision: 'first' })
      expect(isOk(resultFirst)).toBe(true)
      if (isOk(resultFirst)) {
        expect(resultFirst.value[1]?.value).toBe('A')
      }

      const resultLast = indexByUnique(items, (i) => i.id, { onCollision: 'last' })
      expect(isOk(resultLast)).toBe(true)
      if (isOk(resultLast)) {
        expect(resultLast.value[1]?.value).toBe('C')
      }
    })

    it('preserves all unique keys when some are duplicates', () => {
      const items = [
        { id: 1, value: 'A' },
        { id: 2, value: 'B' },
        { id: 2, value: 'C' },
        { id: 3, value: 'D' },
      ]

      const result = indexByUnique(items, (i) => i.id, { onCollision: 'last' })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(Object.keys(result.value).length).toBe(3)
        expect(result.value[1]?.value).toBe('A')
        expect(result.value[2]?.value).toBe('C')
        expect(result.value[3]?.value).toBe('D')
      }
    })

    it('works with complex objects', () => {
      const posts = [
        { id: 1, title: 'Hello', author: { id: 10, name: 'Alice' } },
        { id: 2, title: 'World', author: { id: 20, name: 'Bob' } },
      ]

      const result = indexByUnique(posts, (p) => p.id)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value[1]?.author.name).toBe('Alice')
      }
    })
  })

  describe('real-world scenarios', () => {
    it('normalizes API response', () => {
      const apiResponse = [
        { id: 'user_1', name: 'Alice', email: 'alice@example.com' },
        { id: 'user_2', name: 'Bob', email: 'bob@example.com' },
        { id: 'user_3', name: 'Charlie', email: 'charlie@example.com' },
      ]

      const result = indexByUnique(apiResponse, (u) => u.id)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        // Fast O(1) lookup
        const user = result.value['user_2']
        expect(user?.name).toBe('Bob')
      }
    })

    it('handles deduplication of user events', () => {
      const events = [
        { eventId: 'evt_1', userId: 1, action: 'login' },
        { eventId: 'evt_2', userId: 2, action: 'view' },
        { eventId: 'evt_1', userId: 1, action: 'login' }, // duplicate
      ]

      // Keep first occurrence
      const result = indexByUnique(events, (e) => e.eventId, { onCollision: 'first' })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(Object.keys(result.value).length).toBe(2)
      }
    })
  })
})
