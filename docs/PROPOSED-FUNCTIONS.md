# Proposed Functions: Filling the Intersection Gaps

> New functions that live at the boundaries between Structure, Motion, and Persistence — where the most valuable patterns emerge.

See [FUNCTION-CATEGORIZATION.md](./FUNCTION-CATEGORIZATION.md) for the full ontological framework.

---

## Why These Functions?

Receta's current ~240+ functions are heavily concentrated in pure Structure (~55%) and pure Motion (~20%). The **intersection zones** — where two or three categories meet — are underdeveloped. These intersections are precisely where the hardest, most-reimplemented problems live:

```
Current coverage:                    After these proposals:

Structure ██████████████  55%        Structure ██████████████  50%
S↔M       █████          10%        S↔M       ██████         12%
Motion    ██████          20%        Motion    ██████         18%
M↔P       ██              5%   →    M↔P       ██████         10%  ← biggest growth
S↔P       ██              5%        S↔P       ████            7%
Persist   ██              5%        Persist   ██              5%
Trinity   ░               0%        Trinity   ████            8%  ← new category
```

---

## Motion ↔ Persistence: "Flow with Memory"

These functions solve the problem of **motion that needs to remember** — async operations that must track state across calls. This is the biggest gap in receta today. Every backend service, every API client, every resilient system needs these patterns.

### 1. `circuitBreaker`

**The Problem**: A downstream service is failing. Without a circuit breaker, your system keeps hammering it — wasting resources, adding latency, cascading the failure. Every microservice architecture reimplements this pattern, usually poorly.

**Intersection**: **Structure** (state machine: closed/open/half-open) + **Motion** (controls whether calls flow through) + **Persistence** (remembers failure count across invocations)

**Real-world**: Stripe API is down. Your checkout page should fail fast after 5 failures instead of making users wait 30 seconds per request while hammering Stripe.

```typescript
import { circuitBreaker } from 'receta/async'

const fetchPayment = circuitBreaker(
  (orderId: string) => stripe.charges.create({ order: orderId }),
  {
    maxFailures: 5,           // Persistence: threshold before opening
    resetTimeout: 30_000,     // Motion: how long to wait before probing
    halfOpenMax: 1,           // Motion: how many probe requests to allow
    isFailure: (err) => err.status >= 500,  // Structure: what counts as failure
  }
)

const result = await fetchPayment('order_123')
// Result<Charge, CircuitBreakerError<StripeError>>
//
// CircuitBreakerError =
//   | { type: 'open', failureCount: number, lastFailure: E, openedAt: number }
//   | { type: 'execution_failed', error: E, failureCount: number }

// Inspect state
fetchPayment.state    // 'closed' | 'open' | 'half-open'
fetchPayment.stats    // { failures: 3, successes: 47, lastFailureAt: ... }
fetchPayment.reset()  // Force reset to closed
```

**Composes with existing receta**:
- Returns `Result<T, CircuitBreakerError<E>>` — integrates with Result.map, flatMap, match
- `isFailure` predicate uses Structure patterns
- Can wrap any async function, including those already using `retry`
- State machine internally uses the same patterns as proposed `stateMachine`

---

### 2. `rateLimiter`

**The Problem**: External APIs have rate limits. Your own APIs need abuse protection. Without a rate limiter, you either get 429'd or let bad actors overwhelm your system. Currently requires external libraries (bottleneck, p-limit) or manual token bucket implementations.

**Intersection**: **Persistence** (tracks request count and timestamps) + **Motion** (gates whether calls proceed) + **Structure** (defines the limit shape — window, max, strategy)

**Real-world**: GitHub API allows 5,000 requests/hour. You need to spread your 10,000-item sync across time without hitting the limit.

```typescript
import { rateLimiter } from 'receta/async'

// Token bucket strategy
const githubLimiter = rateLimiter({
  maxRequests: 5000,
  window: 3_600_000,       // 1 hour in ms
  strategy: 'sliding',     // 'fixed' | 'sliding' | 'token-bucket'
})

// Wrap a function
const limitedFetch = githubLimiter.wrap(
  (repo: string) => octokit.repos.get({ owner: 'org', repo })
)
// Returns Result<RepoData, RateLimitError>
// RateLimitError = { type: 'rate_limited', retryAfter: number, remaining: 0 }

// Or use standalone
const token = githubLimiter.tryAcquire()
// Result<RateLimitToken, RateLimitError>

// Inspect state
githubLimiter.remaining   // number: how many requests left in window
githubLimiter.resetAt     // number: timestamp when window resets

// Wait for capacity (Motion: blocks until a slot opens)
const token = await githubLimiter.acquire()
// Result<RateLimitToken, TimeoutError> — never rate-limited, but may timeout
```

**Composes with existing receta**:
- `wrap` returns Result — chains with Result.map, flatMap
- Works with `retry`: `retry(() => limitedFetch(repo), { maxAttempts: 3 })`
- `remaining` integrates with Predicate: `Predicate.gt(0)(limiter.remaining)`
- `retryAfter` integrates with `sleep`: `await sleep(error.retryAfter)`

---

### 3. `deduplicateAsync`

**The Problem**: Multiple callers request the same resource simultaneously. Without deduplication, you make N identical network requests instead of 1. `memoizeAsync` partially covers this but conflates "cache a result" with "deduplicate in-flight requests."

**Intersection**: **Persistence** (tracks in-flight request keys) + **Motion** (coalesces concurrent calls into one)

**Real-world**: A React app renders 10 components that each call `fetchUser('123')` on mount. Without deduplication, 10 identical HTTP requests fire simultaneously.

```typescript
import { deduplicateAsync } from 'receta/async'

const fetchUser = deduplicateAsync(
  (id: string) => fetch(`/api/users/${id}`).then(r => r.json()),
  {
    key: (id) => id,         // Persistence: how to identify duplicates
    ttl: 5_000,              // Persistence: cache result briefly after resolution
  }
)

// Three simultaneous calls → ONE network request
const [a, b, c] = await Promise.all([
  fetchUser('123'),  // Makes the actual request
  fetchUser('123'),  // Joins the in-flight request
  fetchUser('123'),  // Joins the in-flight request
])
// a, b, c all resolve to the same value

// Different keys are independent
const d = await fetchUser('456')  // Separate request
```

**How it differs from `memoizeAsync`**:
- `memoizeAsync`: caches the *resolved value* for future calls
- `deduplicateAsync`: coalesces *concurrent in-flight* calls, optionally caches briefly

---

### 4. `staleWhileRevalidate`

**The Problem**: The most common caching pattern on the web. Serve cached data immediately (even if stale) while refreshing in the background. Users get instant responses, and data is eventually consistent. Currently requires manual Promise juggling.

**Intersection**: **Structure** (typed cached value) + **Motion** (background revalidation flow) + **Persistence** (TTL-bounded storage with stale window)

**Real-world**: Your dashboard shows user stats. Fetching takes 2 seconds. With SWR, returning visitors see last-cached stats instantly while fresh data loads in the background.

```typescript
import { staleWhileRevalidate } from 'receta/memo'

const getStats = staleWhileRevalidate(
  (userId: string) => fetchDashboardStats(userId),
  {
    ttl: 60_000,                     // Fresh for 1 minute
    staleWhileRevalidate: 300_000,   // Serve stale for up to 5 minutes
    onRevalidate: (key, result) => { // Callback when background refresh completes
      console.log(`Refreshed stats for ${key}`)
    },
    onError: (key, error) => {       // If background refresh fails
      console.error(`Failed to refresh ${key}`, error)
    },
  }
)

const stats = await getStats('user_123')
// Result<Stats, FetchError>
//
// Timeline:
// t=0:     First call → fetches, caches, returns Result
// t=30s:   Within TTL → returns cached value (fresh)
// t=90s:   After TTL, within SWR → returns stale value + triggers background refresh
// t=400s:  After SWR window → fetches fresh (blocks until complete)

// Inspect cache state
getStats.isFresh('user_123')  // boolean
getStats.isStale('user_123')  // boolean
getStats.invalidate('user_123')  // force refresh on next call
```

**Composes with existing receta**:
- Builds on `memoizeAsync` and `ttlCache` internally
- Returns Result — integrates with all Result combinators
- `onRevalidate` callback receives Result — can be piped
- Invalidation uses same patterns as `memo` module's `invalidateWhere`

---

### 5. `queue`

**The Problem**: Processing async tasks with ordering, concurrency limits, and backpressure. File upload queues, background job processing, email sending pipelines. Every application with background work reimplements this.

**Intersection**: **Structure** (typed task items and results) + **Motion** (concurrent execution with ordering) + **Persistence** (task queue with capacity limits)

**Real-world**: Upload 500 images to S3 — but only 3 at a time, with retry on failure, pausing on user request, and progress tracking.

```typescript
import { queue } from 'receta/async'

const uploadQueue = queue<File, UploadResult>({
  concurrency: 3,          // Motion: max parallel uploads
  maxSize: 500,            // Persistence: queue capacity
  retries: 2,              // Motion: retry failed tasks
  onTaskComplete: (file, result) => updateProgress(file, result),
})

// Add tasks — returns Result (fails if queue is full)
uploadQueue.add(file)               // Result<void, QueueFullError>
uploadQueue.addMany(files)          // Result<void, QueueFullError>

// Process with handler
const processor = uploadQueue.process(
  async (file) => {
    const response = await s3.upload(file)
    return { url: response.Location, size: file.size }
  }
)

// Control flow
uploadQueue.pause()               // Motion: stop processing
uploadQueue.resume()              // Motion: resume processing
await uploadQueue.drain()         // Motion: wait for all to complete

// Observe state
uploadQueue.size                  // Persistence: total queued
uploadQueue.pending               // Motion: currently processing
uploadQueue.completed             // Persistence: finished count

// Results
const results = await uploadQueue.drain()
// Result<UploadResult[], QueueError>
```

---

## Structure ↔ Persistence: "Form that Lasts"

These functions solve the problem of **structures that need to persist** — data shapes that must survive serialization, comparison across time, or field-level transformation.

### 6. `evolve`

**The Problem**: Transforming specific fields of an object without spreading everything manually. You write `{ ...obj, name: f(obj.name), age: g(obj.age) }` constantly. It's error-prone (forgetting fields), verbose, and doesn't compose.

**Intersection**: **Structure** (defines which fields and their new shapes) + **Motion** (applies transformations as a flow)

**Real-world**: Normalizing API responses — lowercase emails, trim names, parse dates from strings — across every endpoint.

```typescript
import { evolve } from 'receta/object'
import * as R from 'remeda'

// Data-first
evolve(user, {
  name: (n) => n.trim(),
  email: (e) => e.toLowerCase(),
  age: (a) => a + 1,
  // Fields not mentioned pass through unchanged
})

// Data-last (in pipe)
R.pipe(
  apiResponse,
  evolve({
    createdAt: (s) => new Date(s),
    tags: R.map(String.slugify),
    metadata: evolve({           // Nested evolve
      version: (v) => v + 1,
    }),
  })
)

// With type safety — transformations must match field types
evolve(user, {
  name: (n: string) => n.toUpperCase(),     // ✓ string → string
  age: (a: number) => String(a),            // ✓ number → string (type changes allowed)
  // unknownField: (x) => x,               // ✗ TypeScript error: field doesn't exist
})
```

**Composes with existing receta**:
- Works in `R.pipe` (data-last via purry)
- Field transformers can use any receta function: `email: Option.fromNullable`
- Nests cleanly for deep objects
- Combines with `Lens.over` for path-based transforms

---

### 7. `snapshot` / `changes`

**The Problem**: Comparing object state before and after an operation. Form dirty checking, undo/redo, audit logging, optimistic UI rollback. Everyone writes deep equality checks and manual diff logic.

**Intersection**: **Structure** (the shape being compared) + **Persistence** (the saved point-in-time copy) + **Motion** (the diff operation between states)

**Real-world**: A settings form. User changes 3 of 20 fields. You need to know which fields changed, show a "you have unsaved changes" warning, and send only the changed fields to the API.

```typescript
import { snapshot, changes, hasChanged } from 'receta/object'

// Capture a point-in-time copy
const original = snapshot(formState)

// ... user edits the form ...

// Check if anything changed
hasChanged(original, formState)  // boolean (deep structural equality)

// Get detailed changes
const diffs = changes(original, formState)
// Array<{
//   path: string[],
//   before: unknown,
//   after: unknown,
// }>
//
// Example:
// [
//   { path: ['name'], before: 'Alice', after: 'Bob' },
//   { path: ['settings', 'theme'], before: 'light', after: 'dark' },
// ]

// Get only changed fields as a partial object (for PATCH requests)
const patch = changedFields(original, formState)
// { name: 'Bob', settings: { theme: 'dark' } }

// Integrates with Result for complex objects
const diffs = changes(original, formState)
// Result<Change[], SnapshotError> for circular references, etc.
```

**Composes with existing receta**:
- `changes` returns array — use with `R.filter`, `R.map`, `R.groupBy`
- Path format matches `object.getPath` / `object.setPath`
- Builds on `collection.diff` internally for structural comparison
- `changedFields` output works directly with `fetch(url, { body: JSON.stringify(patch) })`

---

### 8. `serialize` / `deserialize`

**The Problem**: `JSON.stringify` is lossy and unsafe. Dates become strings. `undefined` disappears. `BigInt` throws. `Map`/`Set` become `{}`. Round-tripping destroys information. Every project needing localStorage, IPC, or API serialization fights this.

**Intersection**: **Structure** (typed data with complex types) + **Persistence** (serialized representation for storage) + **Motion** (conversion path that can fail)

**Real-world**: Saving app state to localStorage, sending typed data through postMessage, caching complex objects in Redis.

```typescript
import { serialize, deserialize } from 'receta/object'

// Safe serialization — returns Result
const json = serialize(data)
// Result<string, SerializeError>
// SerializeError = { type: 'circular_reference' | 'unsupported_type', path: string[] }

// Safe deserialization with type
const user = deserialize<User>(jsonString)
// Result<User, DeserializeError>

// With options for type preservation
const json = serialize(data, {
  dates: 'iso',           // Date → ISO string with type tag
  bigints: 'string',      // BigInt → string with type tag
  maps: 'entries',        // Map → [key, value][] with type tag
  sets: 'array',          // Set → value[] with type tag
  undefined: 'explicit',  // undefined → explicit marker (not omitted)
})

// Round-trip preserving types
const restored = R.pipe(
  data,
  serialize({ dates: 'iso' }),
  Result.flatMap(json => deserialize<typeof data>(json)),
)
// Result<typeof data, SerializeError | DeserializeError>
// Dates are Date objects again, not strings
```

---

### 9. `changelog`

**The Problem**: Tracking how a value changes over time. Undo/redo in editors, time-travel debugging, audit trails for compliance. Everyone builds ad-hoc history arrays with manual pointer management.

**Intersection**: **Structure** (the shape at each point in time) + **Persistence** (the history buffer with capacity) + **Motion** (navigation through time: undo/redo)

**Real-world**: A rich text editor needs undo/redo. A form wizard needs "go back to step 2." A compliance system needs "who changed what, when."

```typescript
import { changelog } from 'receta/collection'

const history = changelog<DocumentState>({
  maxEntries: 100,           // Persistence: capacity limit
  equality: deepEqual,       // Structure: when to consider states identical
})

// Record changes
history.record(state1)       // Persistence: store snapshot
history.record(state2)
history.record(state3)

// Navigate
history.undo()               // Option<DocumentState> — previous state
history.redo()               // Option<DocumentState> — next state
history.current()            // DocumentState — current state

// Inspect
history.canUndo              // boolean
history.canRedo              // boolean
history.entries()            // ReadonlyArray<{ value: T, timestamp: number }>
history.length               // number

// Diff between entries
history.diff(0, 2)           // uses snapshot/changes internally
// Array<{ path, before, after }>

// Branch: recording after undo discards the redo stack
history.undo()               // Go back to state2
history.record(state4)       // Discards state3, adds state4
history.canRedo              // false
```

---

## Trinity: Structure + Motion + Persistence

These functions live where all three categories meet. They are the most powerful patterns — and the most commonly reimplemented.

### 10. `stateMachine`

**The Problem**: Managing typed state transitions. Login flows (idle → loading → success/error), order lifecycles (pending → paid → shipped → delivered), connection states (disconnected → connecting → connected). Everyone builds switch statements and forgets edge cases.

**Intersection**: **Structure** (states and transitions are data) + **Motion** (events trigger transitions) + **Persistence** (current state is remembered)

**Real-world**: An order can be paid, shipped, delivered, returned, or cancelled. A returned order can't be shipped again. A cancelled order can't be paid. The type system should prevent these impossible transitions.

```typescript
import { stateMachine } from 'receta/state'

// Define the machine (Structure)
const orderMachine = stateMachine({
  initial: 'pending' as const,
  states: {
    pending:    { on: { PAY: 'paid', CANCEL: 'cancelled' } },
    paid:       { on: { SHIP: 'shipped', REFUND: 'refunded' } },
    shipped:    { on: { DELIVER: 'delivered', RETURN: 'returned' } },
    delivered:  { on: { RETURN: 'returned' } },
    cancelled:  {},   // terminal — no transitions out
    refunded:   {},   // terminal
    returned:   {},   // terminal
  },
})

// Create an instance (Persistence: holds current state)
const order = orderMachine.create()
// { state: 'pending', history: ['pending'] }

// Send events (Motion: trigger transitions)
const next = orderMachine.send(order, 'PAY')
// Result<{ state: 'paid', history: ['pending', 'paid'] }, InvalidTransitionError>

const bad = orderMachine.send(order, 'SHIP')
// Err({ type: 'invalid_transition', from: 'pending', event: 'SHIP',
//        allowed: ['PAY', 'CANCEL'] })

// Query capabilities (Structure: inspect the constraint graph)
orderMachine.can(order, 'PAY')              // true
orderMachine.can(order, 'DELIVER')          // false
orderMachine.allowedEvents(order)           // ['PAY', 'CANCEL']
orderMachine.isTerminal(order)              // false

// Type-safe: TypeScript knows which events are valid from which states
// orderMachine.send(deliveredOrder, 'PAY')  // ← TypeScript error
```

**Composes with existing receta**:
- Returns `Result<State, InvalidTransitionError>` — chains with Result.map, flatMap, match
- `can` returns boolean — works as a Predicate
- History is a collection — use with `R.last`, `R.take`, `collection.diff`
- Terminal state detection uses Predicate patterns

---

### 11. `Resource`

**The Problem**: Safely acquiring, using, and releasing resources. Database connections, file handles, locks, temporary files. Forgetting to release causes leaks. Exceptions during use must still trigger release. Every project builds try/finally wrappers.

**Intersection**: **Structure** (typed resource value) + **Motion** (acquire → use → release flow with error handling) + **Persistence** (the resource exists for the duration of use)

**Real-world**: Open a database connection, run a query, guarantee the connection is returned to the pool — even if the query throws.

```typescript
import { Resource } from 'receta/async'

// Define a resource (Structure: what it is + how to get/release it)
const dbConnection = Resource.make(
  () => pool.connect(),                     // Motion: acquire
  (conn) => conn.release(),                 // Motion: release (guaranteed)
)

// Use it safely
const result = await Resource.use(dbConnection, async (conn) => {
  const users = await conn.query('SELECT * FROM users')
  return users.rows
})
// Result<User[], ResourceError<QueryError>>
// Connection is ALWAYS released, even if query throws

// Compose resources (acquire both, release both on any failure)
const withTransaction = Resource.compose(
  dbConnection,
  Resource.make(
    (conn) => conn.query('BEGIN'),          // Acquire: start transaction
    (conn) => conn.query('ROLLBACK'),       // Release: rollback on error
    { onSuccess: (conn) => conn.query('COMMIT') },  // Or commit on success
  )
)

// Map over resources
const typedConn = Resource.map(dbConnection, (conn) => ({
  ...conn,
  queryTyped: <T>(sql: string) => conn.query(sql) as Promise<T>,
}))
```

**Composes with existing receta**:
- Returns `Result<T, ResourceError<E>>` — integrates with Result pipeline
- `Resource.compose` follows the same composition patterns as `Lens.compose`
- Works with `retry`: `retry(() => Resource.use(dbConn, query))`
- Cleanup is guaranteed — like `try/finally` but composable and typed

---

### 12. `bulkhead`

**The Problem**: Isolating concurrent access to a shared resource. Without bulkheads, one slow dependency consumes all threads/connections, blocking everything else. It's the circuit breaker's companion — circuit breaker reacts to failures, bulkhead prevents resource exhaustion.

**Intersection**: **Structure** (typed wrapped function) + **Motion** (concurrency limiting with queuing) + **Persistence** (tracks active count and queue depth)

**Real-world**: Your app connects to 3 databases. If DB-A is slow, it shouldn't consume all connection resources and starve DB-B and DB-C.

```typescript
import { bulkhead } from 'receta/async'

const dbBulkhead = bulkhead({
  maxConcurrent: 10,         // Motion: max simultaneous executions
  maxQueue: 50,              // Persistence: max waiting in queue
  timeout: 5_000,            // Motion: max time waiting in queue
})

const safeQuery = dbBulkhead.wrap(
  (sql: string) => db.query(sql)
)
// Result<QueryResult, BulkheadError>
// BulkheadError =
//   | { type: 'rejected', reason: 'queue_full', queueSize: 50 }
//   | { type: 'timeout', waited: 5000 }
//   | { type: 'execution_failed', error: E }

// Inspect state
dbBulkhead.active             // number: currently executing
dbBulkhead.queued             // number: waiting in queue
dbBulkhead.available          // number: remaining slots
```

**Composes with existing receta**:
- Pairs with `circuitBreaker`: bulkhead limits concurrency, circuit breaker handles failures
- Returns Result — chains with all Result combinators
- `available` integrates with Predicate: `Predicate.gt(0)(bulkhead.available)`
- Works with `queue`: queue manages task ordering, bulkhead manages resource isolation

---

## Composition Patterns: How They Work Together

### The Resilience Stack

In production systems, these functions compose into layers:

```typescript
import { circuitBreaker, rateLimiter, bulkhead, deduplicateAsync } from 'receta/async'
import { staleWhileRevalidate } from 'receta/memo'

// Layer 1: Deduplicate concurrent identical requests
const dedupedFetch = deduplicateAsync(fetchUser, { key: (id) => id })

// Layer 2: Rate limit to respect API constraints
const limitedFetch = rateLimiter({ maxRequests: 100, window: 60_000 })
  .wrap(dedupedFetch)

// Layer 3: Circuit break on repeated failures
const resilientFetch = circuitBreaker(limitedFetch, {
  maxFailures: 5, resetTimeout: 30_000
})

// Layer 4: Bulkhead to isolate from other resources
const isolatedFetch = bulkhead({ maxConcurrent: 10, maxQueue: 50 })
  .wrap(resilientFetch)

// Layer 5: Cache with stale-while-revalidate
const cachedFetch = staleWhileRevalidate(isolatedFetch, {
  ttl: 60_000, staleWhileRevalidate: 300_000
})

// Use it — all layers compose transparently
const user = await cachedFetch('user_123')
// Result<User, CircuitBreakerError | RateLimitError | BulkheadError | FetchError>
```

Each layer adds a concern:
- **Deduplication**: Motion↔Persistence (prevents redundant flow)
- **Rate limiting**: Motion↔Persistence (gates flow by capacity)
- **Circuit breaking**: Trinity (state machine controls flow based on stored failures)
- **Bulkhead**: Trinity (isolates concurrent access with capacity)
- **SWR caching**: Trinity (serves structure from persistence while motion refreshes)

### The Temporal Stack

For data that changes over time:

```typescript
import { changelog } from 'receta/collection'
import { snapshot, changes, evolve } from 'receta/object'
import { stateMachine } from 'receta/state'

// Define state machine for document lifecycle
const docMachine = stateMachine({
  initial: 'draft',
  states: {
    draft:     { on: { SUBMIT: 'review', ARCHIVE: 'archived' } },
    review:    { on: { APPROVE: 'published', REJECT: 'draft' } },
    published: { on: { UNPUBLISH: 'draft', ARCHIVE: 'archived' } },
    archived:  { on: { RESTORE: 'draft' } },
  },
})

// Track document content changes
const contentHistory = changelog<DocumentContent>({ maxEntries: 50 })

// On each edit:
contentHistory.record(
  evolve(currentContent, {
    body: (b) => newBody,
    updatedAt: () => new Date(),
  })
)

// On state transition:
const transition = docMachine.send(doc, 'SUBMIT')
// Result<ReviewState, InvalidTransitionError>

// Undo last edit:
const previous = contentHistory.undo()
// Option<DocumentContent>
```

---

## Implementation Priority

| Priority | Function | Intersection | Justification |
|----------|----------|-------------|---------------|
| **P0** | `circuitBreaker` | Trinity | Every service-calling system needs this. Most reimplemented pattern. |
| **P0** | `rateLimiter` | M↔P | Every API client needs this. Rate limits are universal. |
| **P0** | `evolve` | S↔M | Most commonly needed object transformation. Used in every project. |
| **P1** | `deduplicateAsync` | M↔P | Prevents thundering herd. Critical for performance. |
| **P1** | `staleWhileRevalidate` | Trinity | Most common caching pattern. Users expect instant responses. |
| **P1** | `queue` | Trinity | Every app with background tasks needs this. |
| **P2** | `snapshot` / `changes` | S↔P | Form dirty checking, audit logging, undo support. |
| **P2** | `stateMachine` | Trinity | Replaces ad-hoc switch statements with type-safe transitions. |
| **P2** | `Resource` | Trinity | Safe resource management. Prevents leaks. |
| **P3** | `serialize` / `deserialize` | S↔P | Safe round-tripping. Needed for localStorage, IPC, caching. |
| **P3** | `changelog` | S↔P | Undo/redo, audit trails. Specialized but high value. |
| **P3** | `bulkhead` | Trinity | Resource isolation. Critical for multi-dependency systems. |

---

## Out of Scope

These patterns were considered but intentionally excluded:

| Pattern | Why Excluded |
|---------|-------------|
| **Saga / Workflow orchestration** | Too opinionated — implies specific step execution semantics, compensation logic, and persistence backends. Better as a dedicated `receta-workflow` package. |
| **Event sourcing** | Domain-specific pattern requiring event stores, projections, and replay semantics. Use dedicated libraries (e.g., `eventide`, `nestjs/cqrs`). |
| **Repository / ORM patterns** | Too close to data access layer. Receta is domain-agnostic; repositories imply entity lifecycle management. |
| **Channels / Streams** | Overlaps significantly with Web Streams API, AsyncIterator, and RxJS. The scope is too large for a utility library. |
| **Distributed locking** | Requires network coordination (Redis, ZooKeeper). Out of scope for an in-process utility library. |
| **Schema migration** | Requires version tracking and migration runners. Better handled by dedicated migration tools (Prisma, Knex, etc.). |

These could become companion packages (`receta-workflow`, `receta-streams`) if demand warrants.
