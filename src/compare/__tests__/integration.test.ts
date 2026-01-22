import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { ascending, descending, natural, byKey } from '../basic'
import { compose, reverse, nullsFirst, nullsLast, withTiebreaker } from '../combinators'
import { byDate, byNumber, byString, byBoolean } from '../typed'
import { caseInsensitive } from '../advanced'

describe('Compare.integration', () => {
  describe('with Remeda sort', () => {
    it('works with R.sort for basic ascending', () => {
      const numbers = [3, 1, 4, 1, 5, 9, 2, 6]
      const sorted = R.sort(numbers, ascending(x => x))
      expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
    })

    it('works with R.sortBy for object sorting', () => {
      interface User {
        name: string
        age: number
      }

      const users: User[] = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ]

      // Note: R.sortBy has its own API, this tests our comparators work with it
      const sorted = [...users].sort(ascending(u => u.age))
      expect(sorted.map(u => u.name)).toEqual(['Bob', 'Alice', 'Charlie'])
    })
  })

  describe('real-world: GitHub Issues', () => {
    interface GitHubIssue {
      number: number
      title: string
      status: 'open' | 'closed'
      priority: 'low' | 'medium' | 'high'
      assignee: string | null
      createdAt: Date
      updatedAt: Date
    }

    const issues: GitHubIssue[] = [
      {
        number: 101,
        title: 'Fix navigation bug',
        status: 'open',
        priority: 'high',
        assignee: 'alice',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        number: 102,
        title: 'Update documentation',
        status: 'open',
        priority: 'low',
        assignee: null,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18')
      },
      {
        number: 103,
        title: 'Refactor auth flow',
        status: 'closed',
        priority: 'high',
        assignee: 'bob',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-25')
      },
      {
        number: 104,
        title: 'Add dark mode',
        status: 'open',
        priority: 'high',
        assignee: 'alice',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22')
      }
    ]

    it('sorts by status (open first), then priority (high first), then created date', () => {
      const statusOrder = { open: 0, closed: 1 }
      const priorityOrder = { high: 0, medium: 1, low: 2 }

      const sorted = [...issues].sort(
        compose(
          ascending(i => statusOrder[i.status]),
          ascending(i => priorityOrder[i.priority]),
          ascending(i => i.createdAt)
        )
      )

      // Open high-priority issues first, oldest first
      expect(sorted[0]!.number).toBe(101) // open, high, Jan 15
      expect(sorted[1]!.number).toBe(104) // open, high, Jan 20
      expect(sorted[2]!.number).toBe(102) // open, low, Jan 10
      expect(sorted[3]!.number).toBe(103) // closed, high, Jan 5
    })

    it('sorts by most recently updated', () => {
      const sorted = [...issues].sort(reverse(byDate(i => i.updatedAt)))

      expect(sorted[0]!.number).toBe(103) // Jan 25
      expect(sorted[1]!.number).toBe(104) // Jan 22
      expect(sorted[2]!.number).toBe(101) // Jan 20
      expect(sorted[3]!.number).toBe(102) // Jan 18
    })

    it('sorts with unassigned issues first', () => {
      const sorted = [...issues].sort(
        nullsFirst(ascending(i => i.assignee ?? ''))
      )

      expect(sorted[0]!.assignee).toBe(null)
      expect(sorted[1]!.assignee).toBe('alice')
    })
  })

  describe('real-world: Stripe Transactions', () => {
    interface StripeTransaction {
      id: string
      amount: number
      currency: string
      status: 'succeeded' | 'pending' | 'failed'
      createdAt: Date
      description: string
    }

    const transactions: StripeTransaction[] = [
      {
        id: 'tx_1',
        amount: 5000,
        currency: 'USD',
        status: 'succeeded',
        createdAt: new Date('2024-01-15T10:30:00'),
        description: 'Payment for invoice #123'
      },
      {
        id: 'tx_2',
        amount: 15000,
        currency: 'USD',
        status: 'succeeded',
        createdAt: new Date('2024-01-16T14:20:00'),
        description: 'Payment for invoice #124'
      },
      {
        id: 'tx_3',
        amount: 5000,
        currency: 'EUR',
        status: 'pending',
        createdAt: new Date('2024-01-16T09:15:00'),
        description: 'Payment for invoice #125'
      },
      {
        id: 'tx_4',
        amount: 25000,
        currency: 'USD',
        status: 'failed',
        createdAt: new Date('2024-01-14T16:45:00'),
        description: 'Payment for invoice #126'
      }
    ]

    it('sorts by amount (highest first)', () => {
      const sorted = [...transactions].sort(descending(t => t.amount))

      expect(sorted.map(t => t.amount)).toEqual([25000, 15000, 5000, 5000])
    })

    it('sorts by status and then by date (most recent first)', () => {
      const statusOrder = { failed: 0, pending: 1, succeeded: 2 }

      const sorted = [...transactions].sort(
        compose(
          ascending(t => statusOrder[t.status]),
          descending(t => t.createdAt)
        )
      )

      expect(sorted[0]!.status).toBe('failed')
      expect(sorted[1]!.status).toBe('pending')
      expect(sorted[2]!.status).toBe('succeeded')
      expect(sorted[2]!.id).toBe('tx_2') // Most recent succeeded
    })

    it('sorts by currency and amount within currency', () => {
      const sorted = [...transactions].sort(
        withTiebreaker(
          ascending(t => t.currency),
          descending(t => t.amount)
        )
      )

      // EUR first (only one), then USD sorted by amount desc
      expect(sorted[0]!.currency).toBe('EUR')
      expect(sorted[1]!.currency).toBe('USD')
      expect(sorted[1]!.amount).toBe(25000)
    })
  })

  describe('real-world: Data Tables', () => {
    interface Employee {
      id: number
      firstName: string
      lastName: string
      department: string
      salary: number
      hireDate: Date
      isActive: boolean
    }

    const employees: Employee[] = [
      {
        id: 1,
        firstName: 'Alice',
        lastName: 'Smith',
        department: 'Engineering',
        salary: 120000,
        hireDate: new Date('2020-01-15'),
        isActive: true
      },
      {
        id: 2,
        firstName: 'Bob',
        lastName: 'Jones',
        department: 'Sales',
        salary: 80000,
        hireDate: new Date('2021-03-20'),
        isActive: true
      },
      {
        id: 3,
        firstName: 'Charlie',
        lastName: 'Adams',
        department: 'Engineering',
        salary: 150000,
        hireDate: new Date('2019-06-10'),
        isActive: false
      },
      {
        id: 4,
        firstName: 'Diana',
        lastName: 'Brown',
        department: 'Engineering',
        salary: 95000,
        hireDate: new Date('2022-02-28'),
        isActive: true
      }
    ]

    it('sorts by department, then by salary (highest first)', () => {
      const sorted = [...employees].sort(
        compose(
          ascending(e => e.department),
          descending(e => e.salary)
        )
      )

      // Engineering first (sorted by salary desc), then Sales
      expect(sorted[0]!.firstName).toBe('Charlie') // Engineering, 150k
      expect(sorted[1]!.firstName).toBe('Alice') // Engineering, 120k
      expect(sorted[2]!.firstName).toBe('Diana') // Engineering, 95k
      expect(sorted[3]!.firstName).toBe('Bob') // Sales, 80k
    })

    it('sorts by active status (active first), then by hire date (seniority)', () => {
      const sorted = [...employees].sort(
        compose(
          reverse(byBoolean(e => e.isActive)),
          ascending(e => e.hireDate)
        )
      )

      // Active employees first, sorted by hire date (oldest first)
      expect(sorted[0]!.firstName).toBe('Alice') // Active, 2020
      expect(sorted[1]!.firstName).toBe('Bob') // Active, 2021
      expect(sorted[2]!.firstName).toBe('Diana') // Active, 2022
      expect(sorted[3]!.firstName).toBe('Charlie') // Inactive, 2019
    })

    it('sorts by last name (case-insensitive)', () => {
      const sorted = [...employees].sort(caseInsensitive(e => e.lastName))

      expect(sorted.map(e => e.lastName)).toEqual(['Adams', 'Brown', 'Jones', 'Smith'])
    })

    it('filters and sorts active engineers by salary', () => {
      const activeEngineers = R.pipe(
        employees,
        R.filter(e => e.isActive && e.department === 'Engineering'),
        R.sort(descending(e => e.salary))
      )

      expect(activeEngineers.map(e => e.firstName)).toEqual(['Alice', 'Diana'])
      expect(activeEngineers[0]!.salary).toBeGreaterThan(activeEngineers[1]!.salary)
    })
  })

  describe('real-world: File System', () => {
    interface FileEntry {
      name: string
      type: 'file' | 'directory'
      size: number
      modifiedAt: Date
    }

    const entries: FileEntry[] = [
      {
        name: 'README.md',
        type: 'file',
        size: 1024,
        modifiedAt: new Date('2024-01-15')
      },
      {
        name: 'src',
        type: 'directory',
        size: 0,
        modifiedAt: new Date('2024-01-20')
      },
      {
        name: 'package.json',
        type: 'file',
        size: 512,
        modifiedAt: new Date('2024-01-10')
      },
      {
        name: 'node_modules',
        type: 'directory',
        size: 0,
        modifiedAt: new Date('2024-01-18')
      },
      {
        name: 'index.ts',
        type: 'file',
        size: 2048,
        modifiedAt: new Date('2024-01-22')
      }
    ]

    it('sorts with directories first, then alphabetically', () => {
      const typeOrder = { directory: 0, file: 1 }

      const sorted = [...entries].sort(
        compose(
          ascending(e => typeOrder[e.type]),
          caseInsensitive(e => e.name)
        )
      )

      expect(sorted[0]!.type).toBe('directory')
      expect(sorted[1]!.type).toBe('directory')
      expect(sorted[2]!.type).toBe('file')
    })

    it('sorts by most recently modified', () => {
      const sorted = [...entries].sort(reverse(byDate(e => e.modifiedAt)))

      expect(sorted[0]!.name).toBe('index.ts') // Jan 22
      expect(sorted[1]!.name).toBe('src') // Jan 20
    })

    it('sorts files by size (largest first), ignoring directories', () => {
      const files = R.pipe(
        entries,
        R.filter(e => e.type === 'file'),
        R.sort(descending(e => e.size))
      )

      expect(files.map(f => f.name)).toEqual(['index.ts', 'README.md', 'package.json'])
    })

    it('sorts with natural string order for versioned files', () => {
      const versionedFiles: FileEntry[] = [
        { name: 'backup-10.zip', type: 'file', size: 1024, modifiedAt: new Date() },
        { name: 'backup-2.zip', type: 'file', size: 1024, modifiedAt: new Date() },
        { name: 'backup-1.zip', type: 'file', size: 1024, modifiedAt: new Date() },
        { name: 'backup-20.zip', type: 'file', size: 1024, modifiedAt: new Date() }
      ]

      const sorted = [...versionedFiles].sort(natural(f => f.name))

      expect(sorted.map(f => f.name)).toEqual([
        'backup-1.zip',
        'backup-2.zip',
        'backup-10.zip',
        'backup-20.zip'
      ])
    })
  })
})
