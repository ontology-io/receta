import { describe, it, expect } from 'bun:test'
import { compose, reverse, nullsFirst, nullsLast, withTiebreaker } from '../combinators'
import { ascending, descending } from '../basic'

describe('Compare.combinators', () => {
  describe('compose', () => {
    it('applies comparators in priority order', () => {
      interface Issue {
        status: string
        priority: number
        createdAt: Date
      }

      const issues: Issue[] = [
        { status: 'open', priority: 1, createdAt: new Date('2024-01-03') },
        { status: 'open', priority: 2, createdAt: new Date('2024-01-01') },
        { status: 'closed', priority: 1, createdAt: new Date('2024-01-02') },
        { status: 'open', priority: 1, createdAt: new Date('2024-01-04') }
      ]

      const statusOrder: Record<string, number> = { open: 0, closed: 1 }

      const sorted = [...issues].sort(
        compose(
          ascending(i => statusOrder[i.status]),
          ascending(i => i.priority),
          ascending(i => i.createdAt)
        )
      )

      // First by status (open), then by priority (1, 2), then by date
      expect(sorted[0]).toEqual(issues[0]) // open, priority 1, Jan 3
      expect(sorted[1]).toEqual(issues[3]) // open, priority 1, Jan 4
      expect(sorted[2]).toEqual(issues[1]) // open, priority 2, Jan 1
      expect(sorted[3]).toEqual(issues[2]) // closed, priority 1, Jan 2
    })

    it('handles single comparator', () => {
      const numbers = [3, 1, 2]
      const sorted = [...numbers].sort(compose(ascending(x => x)))
      expect(sorted).toEqual([1, 2, 3])
    })

    it('handles many comparators', () => {
      interface Record {
        a: number
        b: number
        c: number
        d: number
      }

      const records: Record[] = [
        { a: 1, b: 1, c: 1, d: 2 },
        { a: 1, b: 1, c: 1, d: 1 }
      ]

      const sorted = [...records].sort(
        compose(
          ascending(r => r.a),
          ascending(r => r.b),
          ascending(r => r.c),
          ascending(r => r.d)
        )
      )

      expect(sorted[0].d).toBe(1)
      expect(sorted[1].d).toBe(2)
    })

    it('returns 0 when all comparators return 0', () => {
      const items = [{ value: 1 }, { value: 1 }]
      const comparator = compose(
        ascending(x => x.value),
        ascending(x => x.value)
      )
      expect(comparator(items[0]!, items[1]!)).toBe(0)
    })
  })

  describe('reverse', () => {
    it('reverses ascending to descending', () => {
      const numbers = [1, 3, 2, 5, 4]
      const asc = ascending((x: number) => x)
      const desc = reverse(asc)

      const sorted = [...numbers].sort(desc)
      expect(sorted).toEqual([5, 4, 3, 2, 1])
    })

    it('reverses descending to ascending', () => {
      const numbers = [1, 3, 2, 5, 4]
      const desc = descending((x: number) => x)
      const asc = reverse(desc)

      const sorted = [...numbers].sort(asc)
      expect(sorted).toEqual([1, 2, 3, 4, 5])
    })

    it('reverses custom comparators', () => {
      interface User {
        name: string
        age: number
      }

      const users: User[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ]

      const youngFirst = ascending((u: User) => u.age)
      const oldFirst = reverse(youngFirst)

      const sorted = [...users].sort(oldFirst)
      expect(sorted.map(u => u.age)).toEqual([35, 30, 25])
    })

    it('handles equal values', () => {
      const numbers = [1, 1, 1]
      const comparator = reverse(ascending((x: number) => x))
      const sorted = [...numbers].sort(comparator)
      expect(sorted).toEqual([1, 1, 1])
    })
  })

  describe('nullsFirst', () => {
    it('places null values first', () => {
      const values: Array<number | null> = [3, null, 1, null, 2]
      const sorted = [...values].sort(nullsFirst(ascending(x => x ?? 0)))

      expect(sorted[0]).toBe(null)
      expect(sorted[1]).toBe(null)
      expect(sorted[2]).toBe(1)
      expect(sorted[3]).toBe(2)
      expect(sorted[4]).toBe(3)
    })

    it('places undefined values first', () => {
      interface Item {
        value: number | undefined
      }

      const items: Item[] = [
        { value: 3 },
        { value: undefined },
        { value: 1 },
        { value: undefined },
        { value: 2 }
      ]

      const sorted = [...items].sort(nullsFirst(ascending(x => x.value ?? 0)))

      expect(sorted[0]!.value).toBe(undefined)
      expect(sorted[1]!.value).toBe(undefined)
      expect(sorted[2]!.value).toBe(1)
      expect(sorted[3]!.value).toBe(2)
      expect(sorted[4]!.value).toBe(3)
    })

    it('handles mixed null and undefined', () => {
      interface Item {
        value: number | null | undefined
      }

      const items: Item[] = [
        { value: 3 },
        { value: null },
        { value: 1 },
        { value: undefined },
        { value: 2 }
      ]

      const sorted = [...items].sort(nullsFirst(ascending(x => x.value ?? 0)))

      // Both null and undefined should be at the start
      expect(sorted[0]!.value == null).toBe(true)
      expect(sorted[1]!.value == null).toBe(true)
      expect(sorted[2]!.value).toBe(1)
    })

    it('works with objects', () => {
      interface User {
        name: string
        lastLogin: Date | null
      }

      const users: User[] = [
        { name: 'Alice', lastLogin: new Date('2024-01-15') },
        { name: 'Bob', lastLogin: null },
        { name: 'Charlie', lastLogin: new Date('2024-01-10') },
        { name: 'Dave', lastLogin: null }
      ]

      const sorted = [...users].sort(
        nullsFirst(ascending(u => u.lastLogin ?? new Date(0)))
      )

      expect(sorted[0]!.name).toBe('Bob')
      expect(sorted[1]!.name).toBe('Dave')
      expect(sorted[2]!.name).toBe('Charlie')
      expect(sorted[3]!.name).toBe('Alice')
    })

    it('handles all null values', () => {
      const values: Array<number | null> = [null, null, null]
      const sorted = [...values].sort(nullsFirst(ascending(x => x ?? 0)))
      expect(sorted.every(v => v === null)).toBe(true)
    })

    it('handles no null values', () => {
      const values = [3, 1, 2]
      const sorted = [...values].sort(nullsFirst(ascending(x => x)))
      expect(sorted).toEqual([1, 2, 3])
    })
  })

  describe('nullsLast', () => {
    it('places null values last', () => {
      const values: Array<number | null> = [3, null, 1, null, 2]
      const sorted = [...values].sort(nullsLast(ascending(x => x ?? 0)))

      expect(sorted[0]).toBe(1)
      expect(sorted[1]).toBe(2)
      expect(sorted[2]).toBe(3)
      expect(sorted[3]).toBe(null)
      expect(sorted[4]).toBe(null)
    })

    it('places undefined values last', () => {
      const values: Array<number | undefined> = [3, undefined, 1, undefined, 2]
      const sorted = [...values].sort(nullsLast(ascending(x => x ?? 0)))

      expect(sorted[0]).toBe(1)
      expect(sorted[1]).toBe(2)
      expect(sorted[2]).toBe(3)
      expect(sorted[3]).toBe(undefined)
      expect(sorted[4]).toBe(undefined)
    })

    it('works with objects', () => {
      interface Product {
        name: string
        discount: number | null
      }

      const products: Product[] = [
        { name: 'Keyboard', discount: 10 },
        { name: 'Mouse', discount: null },
        { name: 'Monitor', discount: 20 },
        { name: 'Webcam', discount: null }
      ]

      const sorted = [...products].sort(
        nullsLast(descending(p => p.discount ?? 0))
      )

      expect(sorted[0]!.name).toBe('Monitor')
      expect(sorted[1]!.name).toBe('Keyboard')
      expect(sorted[2]!.name).toBe('Mouse')
      expect(sorted[3]!.name).toBe('Webcam')
    })

    it('handles all null values', () => {
      const values: Array<number | null> = [null, null, null]
      const sorted = [...values].sort(nullsLast(ascending(x => x ?? 0)))
      expect(sorted.every(v => v === null)).toBe(true)
    })

    it('handles no null values', () => {
      const values = [3, 1, 2]
      const sorted = [...values].sort(nullsLast(ascending(x => x)))
      expect(sorted).toEqual([1, 2, 3])
    })
  })

  describe('withTiebreaker', () => {
    it('uses tiebreaker when primary returns 0', () => {
      interface Player {
        name: string
        score: number
        level: number
      }

      const players: Player[] = [
        { name: 'Alice', score: 1000, level: 5 },
        { name: 'Bob', score: 1000, level: 3 },
        { name: 'Charlie', score: 800, level: 4 },
        { name: 'Dave', score: 1000, level: 7 }
      ]

      const sorted = [...players].sort(
        withTiebreaker(
          descending(p => p.score),
          descending(p => p.level)
        )
      )

      expect(sorted[0]!.name).toBe('Dave') // score 1000, level 7
      expect(sorted[1]!.name).toBe('Alice') // score 1000, level 5
      expect(sorted[2]!.name).toBe('Bob') // score 1000, level 3
      expect(sorted[3]!.name).toBe('Charlie') // score 800, level 4
    })

    it('does not use tiebreaker when primary differs', () => {
      interface Item {
        priority: number
        name: string
      }

      const items: Item[] = [
        { priority: 3, name: 'Z' },
        { priority: 1, name: 'A' },
        { priority: 2, name: 'M' }
      ]

      const sorted = [...items].sort(
        withTiebreaker(
          ascending(i => i.priority),
          descending(i => i.name)
        )
      )

      // Sorted by priority only since they all differ
      expect(sorted.map(i => i.priority)).toEqual([1, 2, 3])
    })

    it('handles equal values in both comparators', () => {
      const items = [
        { a: 1, b: 1 },
        { a: 1, b: 1 }
      ]

      const comparator = withTiebreaker(
        ascending(x => x.a),
        ascending(x => x.b)
      )

      expect(comparator(items[0]!, items[1]!)).toBe(0)
    })

    it('works with three levels using compose', () => {
      interface Task {
        status: number
        priority: number
        age: number
      }

      const tasks: Task[] = [
        { status: 1, priority: 2, age: 5 },
        { status: 1, priority: 2, age: 3 },
        { status: 1, priority: 1, age: 7 }
      ]

      const sorted = [...tasks].sort(
        compose(
          ascending(t => t.status),
          ascending(t => t.priority),
          ascending(t => t.age)
        )
      )

      expect(sorted[0]!.age).toBe(7) // priority 1
      expect(sorted[1]!.age).toBe(3) // priority 2, age 3
      expect(sorted[2]!.age).toBe(5) // priority 2, age 5
    })
  })
})
