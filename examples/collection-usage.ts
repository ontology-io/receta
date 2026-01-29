/**
 * Collection Module Usage Examples
 *
 * Run with: bun run examples/collection-usage.ts
 */

import * as R from 'remeda'
import {
  nest,
  diff,
  paginate,
  paginateCursor,
  indexByUnique,
  union,
  intersect,
  symmetricDiff,
  groupByPath,
  flatten,
  batchBy,
  windowSliding,
  cartesianProduct,
  moveIndex,
  insertAt,
  updateAt,
  removeAtIndex,
  type DiffResult,
  type PaginatedResult,
} from '../src/collection'
import { isOk, unwrapOr } from '../src/result'

console.log('=== Collection Module Examples ===\n')

// Example 1: Hierarchical Grouping with nest()
console.log('--- Example 1: Hierarchical Grouping (Comments by User & Post) ---')

interface Comment {
  userId: number
  postId: number
  text: string
  timestamp: string
}

const comments: Comment[] = [
  { userId: 1, postId: 10, text: 'Great post!', timestamp: '2024-01-01' },
  { userId: 1, postId: 10, text: 'Thanks for sharing', timestamp: '2024-01-02' },
  { userId: 1, postId: 20, text: 'Interesting', timestamp: '2024-01-03' },
  { userId: 2, postId: 10, text: 'Well written', timestamp: '2024-01-04' },
  { userId: 2, postId: 30, text: 'Amazing!', timestamp: '2024-01-05' },
]

const nestedComments = nest(comments, ['userId', 'postId'])
console.log('Nested by userId then postId:')
console.log(JSON.stringify(nestedComments, null, 2))

// Example 2: Change Detection with diff()
console.log('\n--- Example 2: Syncing User Data (Git-style Diff) ---')

interface User {
  id: number
  name: string
  email: string
  role: string
}

const oldUsers: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
]

const newUsers: User[] = [
  { id: 1, name: 'Alicia', email: 'alice@example.com', role: 'admin' }, // updated name
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' }, // unchanged
  { id: 4, name: 'David', email: 'david@example.com', role: 'moderator' }, // added
  // id: 3 removed
]

const userDiff = diff(oldUsers, newUsers, (u) => u.id)
console.log('Added:', userDiff.added)
console.log('Updated:', userDiff.updated)
console.log('Removed:', userDiff.removed)
console.log('Unchanged:', userDiff.unchanged)

// Example 3: API Pagination (GitHub-style)
console.log('\n--- Example 3: Offset-based Pagination (API Results) ---')

const allItems = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}))

const page1 = paginate(allItems, { page: 1, pageSize: 10 })
console.log('Page 1 items:', page1.items.slice(0, 3), '...')
console.log(`Showing ${page1.items.length} of ${page1.total} items`)
console.log(`Has next page: ${page1.hasNext}`)

const page2 = paginate(allItems, { page: 2, pageSize: 10 })
console.log('Page 2 first item:', page2.items[0])

// Example 4: Cursor-based Pagination (Infinite Scroll)
console.log('\n--- Example 4: Cursor-based Pagination (Infinite Scroll) ---')

interface Message {
  id: string
  text: string
  timestamp: string
}

const messages: Message[] = Array.from({ length: 30 }, (_, i) => ({
  id: `msg_${i + 1}`,
  text: `Message ${i + 1}`,
  timestamp: new Date(2024, 0, i + 1).toISOString(),
}))

// Initial load
const firstPage = paginateCursor(messages, (m) => m.id, { limit: 10 })
console.log('First page:', firstPage.items.slice(0, 2), '...')
console.log('Next cursor:', firstPage.nextCursor)
console.log('Has more:', firstPage.hasMore)

// Load more
const secondPage = paginateCursor(messages, (m) => m.id, {
  cursor: firstPage.nextCursor,
  limit: 10,
})
console.log('Second page first item:', secondPage.items[0])

// Example 5: Safe Indexing with Collision Handling
console.log('\n--- Example 5: Data Normalization with indexByUnique() ---')

interface Product {
  sku: string
  name: string
  price: number
}

const products: Product[] = [
  { sku: 'SKU001', name: 'Laptop', price: 999 },
  { sku: 'SKU002', name: 'Mouse', price: 25 },
  { sku: 'SKU003', name: 'Keyboard', price: 79 },
]

const productIndex = indexByUnique(products, (p) => p.sku)

if (isOk(productIndex)) {
  console.log('Product lookup by SKU:')
  console.log('SKU001:', productIndex.value['SKU001'])
  console.log('Fast O(1) access!')
} else {
  console.log('Error:', productIndex.error.message)
}

// Handling duplicates
const productsWithDup: Product[] = [
  { sku: 'SKU001', name: 'Laptop', price: 999 },
  { sku: 'SKU001', name: 'Laptop Pro', price: 1299 }, // duplicate SKU
]

const indexDupError = indexByUnique(productsWithDup, (p) => p.sku)
console.log('\nWith duplicate SKU (error strategy):', isOk(indexDupError) ? 'OK' : 'ERROR')

const indexKeepLast = indexByUnique(productsWithDup, (p) => p.sku, { onCollision: 'last' })
console.log(
  'With duplicate SKU (keep last):',
  unwrapOr(indexKeepLast, {})['SKU001']?.name
)

// Example 6: Set Operations for Collections
console.log('\n--- Example 6: Merging Permissions with union() ---')

interface Permission {
  resource: string
  action: string
}

const adminPerms: Permission[] = [
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'write' },
  { resource: 'posts', action: 'delete' },
]

const moderatorPerms: Permission[] = [
  { resource: 'users', action: 'read' },
  { resource: 'posts', action: 'read' },
  { resource: 'posts', action: 'delete' },
]

const allPerms = union(
  adminPerms,
  moderatorPerms,
  (a, b) => a.resource === b.resource && a.action === b.action
)

console.log('Combined permissions:', allPerms)
console.log(`Total unique permissions: ${allPerms.length}`)

// Example 7: Finding Common Elements
console.log('\n--- Example 7: Finding Common Tags with intersect() ---')

const post1Tags = ['typescript', 'react', 'testing', 'performance']
const post2Tags = ['react', 'nodejs', 'testing', 'docker']

const commonTags = intersect(post1Tags, post2Tags)
console.log('Common tags:', commonTags)

// With objects
interface Tag {
  id: number
  name: string
}

const article1Tags: Tag[] = [
  { id: 1, name: 'typescript' },
  { id: 2, name: 'react' },
]

const article2Tags: Tag[] = [
  { id: 2, name: 'react' },
  { id: 3, name: 'nodejs' },
]

const commonArticleTags = intersect(article1Tags, article2Tags, (a, b) => a.id === b.id)
console.log('Common article tags:', commonArticleTags)

// Example 8: Finding Differences
console.log('\n--- Example 8: Feature Comparison with symmetricDiff() ---')

interface Feature {
  name: string
  enabled: boolean
}

const v1Features: Feature[] = [
  { name: 'auth', enabled: true },
  { name: 'search', enabled: true },
  { name: 'export', enabled: false },
]

const v2Features: Feature[] = [
  { name: 'search', enabled: true },
  { name: 'analytics', enabled: true },
  { name: 'ai-assist', enabled: true },
]

const changedFeatures = symmetricDiff(v1Features, v2Features, (a, b) => a.name === b.name)

console.log('Features that changed between versions:', changedFeatures)

// Example 9: Grouping by Nested Paths
console.log('\n--- Example 9: Grouping API Responses by Nested Path ---')

interface Order {
  id: number
  product: string
  payment: {
    status: 'paid' | 'pending' | 'failed'
    method: string
  }
}

const orders: Order[] = [
  { id: 1, product: 'Laptop', payment: { status: 'paid', method: 'card' } },
  { id: 2, product: 'Mouse', payment: { status: 'pending', method: 'paypal' } },
  { id: 3, product: 'Keyboard', payment: { status: 'paid', method: 'card' } },
  { id: 4, product: 'Monitor', payment: { status: 'failed', method: 'card' } },
]

const ordersByStatus = groupByPath(orders, 'payment.status')
console.log('Paid orders:', ordersByStatus.paid?.map((o) => o.product))
console.log('Pending orders:', ordersByStatus.pending?.map((o) => o.product))

// Example 10: Real-world Pipeline
console.log('\n--- Example 10: Complete Data Processing Pipeline ---')

interface Event {
  id: string
  userId: number
  type: 'click' | 'view' | 'purchase'
  metadata: {
    category: string
    timestamp: string
  }
  value?: number
}

const events: Event[] = [
  {
    id: 'evt_1',
    userId: 1,
    type: 'click',
    metadata: { category: 'electronics', timestamp: '2024-01-01' },
  },
  {
    id: 'evt_2',
    userId: 1,
    type: 'purchase',
    metadata: { category: 'electronics', timestamp: '2024-01-02' },
    value: 999,
  },
  {
    id: 'evt_3',
    userId: 2,
    type: 'view',
    metadata: { category: 'books', timestamp: '2024-01-03' },
  },
  {
    id: 'evt_4',
    userId: 1,
    type: 'purchase',
    metadata: { category: 'books', timestamp: '2024-01-04' },
    value: 29,
  },
]

// Pipeline: filter purchases, group by category, paginate
const purchaseAnalysis = R.pipe(
  events,
  R.filter((e) => e.type === 'purchase'),
  groupByPath('metadata.category'),
  (grouped) => ({
    electronics: grouped.electronics || [],
    books: grouped.books || [],
    total: Object.values(grouped).flat().length,
  })
)

console.log('Purchase analysis:', purchaseAnalysis)
console.log('Electronics purchases:', purchaseAnalysis.electronics.length)
console.log('Books purchases:', purchaseAnalysis.books.length)

// Example 11: Flattening Tree Structures
console.log('\n--- Example 11: Flattening File System Tree ---')

interface FileNode {
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
}

const fileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'index.ts', type: 'file' },
      {
        name: 'utils',
        type: 'folder',
        children: [
          { name: 'helper.ts', type: 'file' },
          { name: 'types.ts', type: 'file' },
        ],
      },
      {
        name: 'components',
        type: 'folder',
        children: [{ name: 'Button.tsx', type: 'file' }],
      },
    ],
  },
]

const flatFiles = flatten(fileTree, {
  getChildren: (node) => node.children,
})
console.log('All files and folders:', flatFiles.map((n) => n.name))

// With path tracking
const flatWithPaths = flatten(fileTree, {
  getChildren: (node) => node.children,
  includePath: true,
})
console.log(
  'File with deepest path:',
  flatWithPaths[flatWithPaths.length - 1]?.item.name,
  'at depth',
  flatWithPaths[flatWithPaths.length - 1]?.depth
)

// Example 12: Grouping Consecutive Items
console.log('\n--- Example 12: Batch Processing Consecutive Status Changes ---')

interface TaskLog {
  id: number
  status: 'running' | 'idle' | 'error'
  timestamp: string
}

const taskLogs: TaskLog[] = [
  { id: 1, status: 'running', timestamp: '10:00' },
  { id: 2, status: 'running', timestamp: '10:01' },
  { id: 3, status: 'idle', timestamp: '10:02' },
  { id: 4, status: 'idle', timestamp: '10:03' },
  { id: 5, status: 'running', timestamp: '10:04' },
  { id: 6, status: 'error', timestamp: '10:05' },
]

const statusBatches = batchBy(taskLogs, (log) => log.status)
console.log('Status change runs:', statusBatches.map((batch) => `${batch[0]!.status}(${batch.length})`).join(' → '))

// Example 13: Sliding Window Analysis
console.log('\n--- Example 13: Moving Average Calculation ---')

const stockPrices = [100, 102, 98, 105, 103, 107, 104, 110, 108]

const movingAverage = R.pipe(
  stockPrices,
  windowSliding({ size: 3 }),
  R.map((window) => window.reduce((sum, price) => sum + price, 0) / window.length),
  R.map((avg) => Math.round(avg * 100) / 100)
)

console.log('Stock prices:', stockPrices)
console.log('3-day moving average:', movingAverage)

// N-gram analysis
const sentence = ['The', 'quick', 'brown', 'fox', 'jumps']
const bigrams = windowSliding(sentence, { size: 2 })
console.log('Word bigrams:', bigrams.map((pair) => pair.join(' ')))

// Example 14: Cartesian Product for Test Matrices
console.log('\n--- Example 14: Generating Test Matrix ---')

const browsers = ['chrome', 'firefox', 'safari']
const platforms = ['mac', 'windows', 'linux']
const viewports = ['mobile', 'desktop']

const testMatrix = R.pipe(
  cartesianProduct(browsers, platforms, viewports),
  R.map(([browser, platform, viewport]) => ({
    browser,
    platform,
    viewport,
    config: `${browser}-${platform}-${viewport}`,
  }))
)

console.log(`Generated ${testMatrix.length} test configurations`)
console.log('First config:', testMatrix[0]!.config)
console.log('Last config:', testMatrix[testMatrix.length - 1]!.config)

// Product variants
const sizes = ['S', 'M', 'L']
const colors = ['red', 'blue', 'green']

const productVariants = cartesianProduct(sizes, colors)
console.log(`Product variants: ${productVariants.length}`)
console.log('Variants:', productVariants.map(([size, color]) => `${size}-${color}`).join(', '))

// Example 15: Drag and Drop Reordering
console.log('\n--- Example 15: Todo List Reordering (Drag & Drop) ---')

interface Todo {
  id: number
  title: string
  priority: number
}

let todos: Todo[] = [
  { id: 1, title: 'Buy groceries', priority: 1 },
  { id: 2, title: 'Write report', priority: 2 },
  { id: 3, title: 'Call client', priority: 3 },
  { id: 4, title: 'Review PR', priority: 4 },
]

console.log('Original order:', todos.map((t) => t.title))

// User drags "Call client" from position 2 to position 0
todos = moveIndex(todos, 2, 0)
console.log('After moving "Call client" to top:', todos.map((t) => t.title))

// Example 16: Dynamic List Management
console.log('\n--- Example 16: Managing Todo List (Insert, Update, Remove) ---')

let tasks = [
  { id: 1, text: 'Task 1', done: false },
  { id: 3, text: 'Task 3', done: false },
]

console.log('Initial tasks:', tasks.map((t) => t.text))

// Insert new task at position 1
tasks = insertAt(tasks, 1, { id: 2, text: 'Task 2', done: false })
console.log('After inserting Task 2:', tasks.map((t) => t.text))

// Mark task as done
tasks = updateAt(tasks, 1, { id: 2, text: 'Task 2', done: true })
console.log('After completing Task 2:', tasks.map((t) => `${t.text} (${t.done ? 'done' : 'pending'})`))

// Remove completed task
tasks = R.pipe(
  tasks,
  removeAtIndex(tasks.findIndex((t) => t.done))
)
console.log('After removing completed task:', tasks.map((t) => t.text))

// Example 17: Data Pipeline with New Utilities
console.log('\n--- Example 17: Complete Analysis Pipeline ---')

interface SensorReading {
  timestamp: string
  temperature: number
  status: 'normal' | 'warning' | 'critical'
}

const readings: SensorReading[] = [
  { timestamp: '10:00', temperature: 20, status: 'normal' },
  { timestamp: '10:01', temperature: 22, status: 'normal' },
  { timestamp: '10:02', temperature: 25, status: 'normal' },
  { timestamp: '10:03', temperature: 30, status: 'warning' },
  { timestamp: '10:04', temperature: 35, status: 'warning' },
  { timestamp: '10:05', temperature: 28, status: 'normal' },
  { timestamp: '10:06', temperature: 23, status: 'normal' },
]

// Analyze temperature trends and status patterns
const analysis = R.pipe(
  readings,
  (data) => ({
    statusRuns: batchBy(data, (r) => r.status),
    tempTrend: R.pipe(
      data,
      windowSliding({ size: 3 }),
      R.map((window) => ({
        time: window[1]!.timestamp,
        avgTemp: Math.round((window.reduce((sum, r) => sum + r.temperature, 0) / 3) * 10) / 10,
      }))
    ),
  })
)

console.log('Status change patterns:')
analysis.statusRuns.forEach((run) => {
  console.log(`  ${run[0]!.status}: ${run.length} readings`)
})

console.log('Temperature trend (3-reading average):')
console.log(analysis.tempTrend.map((t) => `${t.time}:${t.avgTemp}°C`).join(', '))

console.log('\n=== All examples completed successfully! ===')
