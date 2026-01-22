# Validation: Runtime Type Checking and Cleanup

Validation functions ensure data integrity through runtime type checking and cleanup operations. These utilities help you validate unknown data, remove unwanted values, and ensure objects meet expected schemas.

## Table of Contents

1. [validateShape](#validateshape)
2. [stripUndefined](#stripundefined)
3. [compact](#compact)
4. [When to Use Which](#when-to-use-which)
5. [Integration with Validation Module](#integration-with-validation-module)

---

## validateShape

Runtime validation that checks if an object conforms to a schema, returning `Result<T, ObjectError>`.

### Signature

```typescript
function validateShape<T extends PlainObject>(
  obj: unknown,
  schema: ObjectSchema<T>
): Result<T, ObjectError>

type ObjectSchema<T> = {
  [K in keyof T]: Validator<T[K]> | ObjectSchema<any>
}

type Validator<T> = (value: unknown) => value is T

interface ObjectError {
  code: 'VALIDATION_ERROR' | 'PATH_NOT_FOUND' | 'INVALID_PATH'
  message: string
  path?: ObjectPath
  cause?: unknown
}
```

### Why validateShape?

```typescript
// ❌ Without validation: runtime errors
function processConfig(config: unknown) {
  const host = config.database.host  // TypeError if config.database doesn't exist!
  const port = config.database.port  // TypeError!
  return { host, port }
}

// ✅ With validateShape: safe, typed
const configSchema = {
  database: {
    host: (v): v is string => typeof v === 'string',
    port: (v): v is number => typeof v === 'number'
  }
}

const result = validateShape(config, configSchema)
if (isOk(result)) {
  // TypeScript knows result.value is typed!
  const { database } = result.value
  console.log(database.host, database.port)
}
```

### Real-World: API Response Validation

```typescript
// GitHub API response validation
const githubUserSchema = {
  login: (v): v is string => typeof v === 'string',
  id: (v): v is number => typeof v === 'number',
  avatar_url: (v): v is string => typeof v === 'string' && v.startsWith('http'),
  public_repos: (v): v is number => typeof v === 'number' && v >= 0
}

const validateGitHubUser = (response: unknown) =>
  pipe(
    response,
    (r) => validateShape(r, githubUserSchema),
    Result.map(user => ({
      username: user.login,
      id: user.id,
      avatar: user.avatar_url,
      repos: user.public_repos
    }))
  )
```

### Real-World: Environment Variable Validation

```typescript
const envSchema = {
  NODE_ENV: (v): v is string => ['development', 'production', 'test'].includes(v as string),
  PORT: (v): v is number => typeof v === 'number' && v > 0 && v < 65536,
  DATABASE_URL: (v): v is string => typeof v === 'string' && v.length > 0,
  API_KEY: (v): v is string => typeof v === 'string' && v.length === 32
}

const loadEnv = () => {
  const result = validateShape(process.env, envSchema)

  return match(result, {
    onOk: (env) => env,
    onErr: (error) => {
      console.error(`Invalid environment: ${error.message}`, error.path)
      process.exit(1)
    }
  })
}
```

### Nested Schema Validation

```typescript
// Validate nested structures
const userSchema = {
  id: (v): v is number => typeof v === 'number',
  profile: {
    name: (v): v is string => typeof v === 'string' && v.length > 0,
    email: (v): v is string => typeof v === 'string' && v.includes('@'),
    age: (v): v is number => typeof v === 'number' && v >= 0 && v <= 150
  },
  settings: {
    theme: (v): v is string => ['light', 'dark'].includes(v as string),
    notifications: (v): v is boolean => typeof v === 'boolean'
  }
}

const result = validateShape(unknownData, userSchema)
// Returns Err with path if nested validation fails:
// { code: 'VALIDATION_ERROR', path: ['profile', 'email'], message: '...' }
```

### Integration with Predicate Module

```typescript
import { isString, isNumber, isEmail } from 'receta/predicate'

const userSchema = {
  name: isString,
  email: isEmail,
  age: isNumber
}

validateShape(data, userSchema)
```

### Custom Validators

```typescript
// Build reusable validators
const isPositiveInt = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v > 0

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0

const isValidUrl = (v: unknown): v is string =>
  typeof v === 'string' && /^https?:\/\/.+/.test(v)

const apiSchema = {
  endpoint: isValidUrl,
  timeout: isPositiveInt,
  apiKey: isNonEmptyString
}
```

### Error Handling

```typescript
const handleValidationError = (error: ObjectError) => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return `Validation failed at ${error.path?.join('.')}: ${error.message}`

    case 'PATH_NOT_FOUND':
      return `Required path not found: ${error.path?.join('.')}`

    default:
      return `Unknown error: ${error.message}`
  }
}

const result = validateShape(data, schema)
if (isErr(result)) {
  console.error(handleValidationError(result.error))
}
```

---

## stripUndefined

Removes all properties with `undefined` values from an object (shallow operation).

### Signature

```typescript
function stripUndefined<T extends PlainObject>(obj: T): Partial<T>
```

### Why stripUndefined?

```typescript
// ❌ Sending undefined to API can cause issues
const payload = {
  name: 'Alice',
  email: undefined,  // API might reject or misinterpret
  phone: undefined
}

fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(payload)  // Includes undefined!
})

// ✅ Clean payload before sending
const cleanPayload = stripUndefined(payload)
// { name: 'Alice' }
```

### Real-World: Form Data Sanitization

```typescript
// React form with optional fields
const FormComponent = () => {
  const [formData, setFormData] = useState({
    name: 'Alice',
    email: 'alice@example.com',
    phone: undefined,  // Optional field not filled
    company: undefined  // Optional field not filled
  })

  const handleSubmit = async () => {
    const cleanData = pipe(
      formData,
      stripUndefined,
      (data) => validateShape(data, formSchema),
      Result.flatMap(saveToApi)
    )
  }
}
```

### Real-World: Query String Building

```typescript
// Build URL query params, omit undefined
const buildQueryString = (params: Record<string, unknown>) => {
  const clean = stripUndefined(params)
  return new URLSearchParams(clean as Record<string, string>).toString()
}

const url = buildQueryString({
  search: 'receta',
  category: undefined,  // Not set, should be omitted
  page: 1,
  sortBy: undefined  // Not set, should be omitted
})
// => "search=receta&page=1"
```

### Real-World: Partial Updates

```typescript
// Only send changed fields to API
const updateUser = (userId: string, changes: Partial<User>) => {
  const payload = stripUndefined(changes)

  // Only sends defined fields
  return fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

// Usage
updateUser('123', {
  name: 'Alice Smith',  // Changed
  email: undefined,     // Not changed, omit
  age: undefined        // Not changed, omit
})
```

### Keeps Other Falsy Values

```typescript
const data = {
  count: 0,           // Kept (falsy but not undefined)
  active: false,      // Kept (falsy but not undefined)
  name: '',           // Kept (falsy but not undefined)
  email: null,        // Kept (not undefined)
  phone: undefined    // Removed
}

stripUndefined(data)
// { count: 0, active: false, name: '', email: null }
```

### In Pipelines

```typescript
// Complete sanitization pipeline
const sanitizeFormData = (formData: FormData) =>
  pipe(
    formData,
    stripUndefined,              // Remove undefined
    filterValues((v) => v !== ''),  // Remove empty strings
    mask(allowedFields),         // Only allowed fields
    validateShape(schema)        // Validate structure
  )
```

---

## compact

Removes all nullish (`null` or `undefined`) values from an object (shallow operation).

### Signature

```typescript
function compact<T extends PlainObject>(obj: T): Partial<T>
```

### Why compact?

```typescript
// ❌ Nullish values can cause issues downstream
const userData = {
  name: 'Alice',
  email: null,      // User cleared email
  phone: undefined, // Never provided
  age: 30
}

// ✅ Remove all nullish values
const clean = compact(userData)
// { name: 'Alice', age: 30 }
```

### stripUndefined vs compact

```typescript
const data = {
  a: undefined,
  b: null,
  c: 0,
  d: false,
  e: ''
}

stripUndefined(data)
// { b: null, c: 0, d: false, e: '' }  ← Keeps null

compact(data)
// { c: 0, d: false, e: '' }  ← Removes both null and undefined
```

### Real-World: Database Query Building

```typescript
// Build WHERE clause, skip nullish filters
const buildWhereClause = (filters: {
  status?: string | null
  category?: string | null
  minPrice?: number | null
}) => {
  const activeFilters = compact(filters)

  return Object.entries(activeFilters)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(' AND ')
}

buildWhereClause({
  status: 'active',
  category: null,    // Skip this
  minPrice: undefined // Skip this
})
// => "status = 'active'"
```

### Real-World: GraphQL Query Variables

```typescript
// Remove nullish variables before sending GraphQL query
const queryUsers = (filters: UserFilters) => {
  const variables = compact(filters)

  return graphql`
    query Users($status: String, $role: String, $search: String) {
      users(status: $status, role: $role, search: $search) {
        id
        name
      }
    }
  `({
    variables  // Only includes non-nullish values
  })
}
```

### Real-World: localStorage Cleanup

```typescript
// Save only meaningful preferences
const savePreferences = (prefs: UserPreferences) => {
  const meaningful = pipe(
    prefs,
    compact,                    // Remove nullish
    filterValues((v) => v !== '') // Remove empty strings
  )

  localStorage.setItem('preferences', JSON.stringify(meaningful))
}
```

### Preserves Zero, False, Empty String

```typescript
// compact only removes nullish, not other falsy values
const data = {
  count: 0,        // ✅ Kept (valid number)
  enabled: false,  // ✅ Kept (valid boolean)
  title: '',       // ✅ Kept (valid string)
  notes: null,     // ❌ Removed (nullish)
  tags: undefined  // ❌ Removed (nullish)
}

compact(data)
// { count: 0, enabled: false, title: '' }
```

### In Pipelines

```typescript
// Complete data cleanup
const prepareAnalytics = (rawData: RawAnalytics) =>
  pipe(
    rawData,
    compact,                      // Remove nullish
    flatten(),                    // Flatten for storage
    filterKeys((k) => !k.includes('_internal')) // Remove internal keys
  )
```

---

## When to Use Which

### Decision Tree

```
Need to validate or clean object?
│
├─ Need runtime type checking?
│  → Use validateShape() → Result<T, ObjectError>
│
├─ Have optional form fields?
│  │
│  ├─ Only remove undefined?
│  │  → Use stripUndefined()
│  │
│  └─ Remove both null and undefined?
│     → Use compact()
│
└─ Building API payload?
   └─ Use stripUndefined() + validateShape()
```

### Comparison Table

| Function | Removes | Returns | Use Case |
|----------|---------|---------|----------|
| `validateShape` | - | `Result<T, E>` | Type checking unknown data |
| `stripUndefined` | `undefined` | `Partial<T>` | Form data, API payloads |
| `compact` | `null` + `undefined` | `Partial<T>` | Query builders, cleanup |

### Common Patterns

```typescript
// Pattern 1: Form submission
pipe(
  formData,
  stripUndefined,
  validateShape(schema),
  Result.flatMap(submitToApi)
)

// Pattern 2: Query building
pipe(
  filters,
  compact,
  buildWhereClause
)

// Pattern 3: API response cleanup
pipe(
  apiResponse,
  compact,
  validateShape(responseSchema),
  Result.map(normalizeData)
)

// Pattern 4: Configuration loading
pipe(
  rawConfig,
  stripUndefined,
  validateShape(configSchema),
  Result.unwrapOr(defaultConfig)
)
```

---

## Integration with Validation Module

The Object module's `validateShape` is designed for **structural validation** (type checking), while the Validation module handles **business logic validation** (error accumulation).

### When to Use Object.validateShape

```typescript
// ✅ Type checking unknown API responses
const result = validateShape(apiResponse, userSchema)
// => Result<User, ObjectError> (fail-fast)

// ✅ Runtime type guards
if (isOk(validateShape(data, schema))) {
  // TypeScript now knows the shape!
}
```

### When to Use Validation Module

```typescript
import { schema, required, email, minLength } from 'receta/validation'

// ✅ Business rules with error accumulation (fail-slow)
const validateUserForm = schema({
  name: pipe(required, minLength(3)),
  email: pipe(required, email),
  age: pipe(required, min(18))
})

const result = validateUserForm(formData)
// => Invalid(['Name too short', 'Invalid email', 'Must be 18+'])
//    ↑ All errors at once
```

### Using Both Together

```typescript
// Step 1: Structural validation (fail-fast)
const structuralCheck = validateShape(unknownData, typeSchema)

// Step 2: Business validation (fail-slow)
const businessCheck = pipe(
  structuralCheck,
  Result.toValidation,
  Validation.flatMap(validateBusinessRules)
)
```

---

## Next Steps

- **[Transformation](./04-transformation.md)** - mapKeys, mapValues, filterKeys, filterValues
- **[Patterns & Recipes](./05-patterns.md)** - Complete real-world solutions
- **[API Reference](./07-api-reference.md)** - Quick lookup and cheat sheets
