import { describe, it, expect } from 'bun:test'
import { byDate, byNumber, byString, byBoolean } from '../typed'
import { reverse } from '../combinators'
import { compose } from '../combinators'

describe('Compare.typed', () => {
  describe('byDate', () => {
    it('sorts dates chronologically (earliest first)', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-10'),
        new Date('2024-01-20'),
        new Date('2024-01-05')
      ]

      const sorted = [...dates].sort(byDate(x => x))
      expect(sorted[0]).toEqual(new Date('2024-01-05'))
      expect(sorted[3]).toEqual(new Date('2024-01-20'))
    })

    it('sorts objects by date property', () => {
      interface Event {
        name: string
        occurredAt: Date
      }

      const events: Event[] = [
        { name: 'Meeting', occurredAt: new Date('2024-01-15') },
        { name: 'Launch', occurredAt: new Date('2024-01-10') },
        { name: 'Review', occurredAt: new Date('2024-01-20') }
      ]

      const sorted = [...events].sort(byDate(e => e.occurredAt))
      expect(sorted.map(e => e.name)).toEqual(['Launch', 'Meeting', 'Review'])
    })

    it('handles same dates', () => {
      const date = new Date('2024-01-15')
      const dates = [date, new Date(date), new Date(date)]

      const sorted = [...dates].sort(byDate(x => x))
      expect(sorted.length).toBe(3)
      expect(sorted.every(d => d.getTime() === date.getTime())).toBe(true)
    })

    it('works with reverse for descending (most recent first)', () => {
      interface Transaction {
        amount: number
        date: Date
      }

      const transactions: Transaction[] = [
        { amount: 100, date: new Date('2024-01-01') },
        { amount: 200, date: new Date('2024-01-03') },
        { amount: 150, date: new Date('2024-01-02') }
      ]

      const sorted = [...transactions].sort(reverse(byDate(t => t.date)))
      expect(sorted.map(t => t.amount)).toEqual([200, 150, 100])
    })
  })

  describe('byNumber', () => {
    it('sorts numbers in ascending order', () => {
      const numbers = [45.2, 78.9, 23.1, 56.4]
      const sorted = [...numbers].sort(byNumber(x => x))
      expect(sorted).toEqual([23.1, 45.2, 56.4, 78.9])
    })

    it('sorts objects by numeric property', () => {
      interface Metric {
        name: string
        value: number
      }

      const metrics: Metric[] = [
        { name: 'CPU', value: 45.2 },
        { name: 'Memory', value: 78.9 },
        { name: 'Disk', value: 23.1 }
      ]

      const sorted = [...metrics].sort(byNumber(m => m.value))
      expect(sorted.map(m => m.name)).toEqual(['Disk', 'CPU', 'Memory'])
    })

    it('handles negative numbers', () => {
      const numbers = [1.5, -2.3, 0.8, -5.1]
      const sorted = [...numbers].sort(byNumber(x => x))
      expect(sorted).toEqual([-5.1, -2.3, 0.8, 1.5])
    })

    it('handles zero', () => {
      const numbers = [1, 0, -1, 0, 2]
      const sorted = [...numbers].sort(byNumber(x => x))
      expect(sorted).toEqual([-1, 0, 0, 1, 2])
    })

    it('handles NaN by placing it last', () => {
      const numbers = [3, NaN, 1, NaN, 2]
      const sorted = [...numbers].sort(byNumber(x => x))

      expect(sorted[0]).toBe(1)
      expect(sorted[1]).toBe(2)
      expect(sorted[2]).toBe(3)
      expect(Number.isNaN(sorted[3])).toBe(true)
      expect(Number.isNaN(sorted[4])).toBe(true)
    })

    it('handles Infinity', () => {
      const numbers = [100, Infinity, -Infinity, 0]
      const sorted = [...numbers].sort(byNumber(x => x))
      expect(sorted).toEqual([-Infinity, 0, 100, Infinity])
    })

    it('handles all same numbers', () => {
      const numbers = [42, 42, 42]
      const sorted = [...numbers].sort(byNumber(x => x))
      expect(sorted).toEqual([42, 42, 42])
    })

    it('works with reverse for descending order', () => {
      const numbers = [1, 3, 2, 5, 4]
      const sorted = [...numbers].sort(reverse(byNumber(x => x)))
      expect(sorted).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('byString', () => {
    it('sorts strings in ascending order (case-sensitive by default)', () => {
      const strings = ['banana', 'Apple', 'cherry', 'apple']
      const sorted = [...strings].sort(byString(x => x))

      // Uppercase comes first in default sorting
      expect(sorted[0]).toBe('Apple')
      expect(sorted).toContain('apple')
      expect(sorted).toContain('banana')
      expect(sorted).toContain('cherry')
    })

    it('sorts case-insensitively when specified', () => {
      const strings = ['banana', 'Apple', 'cherry', 'apple']
      const sorted = [...strings].sort(byString(x => x, { caseSensitive: false }))

      // Should ignore case
      const lowerSorted = sorted.map(s => s.toLowerCase())
      expect(lowerSorted).toEqual(['apple', 'apple', 'banana', 'cherry'])
    })

    it('sorts objects by string property', () => {
      interface User {
        firstName: string
        lastName: string
      }

      const users: User[] = [
        { firstName: 'Charlie', lastName: 'Smith' },
        { firstName: 'Alice', lastName: 'Jones' },
        { firstName: 'Bob', lastName: 'Adams' }
      ]

      const sorted = [...users].sort(byString(u => u.firstName))
      expect(sorted.map(u => u.firstName)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('handles locale-aware sorting', () => {
      const names = ['Müller', 'Mueller', 'Möller']

      // Without locale, might not sort correctly
      const defaultSorted = [...names].sort(byString(x => x))

      // With German locale
      const localeSorted = [...names].sort(byString(x => x, { locale: 'de-DE' }))

      // Just verify it sorts them (exact order depends on locale implementation)
      expect(localeSorted.length).toBe(3)
    })

    it('handles empty strings', () => {
      const strings = ['b', '', 'a', '']
      const sorted = [...strings].sort(byString(x => x))

      expect(sorted[0]).toBe('')
      expect(sorted[1]).toBe('')
    })

    it('handles special characters', () => {
      const strings = ['#tag', '@mention', '!important']
      const sorted = [...strings].sort(byString(x => x))
      expect(sorted.length).toBe(3)
    })

    it('combines case-insensitive and locale options', () => {
      interface Name {
        value: string
      }

      const names: Name[] = [
        { value: 'ALICE' },
        { value: 'bob' },
        { value: 'Charlie' }
      ]

      const sorted = [...names].sort(
        byString(n => n.value, { caseSensitive: false, locale: 'en-US' })
      )

      const values = sorted.map(n => n.value.toLowerCase())
      expect(values).toEqual(['alice', 'bob', 'charlie'])
    })
  })

  describe('byBoolean', () => {
    it('sorts with false before true', () => {
      const bools = [true, false, true, false]
      const sorted = [...bools].sort(byBoolean(x => x))
      expect(sorted).toEqual([false, false, true, true])
    })

    it('sorts objects by boolean property (incomplete first)', () => {
      interface Task {
        title: string
        completed: boolean
      }

      const tasks: Task[] = [
        { title: 'Review PR', completed: true },
        { title: 'Fix bug', completed: false },
        { title: 'Write docs', completed: false },
        { title: 'Deploy', completed: true }
      ]

      const sorted = [...tasks].sort(byBoolean(t => t.completed))
      expect(sorted.map(t => t.completed)).toEqual([false, false, true, true])
    })

    it('works with reverse for true-first sorting', () => {
      interface Task {
        urgent: boolean
        title: string
      }

      const tasks: Task[] = [
        { urgent: false, title: 'Review' },
        { urgent: true, title: 'Fix' },
        { urgent: false, title: 'Docs' },
        { urgent: true, title: 'Deploy' }
      ]

      const sorted = [...tasks].sort(reverse(byBoolean(t => t.urgent)))
      expect(sorted.map(t => t.urgent)).toEqual([true, true, false, false])
    })

    it('handles all true values', () => {
      const bools = [true, true, true]
      const sorted = [...bools].sort(byBoolean(x => x))
      expect(sorted).toEqual([true, true, true])
    })

    it('handles all false values', () => {
      const bools = [false, false, false]
      const sorted = [...bools].sort(byBoolean(x => x))
      expect(sorted).toEqual([false, false, false])
    })

    it('works in multi-level sorting', () => {
      interface Task {
        completed: boolean
        urgent: boolean
        title: string
      }

      const tasks: Task[] = [
        { completed: true, urgent: false, title: 'A' },
        { completed: false, urgent: true, title: 'B' },
        { completed: false, urgent: false, title: 'C' },
        { completed: true, urgent: true, title: 'D' }
      ]

      // Incomplete first, then urgent first
      const sorted = [...tasks].sort(
        compose(
          byBoolean(t => t.completed),
          reverse(byBoolean(t => t.urgent))
        )
      )

      expect(sorted[0]!.title).toBe('B') // incomplete, urgent
      expect(sorted[1]!.title).toBe('C') // incomplete, not urgent
      expect(sorted[2]!.title).toBe('D') // complete, urgent
      expect(sorted[3]!.title).toBe('A') // complete, not urgent
    })
  })
})
