/**
 * Compare Module Usage Examples
 *
 * Run with: bun run examples/compare-usage.ts
 */

import * as R from 'remeda'
import {
  ascending,
  descending,
  natural,
  byKey,
  compose,
  reverse,
  nullsFirst,
  nullsLast,
  withTiebreaker,
  byDate,
  byNumber,
  byString,
  byBoolean,
  caseInsensitive,
  type Comparator
} from '@ontologyio/receta/compare'

console.log('=== Example 1: Basic Sorting ===\n')

const numbers = [42, 7, 23, 100, 8]
console.log('Original:', numbers)
console.log('Ascending:', [...numbers].sort(ascending(x => x)))
console.log('Descending:', [...numbers].sort(descending(x => x)))

console.log('\n=== Example 2: Sorting Objects by Property ===\n')

interface Product {
  name: string
  price: number
  stock: number
}

const products: Product[] = [
  { name: 'Keyboard', price: 80, stock: 15 },
  { name: 'Mouse', price: 25, stock: 30 },
  { name: 'Monitor', price: 300, stock: 5 },
  { name: 'Webcam', price: 120, stock: 0 }
]

console.log('Sorted by price (lowest first):')
console.log([...products].sort(ascending(p => p.price)).map(p => `${p.name}: $${p.price}`))

console.log('\nSorted by stock (highest first):')
console.log([...products].sort(descending(p => p.stock)).map(p => `${p.name}: ${p.stock} units`))

console.log('\nUsing byKey for direct property access:')
console.log([...products].sort(byKey('name')).map(p => p.name))

console.log('\n=== Example 3: Natural String Sorting ===\n')

const files = ['file10.txt', 'file2.txt', 'file1.txt', 'file20.txt', 'file100.txt']
console.log('Lexicographic sort (incorrect):', [...files].sort())
console.log('Natural sort (correct):', [...files].sort(natural(x => x)))

const versions = ['v1.10.0', 'v1.2.0', 'v1.20.0', 'v1.9.0', 'v2.0.0']
console.log('\nVersion numbers (natural sort):', [...versions].sort(natural(x => x)))

console.log('\n=== Example 4: Multi-Level Sorting with compose() ===\n')

interface GitHubIssue {
  number: number
  title: string
  status: 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

const issues: GitHubIssue[] = [
  { number: 101, title: 'Fix bug', status: 'open', priority: 'high', createdAt: new Date('2024-01-15') },
  { number: 102, title: 'Update docs', status: 'open', priority: 'low', createdAt: new Date('2024-01-10') },
  { number: 103, title: 'Refactor auth', status: 'closed', priority: 'high', createdAt: new Date('2024-01-05') },
  { number: 104, title: 'Add feature', status: 'open', priority: 'high', createdAt: new Date('2024-01-20') }
]

// Sort by: status (open first), then priority (high first), then created date (oldest first)
const statusOrder = { open: 0, closed: 1 }
const priorityOrder = { high: 0, medium: 1, low: 2 }

const sortedIssues = [...issues].sort(
  compose(
    ascending(i => statusOrder[i.status]),
    ascending(i => priorityOrder[i.priority]),
    ascending(i => i.createdAt)
  )
)

console.log('GitHub Issues (status → priority → date):')
sortedIssues.forEach(i => {
  console.log(`#${i.number}: ${i.status.padEnd(6)} | ${i.priority.padEnd(6)} | ${i.title}`)
})

console.log('\n=== Example 5: Date Sorting ===\n')

interface Event {
  name: string
  date: Date
}

const events: Event[] = [
  { name: 'Launch', date: new Date('2024-03-01') },
  { name: 'Meeting', date: new Date('2024-02-15') },
  { name: 'Review', date: new Date('2024-02-20') }
]

console.log('Events (chronological):')
console.log([...events].sort(byDate(e => e.date)).map(e => e.name))

console.log('\nEvents (most recent first):')
console.log([...events].sort(reverse(byDate(e => e.date))).map(e => e.name))

console.log('\n=== Example 6: Handling Null Values ===\n')

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

console.log('Users (nulls first, then by last login):')
const usersNullsFirst = [...users].sort(
  nullsFirst(ascending(u => u.lastLogin ?? new Date(0)))
)
usersNullsFirst.forEach(u => {
  console.log(`${u.name}: ${u.lastLogin ? u.lastLogin.toLocaleDateString() : 'Never logged in'}`)
})

console.log('\nUsers (nulls last, then by last login):')
const usersNullsLast = [...users].sort(
  nullsLast(ascending(u => u.lastLogin ?? new Date(0)))
)
usersNullsLast.forEach(u => {
  console.log(`${u.name}: ${u.lastLogin ? u.lastLogin.toLocaleDateString() : 'Never logged in'}`)
})

console.log('\n=== Example 7: Case-Insensitive Sorting ===\n')

const filenames = ['README.md', 'index.ts', 'App.tsx', 'package.json', 'API.md']
console.log('Case-sensitive (default):', [...filenames].sort())
console.log('Case-insensitive:', [...filenames].sort(caseInsensitive(x => x)))

console.log('\n=== Example 8: Boolean Sorting ===\n')

interface Task {
  title: string
  completed: boolean
  urgent: boolean
}

const tasks: Task[] = [
  { title: 'Review PR', completed: true, urgent: false },
  { title: 'Fix bug', completed: false, urgent: true },
  { title: 'Write docs', completed: false, urgent: false },
  { title: 'Deploy', completed: true, urgent: true }
]

// Sort: urgent first, then incomplete first
const sortedTasks = [...tasks].sort(
  compose(
    reverse(byBoolean(t => t.urgent)),
    byBoolean(t => t.completed)
  )
)

console.log('Tasks (urgent + incomplete first):')
sortedTasks.forEach(t => {
  const urgentTag = t.urgent ? '[URGENT]' : ''
  const statusTag = t.completed ? '✓' : '○'
  console.log(`${statusTag} ${urgentTag} ${t.title}`)
})

console.log('\n=== Example 9: Stripe Transaction Sorting ===\n')

interface Transaction {
  id: string
  amount: number
  status: 'succeeded' | 'pending' | 'failed'
  createdAt: Date
}

const transactions: Transaction[] = [
  { id: 'tx_1', amount: 5000, status: 'succeeded', createdAt: new Date('2024-01-15T10:30:00') },
  { id: 'tx_2', amount: 15000, status: 'succeeded', createdAt: new Date('2024-01-16T14:20:00') },
  { id: 'tx_3', amount: 5000, status: 'pending', createdAt: new Date('2024-01-16T09:15:00') },
  { id: 'tx_4', amount: 25000, status: 'failed', createdAt: new Date('2024-01-14T16:45:00') }
]

// Sort by status (failed first), then by amount (highest first)
const statusPriority = { failed: 0, pending: 1, succeeded: 2 }

const sortedTransactions = [...transactions].sort(
  withTiebreaker(
    ascending(t => statusPriority[t.status]),
    descending(t => t.amount)
  )
)

console.log('Transactions (failed first, then by amount):')
sortedTransactions.forEach(t => {
  const amountStr = `$${(t.amount / 100).toFixed(2)}`
  console.log(`${t.id}: ${t.status.padEnd(10)} ${amountStr.padStart(10)}`)
})

console.log('\n=== Example 10: Integration with Remeda ===\n')

interface Employee {
  name: string
  department: string
  salary: number
  isActive: boolean
}

const employees: Employee[] = [
  { name: 'Alice', department: 'Engineering', salary: 120000, isActive: true },
  { name: 'Bob', department: 'Sales', salary: 80000, isActive: true },
  { name: 'Charlie', department: 'Engineering', salary: 150000, isActive: false },
  { name: 'Diana', department: 'Engineering', salary: 95000, isActive: true }
]

// Use Remeda pipe with our comparators
const topEngineer = R.pipe(
  employees,
  R.filter(e => e.department === 'Engineering' && e.isActive),
  R.sort(descending(e => e.salary)),
  R.first()
)

console.log('Top active engineer:', topEngineer)

// Group and sort within groups
const byDepartment = R.pipe(
  employees,
  R.groupBy(e => e.department),
  R.mapValues(group => R.sort(group, descending(e => e.salary)))
)

console.log('\nEmployees by department (sorted by salary):')
Object.entries(byDepartment).forEach(([dept, emps]) => {
  console.log(`\n${dept}:`)
  emps.forEach(e => console.log(`  ${e.name}: $${e.salary.toLocaleString()}`))
})

console.log('\n=== All Examples Complete ===')
