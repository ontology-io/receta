# Core Operations: Fundamental Object Transformations

The core operations provide fundamental transformations for restructuring objects. These 5 functions handle the most common scenarios: flattening hierarchies, renaming keys, filtering fields, and deep merging.

## Table of Contents

1. [flatten](#flatten)
2. [unflatten](#unflatten)
3. [rename](#rename)
4. [mask](#mask)
5. [deepMerge](#deepmerge)
6. [Comparison Table](#comparison-table)
7. [When to Use Which](#when-to-use-which)

---

## flatten

Converts nested objects into flat objects with dot-notation keys.

### Signature

```typescript
function flatten(obj: PlainObject, options?: FlattenOptions): FlatObject

interface FlattenOptions {
  separator?: string        // Default: '.'
  maxDepth?: number        // Default: Infinity
  flattenArrays?: boolean  // Default: false
}
```

### Real-World: Database Query Parameters

```typescript
// ElasticSearch-style query builder
const searchQuery = {
  query: {
    bool: {
      must: [
        { match: { title: 'receta' } }
      ],
      filter: {
        range: {
          date: { gte: '2024-01-01' }
        }
      }
    }
  }
}

// Flatten for logging/debugging
const flat = flatten(searchQuery)
// {
//   'query.bool.must.0.match.title': 'receta',
//   'query.bool.filter.range.date.gte': '2024-01-01'
// }
```

### Real-World: Form Data to URL Params

```typescript
// Next.js search params
const filters = {
  category: 'electronics',
  price: {
    min: 100,
    max: 500
  },
  features: {
    wireless: true,
    waterproof: false
  }
}

const params = new URLSearchParams(
  flatten(filters, { separator: '_' })
)
// ?category=electronics&price_min=100&price_max=500&features_wireless=true...
```

### Options Examples

```typescript
// Custom separator
flatten(nested, { separator: '_' })
// { user_profile_name: 'Alice' }

// Max depth
flatten(deep, { maxDepth: 1 })
// { 'user.profile': { name: 'Alice', age: 30 } }

// Flatten arrays
const data = { items: ['a', 'b', 'c'] }
flatten(data, { flattenArrays: true })
// { 'items.0': 'a', 'items.1': 'b', 'items.2': 'c' }
```

### In Pipelines

```typescript
import { pipe } from 'remeda'

// Prepare nested config for environment variables
const envVars = pipe(
  config,
  flatten({ separator: '__' }),
  mapKeys((key) => key.toUpperCase())
)
// { DATABASE__HOST: 'localhost', DATABASE__PORT: '5432' }
```

---

## unflatten

Converts flat objects with dot-notation keys back into nested structures.

### Signature

```typescript
function unflatten(obj: FlatObject, options?: UnflattenOptions): PlainObject

interface UnflattenOptions {
  separator?: string  // Default: '.'
}
```

### Real-World: Environment Variables to Config

```typescript
// Load environment variables
const env = {
  'DATABASE_HOST': 'localhost',
  'DATABASE_PORT': '5432',
  'API_KEY': 'secret',
  'API_TIMEOUT': '30000'
}

// Convert to nested config
const config = pipe(
  env,
  mapKeys((key) => key.toLowerCase()),
  unflatten({ separator: '_' })
)
// {
//   database: { host: 'localhost', port: '5432' },
//   api: { key: 'secret', timeout: '30000' }
// }
```

### Real-World: Redis Hash to Object

```typescript
// Redis stores flat key-value pairs
const redisHash = {
  'user:123:name': 'Alice',
  'user:123:email': 'alice@example.com',
  'user:123:settings:theme': 'dark',
  'user:123:settings:notifications': 'true'
}

const user = unflatten(
  removePrefix(redisHash, 'user:123:'),
  { separator: ':' }
)
// {
//   name: 'Alice',
//   email: 'alice@example.com',
//   settings: { theme: 'dark', notifications: 'true' }
// }
```

### Array Reconstruction

```typescript
// Unflatten reconstructs arrays from numeric keys
const flat = {
  'items.0': 'apple',
  'items.1': 'banana',
  'items.2.name': 'orange',
  'items.2.color': 'orange'
}

unflatten(flat)
// {
//   items: [
//     'apple',
//     'banana',
//     { name: 'orange', color: 'orange' }
//   ]
// }
```

### Round-Trip Guarantee

```typescript
// flatten → unflatten preserves structure
const original = { a: { b: { c: 1 } } }
const restored = pipe(original, flatten(), unflatten())

expect(restored).toEqual(original) // ✅
```

---

## rename

Renames object keys according to a mapping, preserving unmapped keys.

### Signature

```typescript
function rename<T>(obj: T, mapping: Record<string, string>): PlainObject
```

### Real-World: API Response Normalization

```typescript
// GitHub API → Your schema
const githubUser = {
  login: 'alice',
  avatar_url: 'https://github.com/alice.png',
  public_repos: 42,
  created_at: '2015-01-01T00:00:00Z'
}

const normalized = rename(githubUser, {
  login: 'username',
  avatar_url: 'avatarUrl',
  public_repos: 'repoCount',
  created_at: 'joinedAt'
})
// {
//   username: 'alice',
//   avatarUrl: 'https://github.com/alice.png',
//   repoCount: 42,
//   joinedAt: '2015-01-01T00:00:00Z'
// }
```

### Real-World: Database Schema Migration

```typescript
// Rename columns after schema change
const oldRecord = {
  user_id: 123,
  first_name: 'Alice',
  last_name: 'Smith',
  email_address: 'alice@example.com'
}

const newRecord = rename(oldRecord, {
  user_id: 'id',
  first_name: 'firstName',
  last_name: 'lastName',
  email_address: 'email'
})
```

### Partial Mapping

```typescript
// Only rename specific keys, keep others unchanged
const data = { id: 1, oldName: 'Alice', age: 30, city: 'NYC' }

rename(data, { oldName: 'name' })
// { id: 1, name: 'Alice', age: 30, city: 'NYC' }
//   ↑ Unmapped keys preserved
```

### In Pipelines with Multiple APIs

```typescript
// Normalize responses from different APIs
const normalizeStripeCustomer = (customer: unknown) =>
  pipe(
    customer,
    rename({
      id: 'customerId',
      email: 'email',
      created: 'createdAt',
      metadata: 'meta'
    }),
    validateShape(schema)
  )
```

---

## mask

Security-focused filtering that keeps only explicitly allowed keys (allowlist approach).

### Signature

```typescript
function mask<T>(obj: T, allowedKeys: readonly string[]): Partial<T>
```

### Real-World: Sanitize Before Logging

```typescript
// Remove sensitive data before logging
const request = {
  userId: 123,
  email: 'alice@example.com',
  password: 'hunter2',
  creditCard: '4111-1111-1111-1111',
  apiKey: 'sk_live_...',
  timestamp: 1234567890
}

const sanitized = mask(request, ['userId', 'email', 'timestamp'])
logger.info('User request', sanitized)
// Logs: { userId: 123, email: 'alice@example.com', timestamp: 1234567890 }
```

### Real-World: API Response Filtering

```typescript
// Only send necessary fields to client
const dbUser = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  passwordHash: '$2b$10$...',
  salt: 'random_salt',
  internalNotes: 'VIP customer',
  createdAt: new Date(),
  updatedAt: new Date()
}

const publicUser = mask(dbUser, ['id', 'username', 'email', 'createdAt'])
// Only safe fields exposed to client
```

### Real-World: GDPR Data Minimization

```typescript
// Only collect necessary analytics data
const userAction = {
  userId: 123,
  fullName: 'Alice Smith',
  email: 'alice@example.com',
  ipAddress: '192.168.1.1',
  action: 'purchase',
  amount: 99.99,
  timestamp: Date.now()
}

// GDPR: collect minimal data
const analytics = mask(userAction, ['action', 'amount', 'timestamp'])
// No PII stored in analytics
```

### mask vs Remeda.pick

```typescript
// Same behavior, different semantic intent

// Remeda.pick: "I want these properties"
const selected = R.pick(obj, ['id', 'name'])

// Object.mask: "I only allow these properties (security)"
const safe = mask(obj, ['id', 'name'])

// Use mask when security/privacy is the concern
```

### In Pipelines

```typescript
// Complete sanitization pipeline
const sanitizeUser = (dbUser: DbUser) =>
  pipe(
    dbUser,
    mask(['id', 'username', 'email', 'avatar', 'role']),
    stripUndefined,
    rename({ username: 'displayName' })
  )
```

---

## deepMerge

Deep merge multiple objects with configurable array handling strategies.

### Signature

```typescript
function deepMerge(
  objects: readonly PlainObject[],
  options?: DeepMergeOptions
): PlainObject

interface DeepMergeOptions {
  arrayStrategy?: 'replace' | 'concat' | 'merge'  // Default: 'replace'
  customMerge?: (key: string, target: unknown, source: unknown) => unknown
}
```

### Real-World: Configuration Merging (Next.js Style)

```typescript
// next.config.js pattern
const defaultConfig = {
  images: {
    domains: ['example.com'],
    deviceSizes: [640, 750, 828, 1080]
  },
  webpack: { /* defaults */ },
  env: {
    API_URL: 'https://api.example.com'
  }
}

const userConfig = {
  images: {
    domains: ['cdn.example.com'],  // Should merge, not replace
    formats: ['image/avif', 'image/webp']
  },
  env: {
    API_URL: 'https://prod.example.com',  // Override
    DEBUG: 'true'
  }
}

const finalConfig = deepMerge([defaultConfig, userConfig])
// {
//   images: {
//     domains: ['cdn.example.com'],  // Replaced (default strategy)
//     deviceSizes: [640, 750, 828, 1080],  // Preserved
//     formats: ['image/avif', 'image/webp']  // Added
//   },
//   webpack: { /* defaults */ },
//   env: {
//     API_URL: 'https://prod.example.com',
//     DEBUG: 'true'
//   }
// }
```

### Array Strategy: replace (default)

```typescript
const obj1 = { tags: ['javascript', 'typescript'] }
const obj2 = { tags: ['react'] }

deepMerge([obj1, obj2])
// { tags: ['react'] }  ← Source replaces target
```

### Array Strategy: concat

```typescript
// Useful for accumulating arrays
deepMerge([obj1, obj2], { arrayStrategy: 'concat' })
// { tags: ['javascript', 'typescript', 'react'] }
```

### Array Strategy: merge

```typescript
// Merge arrays by index (useful for configs)
const defaults = {
  plugins: [
    { name: 'plugin-a', enabled: true },
    { name: 'plugin-b', enabled: true }
  ]
}

const overrides = {
  plugins: [
    { enabled: false }  // Disable first plugin
  ]
}

deepMerge([defaults, overrides], { arrayStrategy: 'merge' })
// {
//   plugins: [
//     { name: 'plugin-a', enabled: false },  ← Merged
//     { name: 'plugin-b', enabled: true }
//   ]
// }
```

### Custom Merge Function

```typescript
// Advanced: custom merge logic per key
const obj1 = { count: 5, views: 10 }
const obj2 = { count: 3, views: 20 }

deepMerge([obj1, obj2], {
  customMerge: (key, target, source) => {
    // Add counts instead of replacing
    if (key === 'count') {
      return (target as number) + (source as number)
    }
    // Max for views
    if (key === 'views') {
      return Math.max(target as number, source as number)
    }
    return source  // Default: source wins
  }
})
// { count: 8, views: 20 }
```

### Real-World: Merge User Preferences Across Devices

```typescript
const desktopPrefs = {
  theme: 'dark',
  editor: {
    fontSize: 14,
    tabSize: 2,
    fontFamily: 'Monaco'
  },
  shortcuts: ['cmd+s', 'cmd+b']
}

const mobilePrefs = {
  theme: 'light',  // Override
  editor: {
    fontSize: 16,  // Override
    lineNumbers: true  // Add
  },
  shortcuts: ['tap-save']  // Replace
}

const merged = deepMerge([desktopPrefs, mobilePrefs])
// {
//   theme: 'light',
//   editor: {
//     fontSize: 16,
//     tabSize: 2,
//     fontFamily: 'Monaco',
//     lineNumbers: true
//   },
//   shortcuts: ['tap-save']
// }
```

### Merging Multiple Objects

```typescript
// Merge environment-specific configs
const base = { /* base config */ }
const development = { /* dev overrides */ }
const local = { /* local overrides */ }

// Later configs override earlier ones
const config = deepMerge([base, development, local])
```

---

## Comparison Table

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `flatten` | Nested object | Flat object | Database queries, URL params, logging |
| `unflatten` | Flat object | Nested object | Env vars → config, Redis → object |
| `rename` | Object + mapping | Renamed object | API normalization, schema migration |
| `mask` | Object + allowlist | Filtered object | Security, logging, GDPR compliance |
| `deepMerge` | Array of objects | Merged object | Config files, user preferences |

---

## When to Use Which

### Decision Tree

```
Need to transform object structure?
│
├─ Nested → Flat?
│  → Use flatten()
│
├─ Flat → Nested?
│  → Use unflatten()
│
├─ Rename keys?
│  │
│  ├─ Few keys, known mapping?
│  │  → Use rename()
│  │
│  └─ All keys, pattern-based?
│     → Use mapKeys() (see Transformation guide)
│
├─ Remove sensitive fields?
│  │
│  ├─ Security/privacy concern?
│  │  → Use mask() (allowlist)
│  │
│  └─ Just want subset?
│     → Use Remeda.pick()
│
└─ Merge multiple objects?
   │
   ├─ Shallow merge OK?
   │  → Use spread: { ...a, ...b }
   │
   └─ Need deep merge?
      → Use deepMerge()
```

### Common Patterns

```typescript
// Pattern 1: API response → DB schema
pipe(
  apiResponse,
  flatten(),
  rename(keyMapping),
  unflatten(),
  validateShape(schema)
)

// Pattern 2: Sanitize for logging
pipe(
  request,
  mask(safeFields),
  stripUndefined,
  flatten({ separator: '.' })
)

// Pattern 3: Config merging
pipe(
  [defaultConfig, envConfig, userConfig],
  deepMerge({ arrayStrategy: 'concat' }),
  validateShape(configSchema)
)

// Pattern 4: Form data → API payload
pipe(
  formData,
  stripUndefined,
  rename(apiKeyMapping),
  mask(allowedFields)
)
```

### Performance Considerations

```typescript
// ⚠️ flatten/unflatten on large objects
// For very deep/large objects, consider:
flatten(obj, { maxDepth: 3 })  // Limit depth

// ✅ mask is O(n) where n = number of keys
// More efficient than filterKeys for known allowlist

// ✅ deepMerge is optimized for typical configs
// For huge objects with many levels, profile first

// ✅ rename is O(n) - efficient for any size
```

---

## Next Steps

- **[Safe Access](./02-safe-access.md)** - getPath, setPath, updatePath for nested operations
- **[Validation](./03-validation.md)** - validateShape, stripUndefined, compact
- **[Transformation](./04-transformation.md)** - mapKeys, mapValues, filtering
- **[Patterns & Recipes](./05-patterns.md)** - Complete real-world solutions
