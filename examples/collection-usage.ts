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

console.log('\n=== All examples completed successfully! ===')
