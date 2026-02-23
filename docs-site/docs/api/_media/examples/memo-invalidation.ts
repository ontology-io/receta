/**
 * Memo Module - Cache Invalidation Examples
 *
 * Demonstrates advanced cache invalidation patterns.
 */

import {
  memoize,
  memoizeBy,
  memoizeAsync,
  invalidateMany,
  invalidateWhere,
  invalidateAll,
} from '../src/memo'

// ============================================================================
// Example 1: Batch Update with invalidateMany
// ============================================================================

console.log('=== Example 1: Batch Update ===')

interface User {
  id: string
  name: string
  role: 'admin' | 'user'
}

const fetchUser = (id: string): User => {
  console.log(`[DB] Fetching user ${id}`)
  return { id, name: `User ${id}`, role: id === 'admin-1' ? 'admin' : 'user' }
}

const getUser = memoize(fetchUser)

// Initial fetches
getUser('1')
getUser('2')
getUser('3')

// Simulate batch update
console.log('\nBatch updating users 1 and 3...')
const updatedIds = ['1', '3']
invalidateMany(getUser, updatedIds)

// Verify invalidation
console.log('\nAfter invalidation:')
getUser('1') // Refetched
getUser('2') // Still cached
getUser('3') // Refetched

// ============================================================================
// Example 2: Conditional Invalidation with invalidateWhere
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 2: Conditional Invalidation ===')

  const fetchPost = (id: string) => {
    console.log(`[DB] Fetching post ${id}`)
    return {
      id,
      title: `Post ${id}`,
      status: id.startsWith('draft') ? 'draft' : 'published',
    }
  }

  const getPost = memoizeBy(fetchPost, (id) => id)

  // Fetch various posts
  getPost('draft-1')
  getPost('published-1')
  getPost('draft-2')
  getPost('published-2')

  // Publish all drafts - invalidate draft posts
  console.log('\nPublishing all drafts...')
  invalidateWhere(getPost, (key: string) => key.startsWith('draft'))

  // Verify
  console.log('\nAfter publishing:')
  getPost('draft-1') // Refetched
  getPost('published-1') // Cached
  getPost('draft-2') // Refetched
  getPost('published-2') // Cached
}, 1000)

// ============================================================================
// Example 3: Multi-Cache Coordination with invalidateAll
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 3: Multi-Cache Coordination ===')

  const fetchUserData = (id: string) => {
    console.log(`[API] Fetching user ${id}`)
    return { id, name: `User ${id}` }
  }

  const fetchUserPosts = (userId: string) => {
    console.log(`[API] Fetching posts for user ${userId}`)
    return [{ id: '1', userId, title: 'Post 1' }]
  }

  const fetchUserComments = (userId: string) => {
    console.log(`[API] Fetching comments for user ${userId}`)
    return [{ id: '1', userId, text: 'Comment 1' }]
  }

  const getUserData = memoize(fetchUserData)
  const getUserPosts = memoize(fetchUserPosts)
  const getUserComments = memoize(fetchUserComments)

  // Fetch all user data
  getUserData('user-123')
  getUserPosts('user-123')
  getUserComments('user-123')

  // User deleted - clear all related caches
  console.log('\nDeleting user-123...')
  invalidateAll(getUserData, getUserPosts, getUserComments)

  // Verify all refetch
  console.log('\nAfter deletion:')
  getUserData('user-123')
  getUserPosts('user-123')
  getUserComments('user-123')
}, 2000)

// ============================================================================
// Example 4: Async Cache Invalidation
// ============================================================================

setTimeout(async () => {
  console.log('\n=== Example 4: Async Invalidation ===')

  const fetchData = async (id: string) => {
    console.log(`[API] Fetching data ${id}`)
    await new Promise((resolve) => setTimeout(resolve, 50))
    return { id, data: `Data for ${id}` }
  }

  const getData = memoizeAsync(fetchData)

  // Initial fetches
  await getData('a')
  await getData('b')
  await getData('c')

  // Invalidate some
  console.log('\nInvalidating a and c...')
  invalidateMany(getData, ['a', 'c'])

  // Verify
  console.log('\nAfter invalidation:')
  await getData('a') // Refetched
  await getData('b') // Cached
  await getData('c') // Refetched
}, 3000)

// ============================================================================
// Example 5: Role-Based Invalidation
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 5: Role-Based Invalidation ===')

  interface AppUser {
    id: string
    name: string
    role: 'admin' | 'user' | 'guest'
  }

  const fetchAppUser = (id: string): AppUser => {
    console.log(`[DB] Fetching user ${id}`)
    const role: 'admin' | 'user' | 'guest' = id === 'admin-1' ? 'admin' : id === 'guest-1' ? 'guest' : 'user'
    return { id, name: `User ${id}`, role }
  }

  const getAppUser = memoize(fetchAppUser)

  // Fetch users
  getAppUser('admin-1')
  getAppUser('user-1')
  getAppUser('guest-1')
  getAppUser('user-2')

  // Revoke admin access - invalidate admin users
  console.log('\nRevoking admin access...')
  invalidateWhere(getAppUser, (_key, user: AppUser | undefined) => user?.role === 'admin')

  // Verify
  console.log('\nAfter access revocation:')
  getAppUser('admin-1') // Refetched
  getAppUser('user-1') // Cached
  getAppUser('guest-1') // Cached
}, 4000)

// ============================================================================
// Example 6: Repository Pattern
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 6: Repository Pattern ===')

  class UserRepository {
    private getById = memoize((id: string) => {
      console.log(`[DB] SELECT * FROM users WHERE id = ${id}`)
      return { id, name: `User ${id}`, email: `user${id}@example.com` }
    })

    findById(id: string) {
      return this.getById(id)
    }

    update(id: string, data: Partial<User>) {
      console.log(`[DB] UPDATE users SET ... WHERE id = ${id}`)
      // Invalidate specific user
      this.getById.cache.delete(id)
    }

    updateMany(ids: string[], data: Partial<User>) {
      console.log(`[DB] UPDATE users SET ... WHERE id IN (${ids.join(',')})`)
      // Invalidate multiple users
      invalidateMany(this.getById, ids)
    }

    delete(id: string) {
      console.log(`[DB] DELETE FROM users WHERE id = ${id}`)
      this.getById.cache.delete(id)
    }

    clearCache() {
      this.getById.clear()
    }
  }

  const userRepo = new UserRepository()

  // Fetch users
  userRepo.findById('1')
  userRepo.findById('2')
  userRepo.findById('3')

  // Update user 2
  console.log('\nUpdating user 2...')
  userRepo.update('2', { name: 'Updated User' })

  // Verify
  console.log('\nAfter update:')
  userRepo.findById('1') // Cached
  userRepo.findById('2') // Refetched
  userRepo.findById('3') // Cached

  // Batch update
  console.log('\nBatch updating users 1 and 3...')
  userRepo.updateMany(['1', '3'], { name: 'Batch Updated' })

  // Verify
  console.log('\nAfter batch update:')
  userRepo.findById('1') // Refetched
  userRepo.findById('2') // Cached
  userRepo.findById('3') // Refetched
}, 5000)

// ============================================================================
// Example 7: Pattern-Based Invalidation
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 7: Pattern-Based Invalidation ===')

  const fetchResource = (key: string) => {
    console.log(`[API] Fetching ${key}`)
    return { key, data: `Data for ${key}` }
  }

  const getResource = memoizeBy(fetchResource, (key) => key)

  // Fetch various resources
  getResource('user:123')
  getResource('user:456')
  getResource('post:789')
  getResource('post:012')
  getResource('comment:345')

  // Clear all user-related caches
  console.log('\nClearing all user caches...')
  invalidateWhere(getResource, (key: string) => key.startsWith('user:'))

  // Verify
  console.log('\nAfter clearing users:')
  getResource('user:123') // Refetched
  getResource('user:456') // Refetched
  getResource('post:789') // Cached
  getResource('post:012') // Cached
  getResource('comment:345') // Cached
}, 6000)
