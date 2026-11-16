import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { diff } from '../diff'

describe('Collection.diff', () => {
  describe('data-first', () => {
    it('detects added items', () => {
      const old = [{ id: 1, name: 'Alice' }]
      const updated = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual([{ id: 2, name: 'Bob' }])
      expect(result.updated).toEqual([])
      expect(result.removed).toEqual([])
      expect(result.unchanged).toEqual([{ id: 1, name: 'Alice' }])
    })

    it('detects removed items', () => {
      const old = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const updated = [{ id: 1, name: 'Alice' }]

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual([])
      expect(result.updated).toEqual([])
      expect(result.removed).toEqual([{ id: 2, name: 'Bob' }])
      expect(result.unchanged).toEqual([{ id: 1, name: 'Alice' }])
    })

    it('detects updated items', () => {
      const old = [{ id: 1, name: 'Alice' }]
      const updated = [{ id: 1, name: 'Alicia' }]

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual([])
      expect(result.updated).toEqual([
        {
          old: { id: 1, name: 'Alice' },
          new: { id: 1, name: 'Alicia' },
        },
      ])
      expect(result.removed).toEqual([])
      expect(result.unchanged).toEqual([])
    })

    it('detects all types of changes', () => {
      const old = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]
      const updated = [
        { id: 1, name: 'Alicia' }, // updated
        { id: 2, name: 'Bob' }, // unchanged
        { id: 4, name: 'David' }, // added
      ]
      // id: 3 removed

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual([{ id: 4, name: 'David' }])
      expect(result.updated).toEqual([
        {
          old: { id: 1, name: 'Alice' },
          new: { id: 1, name: 'Alicia' },
        },
      ])
      expect(result.removed).toEqual([{ id: 3, name: 'Charlie' }])
      expect(result.unchanged).toEqual([{ id: 2, name: 'Bob' }])
    })

    it('uses custom equality checker', () => {
      const old = [{ id: 1, name: 'Alice', version: 1 }]
      const updated = [{ id: 1, name: 'Alice', version: 2 }]

      // Only compare name, ignore version
      const result = diff(
        old,
        updated,
        (u) => u.id,
        (a, b) => a.name === b.name
      )

      expect(result.unchanged).toEqual([{ id: 1, name: 'Alice', version: 2 }])
      expect(result.updated).toEqual([])
    })

    it('handles empty arrays', () => {
      const result = diff([], [], (u: { id: number }) => u.id)

      expect(result).toEqual({
        added: [],
        updated: [],
        removed: [],
        unchanged: [],
      })
    })

    it('handles all items added', () => {
      const old: Array<{ id: number; name: string }> = []
      const updated = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual(updated)
      expect(result.updated).toEqual([])
      expect(result.removed).toEqual([])
      expect(result.unchanged).toEqual([])
    })

    it('handles all items removed', () => {
      const old = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const updated: Array<{ id: number; name: string }> = []

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual([])
      expect(result.updated).toEqual([])
      expect(result.removed).toEqual(old)
      expect(result.unchanged).toEqual([])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const old = [{ id: 1, name: 'Alice' }]
      const updated = [{ id: 1, name: 'Alicia' }]

      const result = R.pipe(old, diff(updated, (u) => u.id))

      expect(result.updated.length).toBe(1)
      expect(result.updated[0]?.old.name).toBe('Alice')
      expect(result.updated[0]?.new.name).toBe('Alicia')
    })
  })

  describe('edge cases', () => {
    it('handles string IDs', () => {
      const old = [{ id: 'user_1', name: 'Alice' }]
      const updated = [{ id: 'user_2', name: 'Bob' }]

      const result = diff(old, updated, (u) => u.id)

      expect(result.added).toEqual([{ id: 'user_2', name: 'Bob' }])
      expect(result.removed).toEqual([{ id: 'user_1', name: 'Alice' }])
    })

    it('handles nested object changes', () => {
      const old = [{ id: 1, profile: { age: 25, city: 'NYC' } }]
      const updated = [{ id: 1, profile: { age: 26, city: 'NYC' } }]

      const result = diff(old, updated, (u) => u.id)

      expect(result.updated.length).toBe(1)
      expect(result.updated[0]?.old.profile.age).toBe(25)
      expect(result.updated[0]?.new.profile.age).toBe(26)
    })

    it('preserves order of items', () => {
      const old = [
        { id: 3, name: 'C' },
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]
      const updated = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
      ]

      const result = diff(old, updated, (u) => u.id)

      expect(result.unchanged.map((u) => u.id)).toEqual([1, 2, 3])
    })

    it('keeps the order of the lists, not the numeric order of the ids', () => {
      type Row = { id: number | string; v?: number }
      const old: Row[] = [{ id: 30 }, { id: 4 }, { id: 'z' }, { id: 7, v: 1 }, { id: 5 }]
      const updated: Row[] = [{ id: 10 }, { id: 5 }, { id: 2 }, { id: 'b' }, { id: 7, v: 2 }, { id: 1 }, { id: 'z' }]

      const result = diff(old, updated, (row) => row.id)

      expect(result.added.map((row) => row.id)).toEqual([10, 2, 'b', 1])
      expect(result.removed.map((row) => row.id)).toEqual([30, 4])
      expect(result.unchanged.map((row) => row.id)).toEqual([5, 'z'])
      expect(result.updated.map((pair) => pair.new.id)).toEqual([7])
    })

    it('keeps falsy items', () => {
      expect(diff([0, 1, 2], [0, 2, 3], (n) => n)).toEqual({
        added: [3],
        updated: [],
        removed: [1],
        unchanged: [0, 2],
      })
      expect(diff([''], ['', 'a'], (text) => text)).toEqual({
        added: ['a'],
        updated: [],
        removed: [],
        unchanged: [''],
      })
      expect(diff([0, false], [null], (item) => String(item))).toEqual({
        added: [null],
        updated: [],
        removed: [0, false],
        unchanged: [],
      })
    })

    it('reports a falsy item as updated when it is not equal', () => {
      const never = () => false

      expect(diff([0], [0], (n) => n, never)).toEqual({
        added: [],
        updated: [{ old: 0, new: 0 }],
        removed: [],
        unchanged: [],
      })
    })

    it('treats the id 1 and the id "1" as the same item', () => {
      const result = diff([{ id: 1 as number | string }], [{ id: '1' as number | string }], (row) => row.id)

      expect(result.added).toEqual([])
      expect(result.removed).toEqual([])
      expect(result.updated).toEqual([{ old: { id: 1 }, new: { id: '1' } }])
    })

    it('keeps the last item when a list repeats an id', () => {
      const result = diff([], [{ id: 1, v: 'first' }, { id: 2, v: 'only' }, { id: 1, v: 'last' }], (row) => row.id)

      expect(result.added).toEqual([{ id: 1, v: 'last' }, { id: 2, v: 'only' }])
    })

    it('reads ids named like object members', () => {
      const result = diff([{ id: 'constructor' }], [{ id: 'toString' }, { id: '__proto__' }], (row) => row.id)

      expect(result.added.map((row) => row.id)).toEqual(['toString', '__proto__'])
      expect(result.removed.map((row) => row.id)).toEqual(['constructor'])
    })
  })
})
