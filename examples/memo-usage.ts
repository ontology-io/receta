/**
 * Memo Module - Basic Usage Examples
 *
 * Demonstrates core memoization patterns for caching expensive computations.
 */

import { memoize, memoizeBy, memoizeAsync, ttlCache, lruCache, weakCache, clearCache } from '@ontologyio/receta/memo'

// ============================================================================
// Example 1: Basic Memoization
// ============================================================================

console.log('=== Example 1: Basic Memoization ===')

const fibonacci = (n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const memoFib = memoize(fibonacci)

console.time('First call (computed)')
console.log('fib(40) =', memoFib(40))
console.timeEnd('First call (computed)')

console.time('Second call (cached)')
console.log('fib(40) =', memoFib(40))
console.timeEnd('Second call (cached)')

// ============================================================================
// Example 2: Multi-Argument Functions
// ============================================================================

console.log('\n=== Example 2: Multi-Argument Functions ===')

const add = (a: number, b: number): number => {
  console.log(`Computing ${a} + ${b}`)
  return a + b
}

const memoAdd = memoizeBy(add, (a, b) => `${a},${b}`)

console.log('add(2, 3) =', memoAdd(2, 3)) // Computed
console.log('add(2, 3) =', memoAdd(2, 3)) // Cached
console.log('add(3, 2) =', memoAdd(3, 2)) // Computed (different key)

// ============================================================================
// Example 3: Object Arguments
// ============================================================================

console.log('\n=== Example 3: Object Arguments ===')

interface FetchOptions {
  id: string
  include?: string[]
}

const simulateFetch = (opts: FetchOptions): string => {
  console.log(`Fetching with options:`, JSON.stringify(opts))
  return `Result for ${opts.id}`
}

const memoFetch = memoizeBy(
  simulateFetch,
  (opts) => JSON.stringify(opts) // Serialize to JSON for cache key
)

console.log(memoFetch({ id: '123' })) // Computed
console.log(memoFetch({ id: '123' })) // Cached
console.log(memoFetch({ id: '123', include: ['profile'] })) // Computed (different options)

// ============================================================================
// Example 4: TTL Cache (Time-to-Live)
// ============================================================================

console.log('\n=== Example 4: TTL Cache ===')

const getWeather = (city: string): string => {
  console.log(`Fetching weather for ${city}`)
  return `${city}: 72°F`
}

const memoWeather = memoize(getWeather, {
  cache: ttlCache(2000), // 2 second TTL
})

console.log(memoWeather('NYC')) // Computed
console.log(memoWeather('NYC')) // Cached

setTimeout(() => {
  console.log('[After 2.5s] Cached entry expired:')
  console.log(memoWeather('NYC')) // Recomputed (expired)
}, 2500)

// ============================================================================
// Example 5: LRU Cache (Least Recently Used)
// ============================================================================

console.log('\n=== Example 5: LRU Cache ===')

const getUser = (id: number): string => {
  console.log(`Fetching user ${id}`)
  return `User ${id}`
}

const memoGetUser = memoize(getUser, {
  cache: lruCache(2), // Max 2 entries
})

console.log(memoGetUser(1)) // Computed
console.log(memoGetUser(2)) // Computed
console.log(memoGetUser(3)) // Computed - evicts user 1
console.log(memoGetUser(1)) // Recomputed (was evicted)
console.log(memoGetUser(2)) // Cached (still in cache)

// ============================================================================
// Example 6: WeakMap Cache (for Object Keys)
// ============================================================================

console.log('\n=== Example 6: WeakMap Cache ===')

interface Node {
  id: string
  value: number
}

const processNode = (node: Node): number => {
  console.log(`Processing node ${node.id}`)
  return node.value * 2
}

const memoProcess = memoizeBy(processNode, (node) => node, {
  cache: weakCache(),
})

const node1 = { id: 'a', value: 5 }
const node2 = { id: 'b', value: 10 }

console.log('node1:', memoProcess(node1)) // Computed
console.log('node1:', memoProcess(node1)) // Cached
console.log('node2:', memoProcess(node2)) // Computed

// ============================================================================
// Example 7: Async Memoization with Deduplication
// ============================================================================

console.log('\n=== Example 7: Async Memoization ===')

const fetchUserAsync = async (id: string): Promise<{ id: string; name: string }> => {
  console.log(`[API] Fetching user ${id}`)
  await new Promise((resolve) => setTimeout(resolve, 100))
  return { id, name: `User ${id}` }
}

const memoFetchUser = memoizeAsync(fetchUserAsync)

// Concurrent requests - only 1 actual API call
;(async () => {
  const p1 = memoFetchUser('123')
  const p2 = memoFetchUser('123')
  const p3 = memoFetchUser('123')

  const [user1, user2, user3] = await Promise.all([p1, p2, p3])

  console.log('User 1:', user1)
  console.log('User 2:', user2)
  console.log('User 3:', user3)
  console.log('All three are the same object:', user1 === user2 && user2 === user3)

  // Subsequent call - cached
  console.log('\nCached call:')
  const user4 = await memoFetchUser('123')
  console.log('User 4:', user4)
})()

// ============================================================================
// Example 8: Cache Clearing
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 8: Cache Clearing ===')

  const expensive = (n: number): number => {
    console.log(`Computing ${n} * 2`)
    return n * 2
  }

  const memoExpensive = memoize(expensive)

  console.log('First call:', memoExpensive(10)) // Computed
  console.log('Second call:', memoExpensive(10)) // Cached

  // Clear cache
  clearCache(memoExpensive)
  console.log('After clearing cache:')

  console.log('Third call:', memoExpensive(10)) // Recomputed

  // Alternative: use .clear() method
  memoExpensive.clear()
}, 3500)

// ============================================================================
// Example 9: Custom Equality for Objects
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 9: Custom Key Extraction ===')

  interface Product {
    id: string
    name: string
    price: number
  }

  const formatProduct = (product: Product): string => {
    console.log(`Formatting product ${product.id}`)
    return `${product.name}: $${product.price}`
  }

  // Use only ID for cache key (ignore name/price changes)
  const memoFormat = memoizeBy(formatProduct, (p) => p.id)

  const product1 = { id: 'p1', name: 'Widget', price: 10 }
  const product2 = { id: 'p1', name: 'Widget Pro', price: 15 } // Same ID, different data

  console.log(memoFormat(product1)) // Computed
  console.log(memoFormat(product2)) // Cached (same ID)
}, 4000)
