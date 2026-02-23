/**
 * Object Module Usage Examples
 *
 * Real-world examples demonstrating Object module utilities for:
 * - API response normalization
 * - Form data handling
 * - Configuration management
 * - Security and sanitization
 * - Database operations
 *
 * Run with: bun run examples/object-usage.ts
 */

import * as R from 'remeda'
import * as Obj from '../src/object'
import { isOk, isErr } from '../src/result'
import { isSome, unwrapOr } from '../src/option'

console.log('='.repeat(60))
console.log('Object Module Usage Examples')
console.log('='.repeat(60))

// =============================================================================
// Example 1: API Response Normalization (GitHub API)
// =============================================================================
console.log('\n📦 Example 1: GitHub API Response Normalization\n')

const githubApiResponse = {
  login: 'alice',
  avatar_url: 'https://github.com/alice.png',
  public_repos: 42,
  created_at: '2015-01-01T00:00:00Z',
  plan: {
    name: 'pro',
    collaborators: 10,
  },
}

// Normalize snake_case to camelCase
const normalizedUser = R.pipe(
  githubApiResponse,
  Obj.mapKeys((key) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())),
  Obj.rename({
    login: 'username',
    createdAt: 'joinedAt',
  })
)

console.log('Original GitHub API response:', githubApiResponse)
console.log('Normalized:', normalizedUser)

// =============================================================================
// Example 2: Safe Nested Access with Configuration
// =============================================================================
console.log('\n🔒 Example 2: Safe Configuration Access\n')

const appConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    credentials: {
      user: 'admin',
      password: 'secret',
    },
  },
  api: {
    timeout: 30000,
  },
}

// Safe access that returns Option
const dbHost = R.pipe(
  appConfig,
  Obj.getPath<string>(['database', 'host']),
  unwrapOr('default-host')
)

const dbPort = R.pipe(
  appConfig,
  Obj.getPath<number>(['database', 'port']),
  unwrapOr(3000)
)

// Missing path returns None
const missingValue = Obj.getPath(appConfig, ['api', 'key'])

console.log('Database host:', dbHost)
console.log('Database port:', dbPort)
console.log('Missing API key:', isSome(missingValue) ? 'Found' : 'Not found (None)')

// =============================================================================
// Example 3: Immutable Nested Updates
// =============================================================================
console.log('\n✏️  Example 3: Immutable Nested Updates\n')

const userState = {
  profile: {
    name: 'Alice',
    views: 10,
  },
  settings: {
    theme: 'light',
  },
}

// Update nested value immutably
const updatedState = R.pipe(
  userState,
  (state) => Obj.setPath(state, ['profile', 'name'], 'Alice Smith'),
  (state) => Obj.updatePath(state, ['profile', 'views'], (n: number) => n + 1),
  (state) => Obj.setPath(state, ['settings', 'theme'], 'dark')
)

console.log('Original state:', userState)
console.log('Updated state:', updatedState)
console.log('Original unchanged:', userState.profile.views === 10)

// =============================================================================
// Example 4: Flatten and Unflatten for URL Params
// =============================================================================
console.log('\n🔗 Example 4: Flatten for URL Parameters\n')

const searchFilters = {
  category: 'electronics',
  price: {
    min: 100,
    max: 500,
  },
  features: {
    wireless: true,
    waterproof: false,
  },
}

// Flatten for URL query string
const flatFilters = Obj.flatten(searchFilters, { separator: '_' })
console.log('Original filters:', searchFilters)
console.log('Flattened for URL:', flatFilters)

// Reconstruct from flat
const reconstructed = Obj.unflatten(flatFilters, { separator: '_' })
console.log('Reconstructed:', reconstructed)

// =============================================================================
// Example 5: Security - Mask Sensitive Data
// =============================================================================
console.log('\n🛡️  Example 5: Security - Mask Sensitive Data\n')

const dbUser = {
  id: 123,
  username: 'alice',
  email: 'alice@example.com',
  passwordHash: '$2b$10$...',
  creditCard: '4111-1111-1111-1111',
  apiKey: 'sk_live_secret',
  createdAt: '2024-01-01',
}

// Only expose safe fields (allowlist approach)
const publicUser = Obj.mask(dbUser, ['id', 'username', 'email', 'createdAt'])

console.log('Database user (sensitive):', Object.keys(dbUser))
console.log('Public user (safe):', publicUser)

// =============================================================================
// Example 6: Form Data Sanitization
// =============================================================================
console.log('\n📝 Example 6: Form Data Sanitization\n')

const formSubmission = {
  name: 'Alice',
  email: 'alice@example.com',
  phone: undefined, // Optional field not filled
  company: '', // Empty string
  notes: null, // Cleared field
  agreeToTerms: true,
}

// Clean form data before sending to API
const cleanFormData = R.pipe(
  formSubmission,
  Obj.stripUndefined, // Remove undefined
  Obj.filterValues((v) => v !== ''), // Remove empty strings
  Obj.compact // Remove nullish
)

console.log('Raw form data:', formSubmission)
console.log('Cleaned form data:', cleanFormData)

// =============================================================================
// Example 7: Deep Merge Configurations
// =============================================================================
console.log('\n⚙️  Example 7: Deep Merge Configurations\n')

const defaultConfig = {
  api: {
    url: 'https://api.example.com',
    timeout: 30000,
  },
  features: {
    analytics: false,
    debugMode: false,
  },
  plugins: ['essential'],
}

const envConfig = {
  api: {
    url: 'https://prod.example.com', // Override
    retries: 3, // Add new field
  },
  features: {
    analytics: true, // Override
  },
}

const userConfig = {
  features: {
    debugMode: true, // Override
  },
  plugins: ['custom'], // Replace array (default strategy)
}

// Merge with later configs taking precedence
const finalConfig = Obj.deepMerge([defaultConfig, envConfig, userConfig])

console.log('Default config:', defaultConfig)
console.log('Environment config:', envConfig)
console.log('User config:', userConfig)
console.log('Final merged config:', finalConfig)

// Merge with array concatenation
const mergedWithConcat = Obj.deepMerge([defaultConfig, userConfig], {
  arrayStrategy: 'concat',
})
console.log('Merged with concat strategy:', mergedWithConcat.plugins)

// =============================================================================
// Example 8: Runtime Validation
// =============================================================================
console.log('\n✅ Example 8: Runtime Type Validation\n')

const apiResponse: unknown = {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
}

// Define schema with type guards
const userSchema = {
  id: (v: unknown): v is number => typeof v === 'number',
  name: (v: unknown): v is string => typeof v === 'string',
  email: (v: unknown): v is string => typeof v === 'string' && v.includes('@'),
  age: (v: unknown): v is number => typeof v === 'number' && v >= 0 && v <= 150,
}

const validationResult = Obj.validateShape(apiResponse, userSchema)

if (isOk(validationResult)) {
  console.log('✓ Validation passed:', validationResult.value)
} else {
  console.log('✗ Validation failed:', validationResult.error)
}

// Invalid data example
const invalidData: unknown = {
  id: '123', // Wrong type
  name: 'Bob',
  email: 'invalid-email', // No @
  age: 200, // Out of range
}

const invalidResult = Obj.validateShape(invalidData, userSchema)
console.log('Invalid data result:', isErr(invalidResult) ? 'Failed as expected' : 'Unexpected pass')

// =============================================================================
// Example 9: Complex Pipeline - API to Database
// =============================================================================
console.log('\n🔄 Example 9: Complete API Normalization Pipeline\n')

const stripeWebhookPayload: unknown = {
  id: 'evt_123',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_456',
      amount: 2000,
      currency: 'usd',
      customer: 'cus_789',
      metadata: {
        order_id: 'ord_999',
        customer_tier: 'premium',
      },
    },
  },
}

// Complete normalization pipeline
const normalizedPayment = R.pipe(
  stripeWebhookPayload,
  (obj) => Obj.flatten(obj), // Flatten nested structure
  (obj) =>
    Obj.filterKeys(obj, (key) =>
      // Only keep relevant fields
      ['data.object.id', 'data.object.amount', 'data.object.currency', 'data.object.metadata'].some(
        (prefix) => key.startsWith(prefix)
      )
    ),
  (obj) =>
    Obj.rename(obj, {
      // Normalize key names
      'data.object.id': 'paymentId',
      'data.object.amount': 'amount',
      'data.object.currency': 'currency',
      'data.object.metadata.order_id': 'orderId',
      'data.object.metadata.customer_tier': 'customerTier',
    }),
  (obj) => Obj.unflatten(obj), // Reconstruct clean structure
  (obj) => Obj.compact(obj) // Remove any nullish values
)

console.log('Stripe webhook payload (complex nested structure)')
console.log('Normalized for database:', normalizedPayment)

// =============================================================================
// Example 10: Environment Variables to Config
// =============================================================================
console.log('\n🌍 Example 10: Environment Variables to Config\n')

const envVars = {
  APP_DATABASE_HOST: 'localhost',
  APP_DATABASE_PORT: '5432',
  APP_API_KEY: 'secret',
  APP_API_TIMEOUT: '30000',
  APP_FEATURES_ANALYTICS: 'true',
  APP_FEATURES_DEBUG: 'false',
}

// Convert env vars to nested config
const envConfig2 = R.pipe(
  envVars,
  (vars) => Obj.filterKeys(vars, (key) => key.startsWith('APP_')), // Only app-specific vars
  (vars) => Obj.mapKeys(vars, (key) => key.replace(/^APP_/, '').toLowerCase()), // Remove prefix
  (vars) => Obj.unflatten(vars, { separator: '_' }), // Convert to nested structure
  (config) => ({
    ...config,
    // Parse string values to proper types
    database: {
      ...(config.database as any),
      port: parseInt((config.database as any).port, 10),
    },
    api: {
      ...(config.api as any),
      timeout: parseInt((config.api as any).timeout, 10),
    },
    features: {
      ...(config.features as any),
      analytics: (config.features as any).analytics === 'true',
      debug: (config.features as any).debug === 'true',
    },
  })
)

console.log('Environment variables:', Object.keys(envVars))
console.log('Parsed config:', envConfig2)

// =============================================================================
// Example 11: Key/Value Transformation
// =============================================================================
console.log('\n🔀 Example 11: Bulk Key/Value Transformations\n')

const prices = {
  apple: 1.5,
  banana: 0.5,
  orange: 2.0,
  grape: 3.0,
}

// Apply 10% discount
const discountedPrices = Obj.mapValues(prices, (price) =>
  Math.round(price * 0.9 * 100) / 100
)

// Filter expensive items
const affordableItems = Obj.filterValues(prices, (price) => price < 2.0)

// Uppercase all keys
const upperCaseKeys = Obj.mapKeys(prices, (key) => key.toUpperCase())

console.log('Original prices:', prices)
console.log('After 10% discount:', discountedPrices)
console.log('Affordable items:', affordableItems)
console.log('Uppercase keys:', upperCaseKeys)

// =============================================================================
// Example 12: GDPR Compliance - Data Minimization
// =============================================================================
console.log('\n🔐 Example 12: GDPR Compliance - Data Minimization\n')

const userEvent = {
  userId: 123,
  userName: 'Alice Smith',
  email: 'alice@example.com',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  action: 'purchase',
  productId: 'prod_456',
  amount: 99.99,
  timestamp: Date.now(),
}

// GDPR: Only store minimal necessary data for analytics
const gdprCompliantAnalytics = Obj.mask(userEvent, [
  'action',
  'productId',
  'amount',
  'timestamp',
])

console.log('User event (contains PII):', Object.keys(userEvent))
console.log('GDPR-compliant analytics (no PII):', gdprCompliantAnalytics)

// =============================================================================
console.log('\n' + '='.repeat(60))
console.log('✅ All examples completed successfully!')
console.log('='.repeat(60) + '\n')
