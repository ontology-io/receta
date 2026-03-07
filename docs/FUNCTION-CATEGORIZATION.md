# Function Categorization Framework

> A universal ontological lens for understanding computation through three irreducible concerns: **Structure**, **Motion**, and **Persistence**.

---

## Part I: The Ontology

### The Triadic Nature of Computation

Every computation — from a single function call to a distributed system — addresses three fundamental concerns. These are not design choices or architectural preferences. They are **irreducible**: you cannot compute without all three, and each exists only in relation to the other two.

```
                        ╭─────────────╮
                        │  STRUCTURE  │
                        │  The "what" │
                        │             │
                        │  Form       │
                        │  Shape      │
                        │  Constraint │
                        ╰──────┬──────╯
                               │
                     ┌─────────┼─────────┐
                     │         │         │
                     │    The Trinity    │
                     │   (emergence)     │
                     │         │         │
              ╭──────┴──────╮  │  ╭──────┴──────╮
              │   MOTION    │  │  │ PERSISTENCE │
              │  The "how"  │  │  │ The "where" │
              │             │  │  │             │
              │  Flow       │──┘  │  Storage    │
              │  Speed      │─────│  Capacity   │
              │  Path       │     │  Memory     │
              ╰─────────────╯     ╰─────────────╯
```

**Structure** is the geometry of data — *what* exists. Types, fields, shapes, constraints, invariants. A `Result<User, Error>` is a structure. A predicate `age > 18` is a structural constraint. A lens `prop('name')` is a structural accessor. Structure answers: *what is the shape of this thing?*

**Motion** is the dynamics of computation — *how* data moves. Timing, concurrency, paths, branching, error recovery, throughput. An async retry is motion. A pipe composition is motion. A `tryCatch` captures the motion of exceptions into structure. Motion answers: *how does this thing flow?*

**Persistence** is the statics of storage — *where* data lives and *when* it expires. Caches, indexes, pagination windows, capacity limits, invalidation policies. A memoized function is persistence. An LRU cache is persistence. A paginated view is persistence. Persistence answers: *where is this thing kept, and for how long?*

### Why They Are Irreducible

Each category is meaningless without the other two:

- **Structure without Motion** is inert definition — a type that is never instantiated, a schema that is never applied, a building with no doors. You have described *what* but nothing happens.

- **Structure without Persistence** is ephemeral form — a value that exists for one tick and disappears, a sandcastle before the tide. You have shaped *what* but it doesn't last.

- **Motion without Structure** is chaos — data flowing with no type, no constraint, no shape. Wind carrying nothing. You have *how* but not *what*.

- **Motion without Persistence** is amnesia — computation that forgets everything between calls. A river with no banks that floods everywhere. You have *how* but no memory of where.

- **Persistence without Structure** is a junkyard — storage with no schema, a cache with no types. Bytes on disk with no meaning. You have *where* but not *what*.

- **Persistence without Motion** is a sealed vault — data stored perfectly but unreachable. A warehouse with no trucks. You have *where* but no way to get there.

### The Six Dyads

When two categories combine without the third, something specific is missing. Recognizing these dyads reveals what the absent category would provide:

| Dyad | Present | Missing | Result | Analogy |
|------|---------|---------|--------|---------|
| **S+M** | Structure + Motion | Persistence | Ephemeral computation — correct but forgetful | Pure functions: perfect transformations that remember nothing |
| **S+P** | Structure + Persistence | Motion | Frozen archive — stored but immobile | A database with no queries: data exists but can't flow |
| **M+P** | Motion + Persistence | Structure | Blind caching — flow with memory but no form | Caching raw bytes without knowing what they mean |
| **S only** | Structure | Motion, Persistence | Type definitions: shapes that do nothing, go nowhere | A blueprint that is never built |
| **M only** | Motion | Structure, Persistence | Undefined behavior: flow without form or memory | `any` flowing through `Promise.all` with no error handling |
| **P only** | Persistence | Structure, Motion | Dead storage: capacity with nothing in it, no way to use it | An empty, disconnected hard drive |

### The Trinity — Where Emergence Happens

When all three categories meet in a single abstraction, something qualitatively different emerges. The trinity produces *living* patterns — things that have form, flow, and memory simultaneously:

- **A state machine** has Structure (states and transition definitions), Motion (events trigger transitions), and Persistence (current state is remembered between events).

- **A circuit breaker** has Structure (the open/closed/half-open state enum), Motion (controls whether calls flow through), and Persistence (remembers failure count across calls).

- **A cache with revalidation** has Structure (typed cached values), Motion (background refresh flow), and Persistence (TTL-bounded storage with stale windows).

These trinity patterns are the most powerful because they honor all three concerns. They are also the hardest to implement correctly — which is why they get reimplemented (often poorly) in every project.

---

## Part II: The Liquidity Spectrum

Motion functions vary in how freely they allow data to flow between structural forms. We call this **liquidity** — the ease of conversion at category boundaries.

```
High Liquidity                                              Low Liquidity
(frictionless)                                              (forced/lossy)
     │                                                           │
     ▼                                                           ▼
fromNullable ─── toResult ─── map ─── flatMap ─── unwrapOr ─── unwrap ─── orThrow
     │              │           │         │            │           │          │
  nullable      Option →     within    chained     with         raw       back to
  → Option      Result     container   containers  default    extraction  exceptions
```

**High liquidity** functions convert between forms seamlessly, preserving information:
- `fromNullable`: nullable world → Option world (no information lost)
- `toResult`: Option → Result (adds error context)
- `tryCatch`: exception world → Result world (captures the error)

**Medium liquidity** functions transform within a container:
- `map`, `flatMap`: change the inner value, keep the container
- `filter`: may remove values (Option.filter: Some → None)

**Low liquidity** functions force extraction, potentially losing information or failing:
- `unwrapOr`: extracts with a default (loses the "was it present?" information)
- `unwrap`: extracts or throws (breaks out of Structure into Motion's exception path)
- `orThrow`: explicitly converts Result back to exception flow

**Good library design maximizes liquidity.** Every Structure type should have smooth conversion paths to every other Structure type. Gaps in liquidity are where bugs hide — developers write unsafe `as` casts and `!` assertions because the library doesn't provide a liquid path.

### The Liquidity Map of Receta

```
                    fromNullable
          nullable ──────────────► Option
              ▲                       │  ▲
              │ toNullable            │  │ fromResult
              │                       │  │
              │         toResult      ▼  │
          Result ◄───────────────── Option
              │  ▲                    │
              │  │ fromResult         │ (via toResult)
              │  │                    ▼
              │  │              Validation
              ▼  │                    │
          (throw)│                    │ toResult
           orThrow                    ▼
              │                    Result
              ▼
          exception flow
```

Every arrow is a liquidity path. Missing arrows are places where developers must write manual, unsafe conversion code.

---

## Part III: The Computation Cycle

Real programs don't flow linearly through the categories. They **cycle**:

```
    ╭───────────────────────────────────────────╮
    │                                           │
    ▼                                           │
STRUCTURE ──────► MOTION ──────► PERSISTENCE ───╯
  define            flow            store
  shape             transform       remember
  constrain         branch          index
                    recover         cache
    ▲                                           │
    │                                           │
    ╰───────────────────────────────────────────╯
           retrieve, extract, reshape
```

A concrete example:

```typescript
// 1. STRUCTURE — define the shape
const userSchema = schema({ name: isNonEmpty, email: isEmail })

// 2. MOTION — flow data through validation and API call
const result = await pipeAsync(
  rawInput,
  (input) => validate(userSchema, input),        // Structure → Motion
  (valid) => tryCatchAsync(() => saveUser(valid)), // Motion (can fail)
)

// 3. PERSISTENCE — cache the result
const getCachedUser = memoizeAsync(
  (id) => fetchUser(id),
  { ttl: 60_000 }
)

// 4. MOTION — retrieve from cache, flow again
const user = await retry(() => getCachedUser('123'))

// 5. STRUCTURE — extract final shape
const name = R.pipe(user, Result.map(u => u.name), Result.unwrapOr('Anonymous'))
```

**Programs that break the cycle have bugs:**
- Skip Structure → Motion? Untyped data flows through — runtime crashes.
- Skip Motion → Persistence? Every call refetches — performance death.
- Skip Persistence → Structure? Stale data served without revalidation — correctness bugs.

---

## Part IV: Applying the Framework

### Evaluating Any Library or API

The S/M/P framework applies beyond receta. Use it to evaluate any library:

| Library | Structure | Motion | Persistence | Assessment |
|---------|-----------|--------|-------------|------------|
| **Zod** | Strong (schemas, parsing) | Weak (no async flow) | None | Pure Structure — needs Motion/Persistence partners |
| **RxJS** | Weak (loosely typed) | Very strong (operators, scheduling) | Weak (replay subjects) | Pure Motion — needs Structure for type safety |
| **Redis client** | Weak (string keys/values) | Medium (async commands) | Strong (storage, TTL, eviction) | Pure Persistence — needs Structure for type safety |
| **Remeda** | Strong (typed transforms) | None (sync only) | None | Pure Structure — receta adds Motion and Persistence |
| **Receta** | Strong | Strong | Medium | **Balanced, with Persistence as the growth area** |

### Evaluating a System Design

For any system component, ask:

1. **What structures does it define?** (Types, schemas, invariants)
2. **How does data flow through it?** (Async paths, error handling, concurrency)
3. **Where does it store state?** (Caches, databases, indexes)
4. **Are all three connected?** (Liquid paths between S↔M↔P)

If any category is absent or poorly connected, that's where bugs and performance problems will concentrate.

### The Decision Tree for New Functions

```
Is this function primarily about...

STRUCTURE?
├── Does it create a new data shape?          → Constructor (ok, some, valid)
├── Does it transform an existing shape?      → Transformer (map, flatMap, evolve)
├── Does it constrain what's valid?           → Predicate/Validator (where, schema)
├── Does it decompose a structure?            → Extractor (unwrap, match, partition)
└── Does it access part of a structure?       → Projector (view, getPath, prop)

MOTION?
├── Does it control timing?                   → Timer (debounce, throttle, sleep, timeout)
├── Does it control concurrency?              → Concurrency (mapAsync, parallel, batch)
├── Does it handle error paths?               → Recovery (retry, tryCatch, poll)
├── Does it sequence operations?              → Composer (pipeAsync, sequential, compose)
└── Does it convert between forms?            → Liquidity (toResult, fromNullable, orThrow)

PERSISTENCE?
├── Does it store computed results?           → Cache (memoize, ttlCache, lruCache)
├── Does it create lookup structures?         → Index (indexByUnique, nest, groupByPath)
├── Does it window into collections?          → Paginator (paginate, paginateCursor)
├── Does it manage capacity limits?           → Capacity (lruCache, clamp, truncate)
└── Does it expire stored data?              → Invalidator (clearCache, invalidateWhere)

AT AN INTERSECTION?
├── Structure ↔ Motion                        → Boundary function (tryCatch, parse*)
├── Motion ↔ Persistence                      → Stateful flow control (memoize, throttle)
├── Structure ↔ Persistence                   → Indexed/windowed structure (paginate, nest)
└── Trinity (all three)                       → Emergent pattern (circuitBreaker, stateMachine)
```

---

## Part V: Complete Function Map

### Result Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `ok` | **Structure** | Constructs a success value |
| `err` | **Structure** | Constructs an error value |
| `tryCatch` | **S↔M** | Captures exception flow into Structure |
| `tryCatchAsync` | **S↔M** | Async exception capture path |
| `isOk` | **Structure** | Structural type guard |
| `isErr` | **Structure** | Structural type guard |
| `map` | **Structure** | Transforms inner shape |
| `mapErr` | **Structure** | Transforms error shape |
| `flatMap` | **Structure** | Chains structural transformations |
| `flatten` | **Structure** | Removes structural nesting |
| `unwrap` | **Structure** | Extracts from structure (or throws) |
| `unwrapOr` | **Structure** | Extracts with default |
| `unwrapOrElse` | **Structure** | Extracts with computed default |
| `match` | **Structure** | Pattern matches on structure |
| `tap` | **Motion** | Side-effect along the flow path |
| `tapErr` | **Motion** | Side-effect on error path |
| `collect` | **Structure** | Combines multiple Results into one |
| `partition` | **Structure** | Splits Results by variant |
| `fromNullable` | **S↔M** | Converts nullable flow to Result |
| `parseJSON` | **S↔M** | Parsing path (can fail) |
| `parseNumber` | **S↔M** | Parsing path (can fail) |
| `parseInt` | **S↔M** | Parsing path (can fail) |
| `orThrow` | **S↔M** | Converts Result back to exception flow |

### Option Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `some` | **Structure** | Constructs a present value |
| `none` | **Structure** | Constructs an absent value |
| `fromNullable` | **S↔M** | Captures nullable flow into Structure |
| `fromResult` | **S↔M** | Converts between algebraic structures |
| `tryCatch` | **S↔M** | Captures exception flow |
| `isSome` | **Structure** | Structural type guard |
| `isNone` | **Structure** | Structural type guard |
| `map` | **Structure** | Transforms inner shape |
| `flatMap` | **Structure** | Chains structural transformations |
| `filter` | **Structure** | Constrains inner value |
| `flatten` | **Structure** | Removes structural nesting |
| `unwrap` | **Structure** | Extracts from structure |
| `unwrapOr` | **Structure** | Extracts with default |
| `unwrapOrElse` | **Structure** | Extracts with computed default |
| `match` | **Structure** | Pattern matches on structure |
| `tap` | **Motion** | Side-effect along flow |
| `tapNone` | **Motion** | Side-effect on empty path |
| `collect` | **Structure** | Combines multiple Options |
| `partition` | **Structure** | Splits by variant |
| `toResult` | **S↔M** | Converts to Result flow |
| `toNullable` | **S↔M** | Converts back to nullable flow |

### Async Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `mapAsync` | **Motion** | Concurrent mapping with throughput control |
| `mapAsyncOrThrow` | **Motion** | Throwing variant of concurrent map |
| `filterAsync` | **Motion** | Concurrent filtering |
| `filterAsyncOrThrow` | **Motion** | Throwing variant |
| `parallel` | **Motion** | Run tasks concurrently |
| `parallelOrThrow` | **Motion** | Throwing variant |
| `sequential` | **Motion** | Run tasks in sequence |
| `sequentialOrThrow` | **Motion** | Throwing variant |
| `retry` | **Motion** | Retry with backoff (recovery path) |
| `timeout` | **Motion** | Time-bounded execution |
| `sleep` | **Motion** | Timing control |
| `poll` | **M↔P** | Repeated checking with state tracking |
| `batch` | **Motion** | Batched concurrent execution |
| `batchOrThrow` | **Motion** | Throwing variant |
| `debounce` | **M↔P** | Uses timer state to control timing |
| `throttle` | **M↔P** | Uses rate state to control throughput |
| `pipeAsync` | **Motion** | Async pipeline composition |
| `promiseAllSettled` | **Motion** | Concurrent settlement |
| `extractFulfilled` | **Structure** | Extracts fulfilled from settled |
| `extractRejected` | **Structure** | Extracts rejected from settled |
| `toResults` | **S↔M** | Converts settled to Result flow |

### Predicate Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `gt`, `gte`, `lt`, `lte` | **Structure** | Numeric constraints |
| `eq`, `neq` | **Structure** | Equality constraints |
| `between` | **Structure** | Range constraints |
| `startsWith`, `endsWith` | **Structure** | String shape constraints |
| `includes`, `matches` | **Structure** | Pattern constraints |
| `isEmpty`, `isNotEmpty` | **Structure** | Emptiness constraints |
| `and`, `or`, `not`, `xor` | **Structure** | Constraint combinators |
| `always`, `never` | **Structure** | Constant constraints |
| `where` | **Structure** | Object shape constraint builder |
| `oneOf` | **Structure** | Enumeration constraint |
| `prop` | **Structure** | Property-level constraint |
| `matchesShape` | **Structure** | Deep shape constraint |
| `hasProperty` | **Structure** | Existence constraint |
| `satisfies` | **Structure** | Custom constraint wrapper |
| `by` | **Structure** | Derived constraint |
| `is*` (type guards) | **Structure** | Type constraints |

### Validation Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `valid` | **Structure** | Constructs valid value |
| `invalid` | **Structure** | Constructs invalid value with errors |
| `fromPredicate` | **Structure** | Creates validator from constraint |
| `fromPredicateWithError` | **Structure** | Validator with typed errors |
| `fromResult` | **S↔M** | Converts from Result flow |
| `tryCatch`, `tryCatchAsync` | **S↔M** | Captures exceptions into validation |
| `isValid`, `isInvalid` | **Structure** | Structural type guards |
| `map`, `mapInvalid`, `flatMap`, `flatten` | **Structure** | Transforms validation shape |
| `collectErrors` | **Structure** | Accumulates errors |
| `validate`, `validateAll` | **Structure** | Applies constraints |
| `schema`, `partial` | **Structure** | Object-level constraint definition |
| `unwrap`, `unwrapOr`, `unwrapOrElse` | **Structure** | Extracts from validation |
| `match` | **Structure** | Pattern matches |
| `tap`, `tapInvalid` | **Motion** | Side-effects along validation flow |
| `toResult`, `toResultWith` | **S↔M** | Converts to Result flow |
| Built-in validators | **Structure** | Pre-built constraints |

### Collection Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `nest` | **S↔P** | Builds hierarchical index from flat data |
| `groupByPath` | **S↔P** | Groups into indexed structure |
| `diff` | **Structure** | Computes structural difference |
| `paginate` | **S↔P** | Windowed access to collection |
| `paginateCursor` | **S↔P** | Cursor-based windowed access |
| `indexByUnique` | **S↔P** | Creates unique lookup index |
| `union`, `intersect`, `symmetricDiff` | **Structure** | Set operations on collections |
| `flatten` | **Structure** | Flattens tree structure |
| `batchBy` | **Structure** | Groups consecutive elements |
| `windowSliding` | **Motion** | Sliding window over data stream |
| `cartesianProduct` | **Structure** | Generates all combinations |
| `moveIndex` | **Structure** | Rearranges elements |
| `insertAt` | **Structure** | Adds element to structure |
| `updateAt` | **Structure** | Modifies element in structure |
| `removeAtIndex` | **Structure** | Removes element from structure |

### Object Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `flatten` | **Structure** | Flattens nested to flat shape |
| `unflatten` | **Structure** | Unflattens flat to nested shape |
| `rename` | **Structure** | Changes key names |
| `mask` | **Structure** | Hides/reveals fields |
| `deepMerge` | **Structure** | Combines structures deeply |
| `getPath` | **Structure** | Accesses nested value (projection) |
| `setPath` | **Structure** | Sets nested value |
| `updatePath` | **Structure** | Updates nested value |
| `validateShape` | **Structure** | Validates object shape |
| `stripUndefined` | **Structure** | Removes undefined fields |
| `compact` | **Structure** | Removes falsy fields |
| `mapKeys`, `mapValues` | **Structure** | Transforms key/value shapes |
| `filterKeys`, `filterValues` | **Structure** | Constrains key/value sets |
| `transformKeys` | **Structure** | Deep key name transformation |
| `stripEmpty` | **Structure** | Removes empty values |

### String Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `template`, `parseTemplate` | **Structure** | String shape construction |
| `slugify` | **Structure** | Transforms to URL shape |
| `kebabCase`, `snakeCase`, `camelCase`, `pascalCase` | **Structure** | Case transformations |
| `capitalize`, `titleCase` | **Structure** | Capitalization transformation |
| `truncate`, `truncateWords` | **S↔P** | Capacity-limited representation |
| `pluralize` | **Structure** | Grammatical transformation |
| `initials` | **Structure** | Abbreviation extraction |
| `highlight` | **Structure** | Wraps matches in markup |
| `isEmpty`, `isBlank` | **Structure** | Emptiness constraints |
| `isEmail`, `isUrl`, etc. | **Structure** | Format constraints |
| `stripHtml`, `escapeHtml`, `unescapeHtml` | **Structure** | Sanitization transformations |
| `trim`, `trimStart`, `trimEnd` | **Structure** | Whitespace transformations |
| `escapeRegex`, `normalizeWhitespace` | **Structure** | Normalization transformations |
| `words`, `lines`, `between`, `extract` | **Structure** | Decomposition |

### Number Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `isInteger`, `isFinite`, `isPositive`, `isNegative` | **Structure** | Numeric constraints |
| `inRange` | **Structure** | Range constraint |
| `clamp` | **S↔P** | Capacity-bounded value |
| `format`, `toCurrency`, `toPercent`, `toCompact` | **Structure** | Display shape |
| `toPrecision`, `toOrdinal` | **Structure** | Display shape |
| `sum`, `average` | **Structure** | Aggregation |
| `round`, `roundTo` | **Structure** | Precision transformation |
| `percentage`, `ratio` | **Structure** | Relational calculation |
| `fromString`, `fromCurrency`, `parseFormattedNumber` | **S↔M** | Parsing path |
| `toBytes`, `fromBytes` | **S↔M** | Unit conversion path |
| `random` | **Motion** | Non-deterministic generation |
| `step` | **Structure** | Step-based rounding |
| `interpolate`, `normalize` | **Structure** | Range mapping |

### Memo Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `memoize` | **M↔P** | Stores Motion results in Persistence |
| `memoizeBy` | **M↔P** | Stores with custom key |
| `memoizeAsync` | **M↔P** | Stores async results |
| `ttlCache` | **Persistence** | Time-bounded storage |
| `lruCache` | **Persistence** | Capacity-bounded storage |
| `weakCache` | **Persistence** | GC-aware storage |
| `clearCache` | **Persistence** | Storage invalidation |
| `invalidateMany` | **Persistence** | Selective invalidation |
| `invalidateWhere` | **Persistence** | Predicate-based invalidation |
| `invalidateAll` | **Persistence** | Full invalidation |

### Lens Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `lens` | **Structure** | Defines accessor shape |
| `prop` | **Structure** | Property accessor |
| `path` | **Structure** | Deep path accessor |
| `index` | **Structure** | Array index accessor |
| `view` | **Structure** | Reads through lens (projection) |
| `set` | **Structure** | Writes through lens |
| `over` | **Structure** | Transforms through lens |
| `compose` | **Structure** | Combines lenses |
| `optional` | **Structure** | Nullable-aware lens |

### Compare Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `ascending`, `descending` | **Structure** | Ordering definition |
| `natural` | **Structure** | Natural ordering |
| `byKey` | **Structure** | Key-based ordering |
| `compose` | **Structure** | Combines orderings |
| `reverse` | **Structure** | Inverts ordering |
| `nullsFirst`, `nullsLast` | **Structure** | Null positioning |
| `withTiebreaker` | **Structure** | Fallback ordering |
| `byDate`, `byNumber`, `byString`, `byBoolean` | **Structure** | Type-specific orderings |
| `caseInsensitive`, `localeCompare` | **Structure** | String ordering variants |

### Function Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `ifElse` | **Motion** | Conditional flow branching |
| `when`, `unless` | **Motion** | Conditional execution path |
| `cond` | **Motion** | Multi-branch flow |
| `guard` | **Motion** | Early return path |
| `switchCase` | **Motion** | Pattern-matched flow |
| `compose` | **Motion** | Right-to-left flow composition |
| `converge` | **Motion** | Diverge-then-merge flow |
| `juxt` | **Motion** | Parallel application |
| `ap` | **Motion** | Applicative application |
| `flip` | **Structure** | Argument reordering |
| `partial`, `partialRight` | **Structure** | Partial application (structural) |
| `unary`, `binary`, `nAry` | **Structure** | Arity constraints |
| `tap` | **Motion** | Side-effect in flow |
| `tryCatch` | **S↔M** | Exception capture path |
| `memoize` | **M↔P** | Result storage |

---

## Part VI: Category Distribution

```
Structure    ████████████████████████████████████████████  ~55%
S↔M bridges  ██████████                                    ~10%
Motion       ████████████████████                           ~20%
M↔P bridges  ████                                           ~5%
S↔P bridges  ████                                           ~5%
Persistence  ████████                                       ~5%
Trinity      ░░░░                                           ~0%  ← THE GAP
```

This refined view shows receta is well-balanced between pure Structure and pure Motion, with reasonable Persistence. But the **intersection functions** — especially Motion↔Persistence and Trinity patterns — are underdeveloped. These are the functions the world needs most. See [PROPOSED-FUNCTIONS.md](./PROPOSED-FUNCTIONS.md) for what fills these gaps.

### By Module Affinity

| Module | Primary | Secondary | Intersection Role |
|--------|---------|-----------|-------------------|
| **result** | Structure | — | S↔M boundary (tryCatch, parse*, orThrow) |
| **option** | Structure | — | S↔M boundary (fromNullable, toResult) |
| **async** | Motion | — | Some M↔P (debounce, throttle, poll) |
| **predicate** | Structure | — | Pure constraint definition |
| **validation** | Structure | — | S↔M boundary (tryCatch, toResult) |
| **collection** | Structure | Persistence | S↔P boundary (nest, paginate, indexByUnique) |
| **object** | Structure | — | Pure shape manipulation |
| **string** | Structure | — | Pure shape transformation |
| **number** | Structure | — | S↔M boundary (parsing functions) |
| **memo** | Persistence | Motion | M↔P boundary (memoize*, caches) |
| **lens** | Structure | — | Pure structural access |
| **compare** | Structure | — | Pure ordering definition |
| **function** | Motion | Structure | S↔M (tryCatch) + M↔P (memoize) |

---

## Part VII: Cross-Cutting Patterns

### Boundary Functions

The most important functions in any library are the ones at category boundaries — they are the **connective tissue** that makes computation whole:

```
Structure ←→ Motion (well-covered ✓)
├── tryCatch / tryCatchAsync   Exception path → Result structure
├── fromNullable               Nullable flow → Option/Result structure
├── toResult / fromResult      Conversion between algebraic structures
├── orThrow                    Result structure → exception path
├── parse* (JSON, Number)      Raw input flow → typed structure
└── tap / tapErr               Side-effects along the flow

Motion ←→ Persistence (sparse — needs growth)
├── memoize / memoizeAsync     Store computation results
├── debounce / throttle        Timer/rate state controls flow
├── poll                       Repeated flow with state
└── (gap: no circuit breaker, rate limiter, deduplication, SWR)

Structure ←→ Persistence (moderate — some coverage)
├── indexByUnique              Array structure → lookup index
├── nest / groupByPath         Flat structure → hierarchical index
├── paginate / paginateCursor  Collection → windowed view
├── lruCache                   Capacity-constrained storage
├── clamp / truncate           Value bounded by capacity
└── (gap: no snapshot, changelog, serialize/deserialize)

Trinity: Structure + Motion + Persistence (absent)
└── (gap: no circuit breaker, state machine, resource management, queue)
```

### The Cycle in Practice

Every well-structured application cycles through S→M→P repeatedly. Here's a real-world example:

```typescript
// STRUCTURE: Define the shape of a user request
const requestSchema = Validation.schema({
  email: Validation.isEmail,
  age: Validation.fromPredicate(Predicate.gte(18), 'Must be 18+'),
})

// MOTION: Flow the request through validation + API call
const processRequest = pipeAsync(
  rawInput,
  (input) => Validation.validate(requestSchema, input),  // Structure
  (validated) => Validation.toResult(validated),           // S↔M bridge
  (result) => Result.flatMap(result, (user) =>            // Motion
    Result.tryCatchAsync(() => saveUser(user))             // S↔M bridge
  ),
)

// PERSISTENCE: Cache the result
const cachedProcess = memoizeAsync(processRequest, {       // M↔P bridge
  ttl: 300_000,                                           // Persistence
  key: (input) => input.email,                             // Structure
})

// MOTION: Retry with circuit breaking (currently missing from receta)
const resilientProcess = circuitBreaker(cachedProcess, {   // Trinity
  maxFailures: 5,                                          // Persistence
  resetTimeout: 30_000,                                    // Motion
})
```

This example shows exactly where the gaps are: the trinity function (`circuitBreaker`) doesn't exist yet, forcing developers to either skip resilience or build it from scratch.
