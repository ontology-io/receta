/**
 * Memo Module - Advanced Usage Examples
 *
 * Demonstrates advanced memoization patterns for real-world scenarios.
 */

import { memoize, memoizeBy, memoizeAsync, ttlCache, lruCache } from '../src/memo'

// ============================================================================
// Example 1: API Client with TTL Cache
// ============================================================================

console.log('=== Example 1: API Client with TTL Cache ===')

class WeatherAPI {
  private fetchWeather = memoize(
    async (city: string): Promise<{ temp: number; conditions: string }> => {
      console.log(`[API] Fetching weather for ${city}`)
      await new Promise((resolve) => setTimeout(resolve, 100))
      return {
        temp: Math.floor(Math.random() * 40) + 50,
        conditions: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)]!,
      }
    },
    { cache: ttlCache(5000) } // 5 second cache
  )

  async getWeather(city: string) {
    return this.fetchWeather(city)
  }

  clearCache() {
    this.fetchWeather.clear()
  }
}

const api = new WeatherAPI()

;(async () => {
  console.log('First call:', await api.getWeather('NYC'))
  console.log('Second call (cached):', await api.getWeather('NYC'))

  // After TTL expires, data is refreshed
  setTimeout(async () => {
    console.log('[After 5s] Third call (refreshed):', await api.getWeather('NYC'))
  }, 5500)
})()

// ============================================================================
// Example 2: Database Query Caching
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 2: Database Query Caching ===')

  interface QueryOptions {
    table: string
    where: Record<string, unknown>
    limit?: number
  }

  class Database {
    private query = memoizeAsync(
      async (opts: QueryOptions): Promise<unknown[]> => {
        console.log(`[DB] Querying ${opts.table}`, opts.where)
        await new Promise((resolve) => setTimeout(resolve, 50))
        return [{ id: 1, data: 'mock' }]
      },
      {
        keyFn: (opts) => JSON.stringify(opts),
        cache: lruCache(100), // Cache last 100 queries
      }
    )

    async findMany(opts: QueryOptions) {
      return this.query(opts)
    }
  }

  const db = new Database()

  ;(async () => {
    const opts = { table: 'users', where: { active: true }, limit: 10 }

    console.log('Query 1:', await db.findMany(opts))
    console.log('Query 2 (cached):', await db.findMany(opts))
    console.log('Query 3 (different opts):', await db.findMany({ ...opts, limit: 20 }))
  })()
}, 1000)

// ============================================================================
// Example 3: Recursive Computation with Memoization
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 3: Recursive Computation ===')

  interface Point {
    x: number
    y: number
  }

  const distance = memoizeBy(
    (p1: Point, p2: Point): number => {
      console.log(`Computing distance from (${p1.x},${p1.y}) to (${p2.x},${p2.y})`)
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    },
    (p1, p2) => `${p1.x},${p1.y}-${p2.x},${p2.y}`
  )

  const p1 = { x: 0, y: 0 }
  const p2 = { x: 3, y: 4 }
  const p3 = { x: 6, y: 8 }

  console.log('Distance 1-2:', distance(p1, p2)) // Computed: 5
  console.log('Distance 2-3:', distance(p2, p3)) // Computed: 5
  console.log('Distance 1-2 again:', distance(p1, p2)) // Cached
}, 2000)

// ============================================================================
// Example 4: Conditional Cache Invalidation
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 4: Conditional Cache Invalidation ===')

  interface User {
    id: string
    name: string
    lastUpdated: number
  }

  const getUser = memoizeBy(
    (id: string): User => {
      console.log(`Loading user ${id}`)
      return {
        id,
        name: `User ${id}`,
        lastUpdated: Date.now(),
      }
    },
    (id) => id
  )

  const user1 = getUser('123')
  console.log('First load:', user1)

  const user2 = getUser('123')
  console.log('Cached load:', user2)

  // Invalidate cache when data changes
  console.log('Clearing cache after update...')
  getUser.clear()

  const user3 = getUser('123')
  console.log('After invalidation:', user3)
  console.log('lastUpdated changed:', user1.lastUpdated !== user3.lastUpdated)
}, 3000)

// ============================================================================
// Example 5: Memoizing Class Methods
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 5: Memoizing Class Methods ===')

  class Calculator {
    private factorial = memoize((n: number): number => {
      console.log(`Computing factorial(${n})`)
      if (n <= 1) return 1
      return n * this.factorial(n - 1)
    })

    compute(n: number): number {
      return this.factorial(n)
    }

    reset() {
      this.factorial.clear()
    }
  }

  const calc = new Calculator()

  console.log('5! =', calc.compute(5))
  console.log('5! (cached) =', calc.compute(5))
  console.log('6! =', calc.compute(6)) // Uses cached 5!

  calc.reset()
  console.log('After reset, 5! =', calc.compute(5))
}, 4000)

// ============================================================================
// Example 6: Request Deduplication in UI
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 6: Request Deduplication ===')

  const fetchData = memoizeAsync(async (id: string) => {
    console.log(`[Network] Fetching data for ${id}`)
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { id, data: `Data for ${id}` }
  })

  // Simulate multiple UI components requesting same data simultaneously
  ;(async () => {
    console.log('Multiple components requesting user 456...')

    const [comp1, comp2, comp3, comp4] = await Promise.all([
      fetchData('456'), // Component 1
      fetchData('456'), // Component 2
      fetchData('456'), // Component 3
      fetchData('456'), // Component 4
    ])

    console.log('All components got same data')
    console.log('Same object reference:', comp1 === comp2 && comp2 === comp3 && comp3 === comp4)
  })()
}, 5000)

// ============================================================================
// Example 7: Expensive Image Processing
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 7: Image Processing Cache ===')

  interface ImageOptions {
    url: string
    width: number
    height: number
    format: 'jpeg' | 'png' | 'webp'
  }

  const processImage = memoizeBy(
    (opts: ImageOptions): string => {
      console.log(`Processing image: ${opts.url} (${opts.width}x${opts.height})`)
      return `${opts.url}?w=${opts.width}&h=${opts.height}&f=${opts.format}`
    },
    (opts) => `${opts.url}:${opts.width}:${opts.height}:${opts.format}`,
    { cache: lruCache(50) } // Keep 50 most recent transformations
  )

  const img1 = { url: 'photo.jpg', width: 800, height: 600, format: 'webp' as const }
  const img2 = { url: 'photo.jpg', width: 400, height: 300, format: 'webp' as const }

  console.log(processImage(img1)) // Computed
  console.log(processImage(img1)) // Cached
  console.log(processImage(img2)) // Computed (different size)
}, 6000)

// ============================================================================
// Example 8: Configuration Loading
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 8: Configuration Loading ===')

  class ConfigLoader {
    private loadConfig = memoize(
      (env: string): Record<string, string> => {
        console.log(`Loading ${env} configuration`)
        return {
          apiUrl: `https://api.${env}.example.com`,
          timeout: env === 'production' ? '5000' : '30000',
          debug: env === 'development' ? 'true' : 'false',
        }
      },
      { cache: ttlCache(60000) } // 1 minute TTL
    )

    get(env: string) {
      return this.loadConfig(env)
    }
  }

  const loader = new ConfigLoader()

  console.log('Development config:', loader.get('development'))
  console.log('Production config:', loader.get('production'))
  console.log('Development (cached):', loader.get('development'))
}, 7000)

// ============================================================================
// Example 9: Dependency Graph Resolution
// ============================================================================

setTimeout(() => {
  console.log('\n=== Example 9: Dependency Resolution ===')

  interface Package {
    name: string
    version: string
    dependencies: string[]
  }

  const resolvePackage = memoizeBy(
    (name: string): Package => {
      console.log(`Resolving package: ${name}`)
      // Simulate package resolution
      return {
        name,
        version: '1.0.0',
        dependencies: [],
      }
    },
    (name) => name
  )

  const packages = ['react', 'react-dom', 'react', 'typescript', 'react-dom']

  packages.forEach((pkg) => {
    const resolved = resolvePackage(pkg)
    console.log(`${pkg}@${resolved.version}`)
  })
}, 8000)
