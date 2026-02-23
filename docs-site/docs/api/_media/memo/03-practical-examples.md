# Practical Examples

> Real-world memoization patterns for common scenarios.

## Table of Contents

1. [API Caching](#api-caching)
2. [Database Queries](#database-queries)
3. [Expensive Computations](#expensive-computations)
4. [Image Processing](#image-processing)
5. [Request Deduplication](#request-deduplication)
6. [Configuration Loading](#configuration-loading)

---

## API Caching

### Basic API Response Caching

```typescript
import { memoizeAsync, ttlCache } from 'receta/memo'

const fetchUser = memoizeAsync(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error(`Failed to fetch user ${id}`)
    return res.json()
  },
  { cache: ttlCache(5 * 60 * 1000) } // 5 min cache
)

// Usage
const user = await fetchUser('123') // API call
const same = await fetchUser('123') // Cached
```

### Weather API with Auto-Refresh

```typescript
class WeatherService {
  private fetchWeather = memoizeAsync(
    async (city: string) => {
      const res = await fetch(`/api/weather/${city}`)
      return res.json()
    },
    { cache: ttlCache(10 * 60 * 1000) } // 10 min TTL
  )

  async getWeather(city: string) {
    return this.fetchWeather(city)
  }

  refresh(city: string) {
    this.fetchWeather.cache.delete(city)
  }
}
```

### GitHub API with Rate Limiting

```typescript
import { memoizeAsync, lruCache } from 'receta/memo'

const fetchGitHubRepo = memoizeAsync(
  async (owner: string, repo: string) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    return res.json()
  },
  {
    keyFn: (owner, repo) => `${owner}/${repo}`,
    cache: lruCache(50) // Keep last 50 repos
  }
)

// Usage
const react = await fetchGitHubRepo('facebook', 'react')
const vue = await fetchGitHubRepo('vuejs', 'vue')
```

---

## Database Queries

### User Lookup

```typescript
import { memoizeAsync, ttlCache } from 'receta/memo'

class UserRepository {
  private findById = memoizeAsync(
    async (id: string) => {
      return await db.query('SELECT * FROM users WHERE id = $1', [id])
    },
    { cache: ttlCache(60 * 1000) } // 1 min cache
  )

  async getUser(id: string) {
    return this.findById(id)
  }

  invalidate(id: string) {
    this.findById.cache.delete(id)
  }
}
```

### Complex Query Caching

```typescript
interface QueryOptions {
  table: string
  where: Record<string, unknown>
  limit: number
  offset: number
}

const executeQuery = memoizeAsync(
  async (opts: QueryOptions) => {
    const sql = buildSQL(opts)
    return await db.query(sql)
  },
  {
    keyFn: (opts) => JSON.stringify(opts),
    cache: lruCache(100)
  }
)

// Usage
const users = await executeQuery({
  table: 'users',
  where: { active: true },
  limit: 10,
  offset: 0
})
```

---

## Expensive Computations

### Fibonacci with Memoization

```typescript
import { memoize } from 'receta/memo'

const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

console.time('fib(40)')
console.log(fibonacci(40)) // 102334155
console.timeEnd('fib(40)') // ~1ms (with memoization!)
```

### Factorial

```typescript
const factorial = memoize((n: number): number => {
  if (n <= 1) return 1
  return n * factorial(n - 1)
})

factorial(100) // Computed
factorial(100) // Cached
factorial(101) // Uses cached factorial(100)
```

### Prime Number Check

```typescript
const isPrime = memoize((n: number): boolean => {
  if (n <= 1) return false
  if (n <= 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false
  }
  return true
})

isPrime(97) // Computed
isPrime(97) // Cached
```

---

## Image Processing

### Image Resizing

```typescript
import { memoizeBy, lruCache } from 'receta/memo'

interface ResizeOptions {
  url: string
  width: number
  height: number
  format: 'jpeg' | 'png' | 'webp'
}

const resizeImage = memoizeBy(
  (opts: ResizeOptions) => {
    console.log(`Processing: ${opts.url}`)
    return processImage(opts)
  },
  (opts) => `${opts.url}:${opts.width}x${opts.height}:${opts.format}`,
  { cache: lruCache(50) }
)

// Usage
resizeImage({ url: 'photo.jpg', width: 800, height: 600, format: 'webp' })
```

### Thumbnail Generation

```typescript
const generateThumbnail = memoizeAsync(
  async (imageUrl: string, size: number) => {
    const image = await loadImage(imageUrl)
    return await createThumbnail(image, size)
  },
  {
    keyFn: (url, size) => `${url}:${size}`,
    cache: ttlCache(24 * 60 * 60 * 1000) // 24 hour cache
  }
)
```

---

## Request Deduplication

### Multiple Components Requesting Same Data

```typescript
import { memoizeAsync } from 'receta/memo'

const fetchUser = memoizeAsync(async (id: string) => {
  console.log(`[API] Fetching user ${id}`)
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})

// Scenario: 3 components mount simultaneously
const [header, sidebar, profile] = await Promise.all([
  fetchUser('123'), // Triggers API call
  fetchUser('123'), // Waits for same promise
  fetchUser('123')  // Waits for same promise
])

console.log(header === sidebar) // true (same object!)
// Only 1 API call made!
```

### Preventing Thundering Herd

```typescript
const getPopularContent = memoizeAsync(
  async () => {
    console.log('[DB] Running expensive query')
    return await db.query('SELECT * FROM posts ORDER BY views DESC LIMIT 10')
  },
  { cache: ttlCache(60 * 1000) } // 1 min cache
)

// 1000 concurrent requests
const requests = Array(1000).fill(null).map(() => getPopularContent())
await Promise.all(requests)
// Only 1 DB query executed!
```

---

## Configuration Loading

### Environment Config

```typescript
import { memoize, ttlCache } from 'receta/memo'

class ConfigLoader {
  private loadConfig = memoize(
    (env: string): AppConfig => {
      console.log(`Loading ${env} config`)
      return {
        apiUrl: process.env[`API_URL_${env.toUpperCase()}`]!,
        timeout: env === 'production' ? 5000 : 30000,
        debug: env !== 'production'
      }
    },
    { cache: ttlCache(5 * 60 * 1000) }
  )

  get(env: string) {
    return this.loadConfig(env)
  }
}

const config = new ConfigLoader()
const prodConfig = config.get('production')
```

### Feature Flags

```typescript
const getFeatureFlags = memoizeAsync(
  async (userId: string) => {
    return await featureFlagService.getFlags(userId)
  },
  { cache: ttlCache(30 * 1000) } // 30 sec cache
)

// Usage
const flags = await getFeatureFlags('user-123')
if (flags.newUI) {
  // Show new UI
}
```

---

## Next Steps

- **Learn TypeScript patterns** → [TypeScript Integration](./04-typescript-integration.md)
- **Handle errors properly** → [Error Handling](./05-error-handling.md)
- **Best practices** → [Patterns](./06-patterns.md)
