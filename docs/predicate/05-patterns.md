# Common Patterns & Recipes

> Complete, copy-paste-ready solutions for real-world scenarios.

## Table of Contents

1. [E-Commerce Filtering](#e-commerce-filtering)
2. [User Permissions & Access Control](#user-permissions--access-control)
3. [API Filtering (GitHub/Stripe Style)](#api-filtering-githubstripe-style)
4. [Form Validation](#form-validation)
5. [Search & Query Functionality](#search--query-functionality)
6. [Database-Like Queries](#database-like-queries)
7. [Batch Processing & Data Pipelines](#batch-processing--data-pipelines)
8. [Content Moderation](#content-moderation)

---

## E-Commerce Filtering

### Product Search & Discovery

```typescript
import * as R from 'remeda'
import { where, between, gt, gte, eq, oneOf, by, and, or } from 'receta/predicate'

interface Product {
  id: string
  name: string
  price: number
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
  tags: string[]
  brand: string
  discount: number  // 0.0 to 1.0
}

// Price slider: $50-200
const priceRange = where({
  price: between(50, 200)
})

// Quality products (rating >= 4, enough reviews)
const qualityProduct = where({
  rating: gte(4.0),
  reviewCount: gte(10)
})

// Available products
const available = where({
  inStock: eq(true)
})

// Electronics category
const electronics = where({
  category: eq('electronics')
})

// On sale (discount > 0)
const onSale = where({
  discount: gt(0)
})

// Combine for "Best Electronics Deals"
const bestElectronicsDeals = and(
  electronics,
  qualityProduct,
  available,
  onSale,
  priceRange
)

const deals = R.filter(products, bestElectronicsDeals)
```

### Dynamic Search Filters

```typescript
interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  brands?: string[]
  onlyInStock?: boolean
  tags?: string[]
}

const buildProductFilter = (filters: SearchFilters): Predicate<Product> => {
  const predicates: Predicate<Product>[] = []

  if (filters.category) {
    predicates.push(where({ category: eq(filters.category) }))
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice ?? 0
    const max = filters.maxPrice ?? Infinity
    predicates.push(where({ price: between(min, max) }))
  }

  if (filters.minRating) {
    predicates.push(where({ rating: gte(filters.minRating) }))
  }

  if (filters.brands && filters.brands.length > 0) {
    predicates.push(where({ brand: oneOf(filters.brands) }))
  }

  if (filters.onlyInStock) {
    predicates.push(where({ inStock: eq(true) }))
  }

  if (filters.tags && filters.tags.length > 0) {
    predicates.push(
      where({
        tags: (productTags: string[]) =>
          filters.tags!.some(tag => productTags.includes(tag))
      })
    )
  }

  return predicates.length > 0 ? and(...predicates) : always<Product>()
}

// Usage
const searchResults = R.filter(
  products,
  buildProductFilter({
    category: 'electronics',
    minPrice: 100,
    maxPrice: 500,
    minRating: 4.0,
    brands: ['Apple', 'Samsung'],
    onlyInStock: true
  })
)
```

### Inventory Management

```typescript
// Low stock alert (< 10 units)
const lowStock = where({
  quantity: lt(10),
  inStock: eq(true)
})

// Out of stock but popular (needs reorder)
const needsRestock = where({
  inStock: eq(false),
  rating: gte(4.0),
  reviewCount: gte(50)
})

// Overstock (> 100 units, low sales)
const overstock = and(
  where({ quantity: gt(100) }),
  by((p: Product) => p.salesLast30Days, lt(5))
)
```

---

## User Permissions & Access Control

### Role-Based Access Control

```typescript
interface User {
  id: string
  role: 'user' | 'moderator' | 'admin' | 'owner'
  verified: boolean
  accountAgeDays: number
  reputation: number
  permissions: string[]
  tier: 'free' | 'pro' | 'enterprise'
}

// Basic roles
const isAdmin = where({ role: eq('admin') })
const isModerator = where({ role: eq('moderator') })
const isOwner = where({ role: eq('owner') })

// Staff members (admins or moderators)
const isStaff = where({
  role: oneOf(['admin', 'moderator', 'owner'])
})

// Verified users
const isVerified = where({
  verified: eq(true)
})

// Veteran users (account > 1 year)
const isVeteran = where({
  accountAgeDays: gte(365)
})

// High reputation users
const highReputation = where({
  reputation: gte(1000)
})

// Premium users
const isPremium = where({
  tier: oneOf(['pro', 'enterprise'])
})
```

### Complex Permission Logic

```typescript
// Can moderate content
const canModerate = or(
  isAdmin,
  and(isModerator, isVerified)
)

// Can edit any post
const canEditAnyPost = or(
  isAdmin,
  and(isModerator, isVerified, highReputation)
)

// Can access admin panel
const canAccessAdminPanel = or(
  isAdmin,
  and(isModerator, isVeteran, isVerified)
)

// Can create premium content
const canCreatePremiumContent = or(
  isPremium,
  isStaff
)

// Can invite users
const canInviteUsers = or(
  isStaff,
  and(isVerified, highReputation, isVeteran)
)

// Trusted user (can skip moderation)
const isTrusted = or(
  isStaff,
  and(
    isVerified,
    highReputation,
    where({ accountAgeDays: gte(180) }),
    where({
      flags: by((flags: string[]) => flags.length, eq(0))
    })
  )
)
```

### Resource-Level Permissions

```typescript
interface Resource {
  id: string
  ownerId: string
  public: boolean
  collaborators: string[]
}

const canView = (user: User, resource: Resource): boolean =>
  or(
    // Owner can always view
    eq(resource.ownerId)(user.id),
    // Public resources
    eq(true)(resource.public),
    // Collaborators
    (u: User) => resource.collaborators.includes(u.id),
    // Admins can view everything
    isAdmin(user)
  )(user)

const canEdit = (user: User, resource: Resource): boolean =>
  or(
    // Owner can edit
    eq(resource.ownerId)(user.id),
    // Admins can edit
    isAdmin(user),
    // Verified collaborators can edit
    and(
      (u: User) => resource.collaborators.includes(u.id),
      isVerified
    )(user)
  )(user)

const canDelete = (user: User, resource: Resource): boolean =>
  or(
    eq(resource.ownerId)(user.id),
    isAdmin(user)
  )(user)
```

---

## API Filtering (GitHub/Stripe Style)

### GitHub Issues Filtering

```typescript
interface Issue {
  id: number
  number: number
  state: 'open' | 'closed'
  title: string
  body: string
  labels: string[]
  assignee: string | null
  milestone: string | null
  comments: number
  createdAt: Date
  updatedAt: Date
  author: string
}

// Open issues
const open = where({ state: eq('open') })

// Assigned issues
const assigned = where({ assignee: isDefined })

// Unassigned issues
const unassigned = where({ assignee: isNull })

// Has specific label
const hasLabel = (label: string) =>
  where({
    labels: (labels: string[]) => labels.includes(label)
  })

// Bugs
const isBug = hasLabel('bug')

// Features
const isFeature = hasLabel('feature')

// Critical issues
const isCritical = hasLabel('critical')

// Needs triage (open, no labels, no assignee)
const needsTriage = and(
  open,
  unassigned,
  where({ labels: (labels: string[]) => labels.length === 0 })
)

// Stale issues (open, no activity in 90 days)
const isStale = and(
  open,
  where({
    updatedAt: (date: Date) => {
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
      return date.getTime() < ninetyDaysAgo
    }
  })
)

// High priority bugs (open, bug label, critical or many comments)
const highPriorityBugs = and(
  open,
  isBug,
  or(
    isCritical,
    where({ comments: gte(10) })
  )
)
```

### Stripe Charges Filtering

```typescript
interface Charge {
  id: string
  amount: number  // cents
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  paid: boolean
  refunded: boolean
  customerId: string
  created: number  // unix timestamp
}

// Successful charges
const succeeded = where({
  status: eq('succeeded'),
  paid: eq(true)
})

// Failed charges
const failed = where({ status: eq('failed') })

// Large charges (> $100)
const largeCharges = where({
  amount: gt(10000)  // $100.00 in cents
})

// Recent charges (last 30 days)
const recent = where({
  created: (timestamp: number) => {
    const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60
    return timestamp > thirtyDaysAgo
  }
})

// Refunded charges
const refunded = where({
  refunded: eq(true)
})

// Disputed charges
const disputed = and(
  succeeded,
  where({ disputed: eq(true) })
)
```

---

## Form Validation

### Signup Form Validation

```typescript
interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  age: number
  agreeToTerms: boolean
  newsletter: boolean
}

// Email validation
const isValidEmail = matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

// Password requirements
const isStrongPassword = and(
  by((s: string) => s.length, gte(8)),
  matches(/[A-Z]/),      // Has uppercase
  matches(/[a-z]/),      // Has lowercase
  matches(/[0-9]/),      // Has number
  matches(/[!@#$%^&*]/)  // Has special char
)

// Age validation
const isAdult = gte(18)

// Validate entire form
const validateSignup = (form: SignupForm): string[] => {
  const errors: string[] = []

  if (!isValidEmail(form.email)) {
    errors.push('Invalid email address')
  }

  if (!isStrongPassword(form.password)) {
    errors.push('Password must be 8+ chars with uppercase, lowercase, number, and special char')
  }

  if (form.password !== form.confirmPassword) {
    errors.push('Passwords do not match')
  }

  if (!isAdult(form.age)) {
    errors.push('Must be 18 or older')
  }

  if (!form.agreeToTerms) {
    errors.push('Must agree to terms and conditions')
  }

  return errors
}
```

### Multi-Step Form Validation

```typescript
interface Step1Data {
  firstName: string
  lastName: string
  email: string
}

interface Step2Data {
  address: string
  city: string
  zipCode: string
  country: string
}

interface Step3Data {
  cardNumber: string
  cvv: string
  expiryDate: string
}

const validateStep1 = where({
  firstName: by((s: string) => s.length, between(2, 50)),
  lastName: by((s: string) => s.length, between(2, 50)),
  email: matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
})

const validateStep2 = where({
  address: isNotEmpty,
  city: isNotEmpty,
  zipCode: matches(/^\d{5}(-\d{4})?$/),
  country: oneOf(['US', 'CA', 'UK', 'AU'])
})

const validateStep3 = where({
  cardNumber: matches(/^\d{16}$/),
  cvv: matches(/^\d{3,4}$/),
  expiryDate: matches(/^\d{2}\/\d{2}$/)
})
```

---

## Search & Query Functionality

### Full-Text Search with Filters

```typescript
interface Article {
  id: string
  title: string
  content: string
  author: string
  tags: string[]
  publishedAt: Date
  viewCount: number
  featured: boolean
}

const searchArticles = (
  articles: Article[],
  query: string,
  filters?: {
    author?: string
    tags?: string[]
    onlyFeatured?: boolean
    minViews?: number
  }
) => {
  const searchTerm = query.toLowerCase()

  // Text search predicate
  const matchesSearch = or(
    by((a: Article) => a.title.toLowerCase(), includes(searchTerm)),
    by((a: Article) => a.content.toLowerCase(), includes(searchTerm))
  )

  // Build filter predicates
  const predicates: Predicate<Article>[] = [matchesSearch]

  if (filters?.author) {
    predicates.push(where({ author: eq(filters.author) }))
  }

  if (filters?.tags && filters.tags.length > 0) {
    predicates.push(
      where({
        tags: (articleTags: string[]) =>
          filters.tags!.some(tag => articleTags.includes(tag))
      })
    )
  }

  if (filters?.onlyFeatured) {
    predicates.push(where({ featured: eq(true) }))
  }

  if (filters?.minViews) {
    predicates.push(where({ viewCount: gte(filters.minViews) }))
  }

  return R.filter(articles, and(...predicates))
}
```

### Faceted Search

```typescript
// Count results per facet
const getFacetCounts = (products: Product[]) => {
  const categories = R.pipe(
    products,
    R.groupBy((p) => p.category),
    R.mapValues((items) => items.length)
  )

  const brands = R.pipe(
    products,
    R.groupBy((p) => p.brand),
    R.mapValues((items) => items.length)
  )

  const priceRanges = {
    under50: R.filter(products, where({ price: lt(50) })).length,
    '50to100': R.filter(products, where({ price: between(50, 100) })).length,
    '100to200': R.filter(products, where({ price: between(100, 200) })).length,
    over200: R.filter(products, where({ price: gt(200) })).length
  }

  return { categories, brands, priceRanges }
}
```

---

## Database-Like Queries

### SQL-Style Queries

```typescript
// SQL: SELECT * FROM orders WHERE status IN ('pending', 'processing') AND amount > 1000
const query1 = where({
  status: oneOf(['pending', 'processing']),
  amount: gt(1000)
})

// SQL: SELECT * FROM users WHERE role = 'admin' AND verified = true AND age >= 18
const query2 = where({
  role: eq('admin'),
  verified: eq(true),
  age: gte(18)
})

// SQL: SELECT * FROM products WHERE category = 'electronics' AND (price < 100 OR discount > 0.2)
const query3 = and(
  where({ category: eq('electronics') }),
  or(
    where({ price: lt(100) }),
    where({ discount: gt(0.2) })
  )
)
```

### JOIN-Like Operations

```typescript
interface User {
  id: string
  name: string
  countryCode: string
}

interface Country {
  code: string
  name: string
  region: 'EU' | 'NA' | 'APAC'
}

// Find users in EU countries
const euCountryCodes = R.pipe(
  countries,
  R.filter(where({ region: eq('EU') })),
  R.map((c) => c.code)
)

const euUsers = R.filter(
  users,
  where({ countryCode: oneOf(euCountryCodes) })
)
```

---

## Batch Processing & Data Pipelines

### Data Quality Checks

```typescript
interface DataRecord {
  id: string
  value: number
  timestamp: Date
  source: string
  validated: boolean
}

// Valid records (non-negative value, recent, validated)
const isValid = where({
  value: gte(0),
  timestamp: (date: Date) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return date.getTime() > oneDayAgo
  },
  validated: eq(true)
})

// Suspicious records (extreme values)
const isSuspicious = or(
  where({ value: lt(0) }),
  where({ value: gt(1000000) })
)

// Partition data
const [valid, invalid] = R.partition(records, isValid)
const suspicious = R.filter(records, isSuspicious)
```

### ETL Pipeline

```typescript
const processRecords = (rawData: unknown[]) => {
  // Step 1: Filter valid objects
  const objects = R.filter(rawData, isObject)

  // Step 2: Parse and validate
  const parsed = R.pipe(
    objects,
    R.map(parseRecord),
    R.filter(isDefined)
  )

  // Step 3: Apply business rules
  const validRecords = R.filter(
    parsed,
    where({
      amount: and(gte(0), lt(1000000)),
      status: oneOf(['active', 'pending']),
      timestamp: (d: Date) => !isNaN(d.getTime())
    })
  )

  return validRecords
}
```

---

## Content Moderation

```typescript
interface Post {
  id: string
  content: string
  authorId: string
  flagCount: number
  reportedReasons: string[]
  createdAt: Date
}

// Needs review (multiple flags or serious reports)
const needsReview = or(
  where({ flagCount: gte(3) }),
  where({
    reportedReasons: (reasons: string[]) =>
      reasons.some(r => ['spam', 'hate', 'violence'].includes(r))
  })
)

// Auto-approve (trusted author, no flags)
const autoApprove = and(
  where({ flagCount: eq(0) }),
  where({
    authorId: (id: string) => trustedAuthors.includes(id)
  })
)

// Needs manual review (somewhere in between)
const manualReview = and(
  not(autoApprove),
  not(needsReview)
)
```

---

## Next Steps

- **[Migration Guide](./06-migration.md)** - Refactor existing code to use predicates
- **[API Reference](./07-api-reference.md)** - Complete function reference
