# Transformation: Mapping and Filtering Operations

Transformation functions allow you to systematically transform or filter object keys and values. These operations are essential for normalizing data, applying bulk transformations, and filtering unwanted properties.

## Table of Contents

1. [mapKeys](#mapkeys)
2. [mapValues](#mapvalues)
3. [filterKeys](#filterkeys)
4. [filterValues](#filtervalues)
5. [Comparison](#comparison)

---

## mapKeys

Transform all keys in an object using a mapping function.

```typescript
function mapKeys<T>(
  obj: T,
  fn: (key: string, value: T[keyof T]) => string
): PlainObject
```

### Real-World: snake_case → camelCase

```typescript
// API response normalization
const apiResponse = {
  user_id: 123,
  first_name: 'Alice',
  last_name: 'Smith',
  email_address: 'alice@example.com',
  created_at: '2024-01-01'
}

const normalized = mapKeys(apiResponse, (key) =>
  key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
)
// { userId: 123, firstName: 'Alice', lastName: 'Smith', ... }
```

### Real-World: Prefixing for Namespacing

```typescript
// Add namespace to avoid conflicts
const config = { host: 'localhost', port: 5432 }
const namespaced = mapKeys(config, (key) => `db_${key}`)
// { db_host: 'localhost', db_port: 5432 }
```

### Conditional Transformation

```typescript
// Transform only numeric values' keys
mapKeys(data, (key, value) =>
  typeof value === 'number' ? key.toUpperCase() : key
)
```

---

## mapValues

Transform all values in an object using a mapping function.

```typescript
function mapValues<T, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U>
```

### Real-World: Price Calculations

```typescript
const prices = {
  apple: 1.50,
  banana: 0.50,
  orange: 2.00
}

// Apply 10% tax
const withTax = mapValues(prices, (price) =>
  Math.round(price * 1.1 * 100) / 100
)
// { apple: 1.65, banana: 0.55, orange: 2.20 }
```

### Real-World: Type Conversions

```typescript
// Convert all values to strings
const config = { port: 5432, timeout: 30000, retries: 3 }
const envVars = mapValues(config, (v) => String(v))
// { port: '5432', timeout: '30000', retries: '3' }
```

### Access Key in Transformation

```typescript
// Format with key context
mapValues(user, (value, key) => `${key}: ${value}`)
// { name: 'name: Alice', age: 'age: 30' }
```

---

## filterKeys

Filter object by keeping only keys that match a predicate.

```typescript
function filterKeys<T>(
  obj: T,
  predicate: (key: string) => boolean
): Partial<T>
```

### Real-World: Remove Private Fields

```typescript
const obj = {
  id: 1,
  name: 'Alice',
  _internal: 'hidden',
  _cache: {},
  email: 'alice@example.com'
}

const public = filterKeys(obj, (key) => !key.startsWith('_'))
// { id: 1, name: 'Alice', email: 'alice@example.com' }
```

### Real-World: Extract by Pattern

```typescript
// Get only API-related config
const config = {
  api_key: 'secret',
  api_url: 'https://api.com',
  api_timeout: 30000,
  db_host: 'localhost',
  db_port: 5432
}

const apiConfig = filterKeys(config, (key) => key.startsWith('api_'))
// { api_key: 'secret', api_url: 'https://api.com', api_timeout: 30000 }
```

---

## filterValues

Filter object by keeping only entries whose values match a predicate.

```typescript
function filterValues<T>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T>
```

### Real-World: Filter by Score Threshold

```typescript
const scores = {
  alice: 95,
  bob: 65,
  charlie: 88,
  diana: 72
}

const passing = filterValues(scores, (score) => score >= 70)
// { alice: 95, charlie: 88, diana: 72 }
```

### Real-World: Remove Empty Values

```typescript
const formData = {
  name: 'Alice',
  email: '',
  phone: '',
  company: 'Acme Inc'
}

const filled = filterValues(formData, (v) => v !== '')
// { name: 'Alice', company: 'Acme Inc' }
```

### With Key Context

```typescript
// Filter based on key-value relationship
filterValues(inventory, (qty, product) =>
  product.startsWith('premium_') ? qty > 10 : qty > 0
)
```

---

## Comparison

| Function | Transforms | Use Case |
|----------|-----------|----------|
| `mapKeys` | All keys | Normalize naming (camelCase, prefixing) |
| `mapValues` | All values | Calculations, type conversions |
| `filterKeys` | Keys (keep matching) | Remove private/internal fields |
| `filterValues` | Values (keep matching) | Threshold filtering, remove empty |

### Combined Example

```typescript
// Complete transformation pipeline
const process = (apiData: unknown) =>
  pipe(
    apiData,
    mapKeys((key) => toCamelCase(key)),     // Normalize keys
    filterKeys((key) => !key.startsWith('_')), // Remove private
    mapValues((v) => typeof v === 'string' ? v.trim() : v), // Trim strings
    filterValues((v) => v != null),         // Remove nullish
    compact                                 // Final cleanup
  )
```

---

## Next Steps

- **[Patterns & Recipes](./05-patterns.md)** - Real-world solutions
- **[Migration Guide](./06-migration.md)** - From Lodash to Receta
- **[API Reference](./07-api-reference.md)** - Quick lookup
