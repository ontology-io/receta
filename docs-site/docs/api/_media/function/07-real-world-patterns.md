# Real-World Patterns

> Production-ready examples using Function combinators to solve common problems.

## Pattern 1: HTTP Client with Retry Logic

```typescript
import { pipe } from 'remeda'
import { tryCatch, tap, when, partial } from 'receta/function'
import { retry } from 'receta/async'
import { flatMap, mapErr, unwrapOr } from 'receta/result'

interface FetchConfig {
  baseUrl: string
  timeout: number
  maxRetries: number
}

const createHttpClient = (config: FetchConfig) => {
  const fetchWithRetry = async (endpoint: string, options?: RequestInit) => {
    return pipe(
      endpoint,
      tap((url) => logger.debug('Fetching', { url: `${config.baseUrl}${url}` })),
      (url) => retry(
        async () => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), config.timeout)
          
          try {
            const response = await fetch(`${config.baseUrl}${url}`, {
              ...options,
              signal: controller.signal
            })
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            return await response.json()
          } finally {
            clearTimeout(timeoutId)
          }
        },
        { maxAttempts: config.maxRetries, delay: 1000 }
      ),
      mapErr((error) => ({
        code: 'FETCH_ERROR',
        message: error.lastError instanceof Error 
          ? error.lastError.message 
          : 'Unknown error',
        attempts: error.attempts
      }))
    )
  }
  
  return {
    get: partial(fetchWithRetry),
    post: (endpoint: string, body: any) =>
      fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
  }
}

// Usage
const api = createHttpClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  maxRetries: 3
})

const result = await api.get('/users/123')
const user = unwrapOr(result, null)
```

## Pattern 2: Multi-Stage Data Pipeline

```typescript
import * as R from 'remeda'
import { when, unless, tap, converge, juxt } from 'receta/function'
import { where, and } from 'receta/predicate'

interface RawEvent {
  id: string
  timestamp: string
  userId: string
  eventType: string
  data: Record<string, any>
}

interface ProcessedEvent extends RawEvent {
  normalized: boolean
  validated: boolean
  enriched: boolean
}

// Define predicates for validation
const hasUserId = where({ userId: (x: string) => x.length > 0 })
const hasEventType = where({ eventType: (x: string) => x.length > 0 })
const hasTimestamp = where({ timestamp: (x: string) => x.length > 0 })
const isValidEvent = and(hasUserId, hasEventType, hasTimestamp)

// Multi-stage processing pipeline with Remeda
const processEvents = (events: RawEvent[]) =>
  R.pipe(
    events,
    tap((evts) => metrics.gauge('events.input', evts.length)),

    // Stage 1: Normalization using Remeda's map + when
    R.map(when(
      (evt) => !evt.timestamp.endsWith('Z'),
      (evt) => ({ ...evt, timestamp: `${evt.timestamp}Z` })
    )),
    R.map((evt) => ({ ...evt, normalized: true })),
    tap((evts) => logger.debug('Normalized', { count: evts.length })),

    // Stage 2: Validation using Predicate module
    R.filter((evt) => {
      const valid = isValidEvent(evt)
      if (!valid) {
        logger.warn('Invalid event', { id: evt.id })
      }
      return valid
    }),
    R.map((evt) => ({ ...evt, validated: true } as ProcessedEvent)),
    tap((evts) => metrics.gauge('events.validated', evts.length)),

    // Stage 3: Enrichment
    R.map(unless(
      (evt) => 'sessionId' in evt.data,
      (evt) => ({
        ...evt,
        data: { ...evt.data, sessionId: generateSessionId(evt.userId) }
      })
    )),
    R.map((evt) => ({ ...evt, enriched: true })),

    // Stage 4: Grouping and Analytics with Remeda
    (events) => R.pipe(
      events,
      // Use converge with Remeda operations
      converge(
        (byType, totalCount, uniqueUsers, typeCount) => ({
          byType,
          totalCount,
          uniqueUsers,
          eventTypeCount: typeCount,
          processingComplete: true
        }),
        [
          // Group using Remeda
          (evts: ProcessedEvent[]) => R.groupBy(evts, (e) => e.eventType),
          // Count using length
          (evts: ProcessedEvent[]) => evts.length,
          // Unique users using Remeda
          (evts: ProcessedEvent[]) => R.uniqueBy(evts, (e) => e.userId).length,
          // Unique event types
          (evts: ProcessedEvent[]) => R.pipe(evts, R.map(e => e.eventType), R.unique).length
        ]
      )
    ),
    tap((result) => {
      metrics.gauge('events.processed', result.totalCount)
      metrics.gauge('events.unique_users', result.uniqueUsers)
      logger.info('Processing complete', result)
    })
  )
```

## Pattern 3: State Machine Implementation

```typescript
import { cond, when } from 'receta/function'
import { unwrapOr } from 'receta/option'

type OrderState = 'draft' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  state: OrderState
  items: any[]
  total: number
  createdAt: Date
  updatedAt: Date
}

interface StateTransition {
  newState: OrderState
  actions: Array<(order: Order) => Promise<void>>
  validations: Array<(order: Order) => boolean>
}

const getTransition = (order: Order, action: string): Option<StateTransition> =>
  cond<[Order, string], StateTransition>([
    // Submit order: draft -> pending
    [
      ([o, a]) => o.state === 'draft' && a === 'submit',
      ([o]) => ({
        newState: 'pending',
        actions: [sendConfirmationEmail, createPaymentIntent],
        validations: [hasItems, hasValidAddress]
      })
    ],
    
    // Process payment: pending -> processing
    [
      ([o, a]) => o.state === 'pending' && a === 'process',
      ([o]) => ({
        newState: 'processing',
        actions: [chargePayment, notifyWarehouse],
        validations: [hasPaymentMethod]
      })
    ],
    
    // Ship order: processing -> shipped
    [
      ([o, a]) => o.state === 'processing' && a === 'ship',
      ([o]) => ({
        newState: 'shipped',
        actions: [generateTrackingNumber, sendShippingNotification],
        validations: [allItemsPacked]
      })
    ],
    
    // Deliver order: shipped -> delivered
    [
      ([o, a]) => o.state === 'shipped' && a === 'deliver',
      ([o]) => ({
        newState: 'delivered',
        actions: [sendDeliveryConfirmation, requestReview],
        validations: []
      })
    ],
    
    // Cancel order: any -> cancelled (with conditions)
    [
      ([o, a]) => a === 'cancel' && ['draft', 'pending'].includes(o.state),
      ([o]) => ({
        newState: 'cancelled',
        actions: [refundPayment, sendCancellationEmail],
        validations: []
      })
    ]
  ])([order, action])

const transitionOrder = async (order: Order, action: string): Promise<Result<Order, string>> => {
  const transition = getTransition(order, action)
  
  if (!isSome(transition)) {
    return err(`Invalid transition: ${order.state} -> ${action}`)
  }
  
  const { newState, actions, validations } = unwrap(transition)
  
  // Run validations
  const allValid = validations.every(v => v(order))
  if (!allValid) {
    return err('Validation failed')
  }
  
  // Apply transition
  const updatedOrder = {
    ...order,
    state: newState,
    updatedAt: new Date()
  }
  
  // Execute actions
  await Promise.all(actions.map(action => action(updatedOrder)))
  
  return ok(updatedOrder)
}
```

## Pattern 4: Complex Form Validation

```typescript
import { pipe } from 'remeda'
import { when, unless, converge } from 'receta/function'
import { ok, err, collect, flatMap } from 'receta/result'

interface UserRegistrationForm {
  email: string
  password: string
  confirmPassword: string
  age: string
  agreedToTerms: boolean
}

interface ValidationError {
  field: string
  message: string
}

interface ValidatedForm {
  email: string
  password: string
  age: number
  agreedToTerms: true
}

// Field validators
const validateEmail = (email: string): Result<string, ValidationError> => {
  const normalized = email.trim().toLowerCase()
  
  if (!normalized.includes('@')) {
    return err({ field: 'email', message: 'Invalid email format' })
  }
  
  if (normalized.endsWith('@temporary.com')) {
    return err({ field: 'email', message: 'Temporary emails not allowed' })
  }
  
  return ok(normalized)
}

const validatePassword = (password: string, confirm: string): Result<string, ValidationError> => {
  if (password.length < 8) {
    return err({ field: 'password', message: 'Password must be at least 8 characters' })
  }
  
  if (!/[A-Z]/.test(password)) {
    return err({ field: 'password', message: 'Password must contain uppercase letter' })
  }
  
  if (!/[0-9]/.test(password)) {
    return err({ field: 'password', message: 'Password must contain number' })
  }
  
  if (password !== confirm) {
    return err({ field: 'confirmPassword', message: 'Passwords do not match' })
  }
  
  return ok(password)
}

const validateAge = (ageStr: string): Result<number, ValidationError> => {
  const age = parseInt(ageStr, 10)
  
  if (isNaN(age)) {
    return err({ field: 'age', message: 'Age must be a number' })
  }
  
  if (age < 13) {
    return err({ field: 'age', message: 'Must be at least 13 years old' })
  }
  
  if (age > 120) {
    return err({ field: 'age', message: 'Invalid age' })
  }
  
  return ok(age)
}

const validateTerms = (agreed: boolean): Result<true, ValidationError> =>
  agreed
    ? ok(true)
    : err({ field: 'agreedToTerms', message: 'Must agree to terms' })

// Normalize form data
const normalizeForm = (form: UserRegistrationForm): UserRegistrationForm =>
  pipe(
    form,
    when(
      (f) => f.email.includes(' '),
      (f) => ({ ...f, email: f.email.trim() })
    ),
    when(
      (f) => f.age.trim() === '',
      (f) => ({ ...f, age: '0' })
    )
  )

// Validate entire form
const validateRegistrationForm = (form: UserRegistrationForm): Result<ValidatedForm, ValidationError[]> =>
  pipe(
    form,
    normalizeForm,
    (normalized) => collect([
      validateEmail(normalized.email),
      validatePassword(normalized.password, normalized.confirmPassword),
      validateAge(normalized.age),
      validateTerms(normalized.agreedToTerms)
    ]),
    flatMap(([email, password, age, agreedToTerms]) =>
      ok({ email, password, age, agreedToTerms })
    )
  )

// Usage
const formData: UserRegistrationForm = {
  email: ' user@EXAMPLE.COM ',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  age: '25',
  agreedToTerms: true
}

const result = validateRegistrationForm(formData)

if (isOk(result)) {
  console.log('Valid:', result.value)
  // Proceed with registration
} else {
  console.error('Validation errors:', result.error)
  // Show errors to user
}
```

## Pattern 5: Event-Driven Analytics

```typescript
import * as R from 'remeda'
import { juxt, converge, tap } from 'receta/function'

interface Event {
  type: string
  userId: string
  timestamp: Date
  properties: Record<string, any>
}

// Extract comprehensive analytics using Remeda + Function combinators
const analyzeEvents = (events: Event[]) =>
  R.pipe(
    events,
    tap((evts) => logger.info('Analyzing events', { count: evts.length })),

    // Use converge to extract multiple dimensions
    converge(
      (byType, byUser, timeline, summary) => ({
        byType,
        byUser,
        timeline,
        summary
      }),
      [
        // Group by event type using Remeda
        (evts: Event[]) => R.pipe(
          evts,
          R.groupBy(e => e.type),
          R.mapValues(grouped => ({
            count: grouped.length,
            uniqueUsers: R.uniqueBy(grouped, e => e.userId).length
          }))
        ),

        // Group by user
        (evts: Event[]) => R.pipe(
          evts,
          R.groupBy(e => e.userId),
          R.mapValues(grouped => ({
            eventCount: grouped.length,
            eventTypes: R.pipe(grouped, R.map(e => e.type), R.unique),
            firstEvent: R.first(grouped)?.timestamp,
            lastEvent: R.last(grouped)?.timestamp
          }))
        ),

        // Timeline buckets using Remeda
        (evts: Event[]) => R.pipe(
          evts,
          R.groupBy(e => e.timestamp.toISOString().split('T')[0]),
          R.mapValues(grouped => grouped.length)
        ),

        // Overall summary using juxt for parallel extraction
        juxt([
          (evts: Event[]) => evts.length,
          (evts: Event[]) => R.uniqueBy(evts, e => e.userId).length,
          (evts: Event[]) => R.pipe(evts, R.map(e => e.type), R.unique).length,
          (evts: Event[]) => R.first(evts)?.timestamp,
          (evts: Event[]) => R.last(evts)?.timestamp
        ])
      ]
    ),

    tap((analytics) => {
      const [total, uniqueUsers, uniqueTypes, firstEvent, lastEvent] = analytics.summary
      logger.info('Analytics complete', {
        total,
        uniqueUsers,
        uniqueTypes,
        timespan: { start: firstEvent, end: lastEvent }
      })
    })
  )
```

## Next Steps

- **[API Reference](./08-api-reference.md)** - Complete function signatures
