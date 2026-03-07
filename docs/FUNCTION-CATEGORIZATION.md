# Function Categorization Framework

> An ontological lens for understanding receta's ~240+ functions through three fundamental concerns.

## The Three Categories

Every function in receta addresses one (or more) of three fundamental computational concerns:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   STRUCTURE          MOTION            PERSISTENCE           │
│   ─────────          ──────            ───────────           │
│   The "what"         The "how"         The "where/when"      │
│                                                              │
│   Creating &         Speed,            Storage,              │
│   transforming       throughput,        capacity,             │
│   data shapes        concurrency,       maps of motion        │
│                      paths & flow       & structure           │
│                                                              │
│   ┌─────┐            ┌─────┐           ┌─────┐              │
│   │ { } │ ──────────►│ ≋≋≋ │──────────►│ ▤▤▤ │              │
│   └─────┘            └─────┘           └─────┘              │
│   Form               Flow              Storage               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Structure — The "What"

**Concern**: Creating, mutating, and constraining data shapes.

Structure functions define *what* data looks like. They construct values, transform shapes, validate forms, and establish invariants. Structure is about the geometry of data — its type, its fields, its relationships.

| Aspect | Description |
|--------|-------------|
| Construction | Creating typed values (`ok`, `some`, `valid`) |
| Transformation | Changing shape without changing identity (`map`, `flatMap`, `flatten`) |
| Constraint | Defining what's valid (`where`, `gt`, `schema`, type guards) |
| Decomposition | Breaking structures apart (`unwrap`, `match`, `partition`) |
| Projection | Viewing parts of structures (`view`, `getPath`, `prop`) |

### Motion — The "How"

**Concern**: Speed, throughput, concurrency, paths, and liquidity of structures.

Motion functions define *how* data moves. They control timing, parallelism, error recovery paths, and the flow of values through pipelines. Motion is about the dynamics of computation — when things happen, how fast, through what channels.

| Aspect | Description |
|--------|-------------|
| Concurrency | Parallel execution (`mapAsync`, `parallel`, `batch`) |
| Timing | When things happen (`debounce`, `throttle`, `sleep`, `timeout`) |
| Recovery | Error paths and retry strategies (`retry`, `tryCatch`, `poll`) |
| Composition | Sequencing operations (`pipeAsync`, `sequential`, `compose`) |
| Liquidity | Converting between forms in flight (`toResult`, `fromNullable`) |

### Persistence — The "Where/When"

**Concern**: Storage, capacity, maps of motion and structure.

Persistence functions define *where* data lives and *when* it expires. They manage caches, indexes, pagination windows, and capacity limits. Persistence is about the statics of data — how it's stored, retrieved, and evicted.

| Aspect | Description |
|--------|-------------|
| Caching | Storing computed results (`memoize`, `ttlCache`, `lruCache`) |
| Indexing | Fast lookup structures (`indexByUnique`, `nest`, `groupByPath`) |
| Pagination | Windowed access to collections (`paginate`, `paginateCursor`) |
| Capacity | Managing size limits (`lruCache`, `truncate`, `clamp`) |
| Invalidation | Expiring stored data (`clearCache`, `invalidateMany`, `invalidateWhere`) |

---

## Complete Function Map

### Result Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `ok` | **Structure** | Constructs a success value |
| `err` | **Structure** | Constructs an error value |
| `tryCatch` | **Motion** | Captures exception flow into Structure |
| `tryCatchAsync` | **Motion** | Async exception capture path |
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
| `fromNullable` | **Motion** | Converts nullable flow to Result |
| `parseJSON` | **Motion** | Parsing path (can fail) |
| `parseNumber` | **Motion** | Parsing path (can fail) |
| `parseInt` | **Motion** | Parsing path (can fail) |
| `orThrow` | **Motion** | Converts Result back to exception flow |

### Option Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `some` | **Structure** | Constructs a present value |
| `none` | **Structure** | Constructs an absent value |
| `fromNullable` | **Motion** | Captures nullable flow into Structure |
| `fromResult` | **Motion** | Converts between algebraic structures |
| `tryCatch` | **Motion** | Captures exception flow |
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
| `toResult` | **Motion** | Converts to Result flow |
| `toNullable` | **Motion** | Converts back to nullable flow |

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
| `poll` | **Motion** | Repeated async checking |
| `batch` | **Motion** | Batched concurrent execution |
| `batchOrThrow` | **Motion** | Throwing variant |
| `debounce` | **Motion** | Rate limiting (timing) |
| `throttle` | **Motion** | Rate limiting (throughput) |
| `pipeAsync` | **Motion** | Async pipeline composition |
| `promiseAllSettled` | **Motion** | Concurrent settlement |
| `extractFulfilled` | **Structure** | Extracts fulfilled from settled |
| `extractRejected` | **Structure** | Extracts rejected from settled |
| `toResults` | **Motion** | Converts settled to Result flow |

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
| `fromResult` | **Motion** | Converts from Result flow |
| `tryCatch`, `tryCatchAsync` | **Motion** | Captures exceptions into validation |
| `isValid`, `isInvalid` | **Structure** | Structural type guards |
| `map`, `mapInvalid`, `flatMap`, `flatten` | **Structure** | Transforms validation shape |
| `collectErrors` | **Structure** | Accumulates errors (Structure of errors) |
| `validate`, `validateAll` | **Structure** | Applies constraints |
| `schema`, `partial` | **Structure** | Object-level constraint definition |
| `unwrap`, `unwrapOr`, `unwrapOrElse` | **Structure** | Extracts from validation |
| `match` | **Structure** | Pattern matches |
| `tap`, `tapInvalid` | **Motion** | Side-effects along validation flow |
| `toResult`, `toResultWith` | **Motion** | Converts to Result flow |
| Built-in validators | **Structure** | Pre-built constraints |

### Collection Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `nest` | **Persistence** | Creates hierarchical index |
| `groupByPath` | **Persistence** | Groups into indexed structure |
| `diff` | **Structure** | Computes structural difference |
| `paginate` | **Persistence** | Windowed access |
| `paginateCursor` | **Persistence** | Cursor-based windowed access |
| `indexByUnique` | **Persistence** | Creates unique lookup index |
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
| `truncate`, `truncateWords` | **Persistence** | Capacity-limited representation |
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
| `clamp` | **Persistence** | Capacity-bounded value |
| `format`, `toCurrency`, `toPercent`, `toCompact` | **Structure** | Display shape |
| `toPrecision`, `toOrdinal` | **Structure** | Display shape |
| `sum`, `average` | **Structure** | Aggregation |
| `round`, `roundTo` | **Structure** | Precision transformation |
| `percentage`, `ratio` | **Structure** | Relational calculation |
| `fromString`, `fromCurrency`, `parseFormattedNumber` | **Motion** | Parsing path |
| `toBytes`, `fromBytes` | **Motion** | Unit conversion path |
| `random` | **Motion** | Non-deterministic generation |
| `step` | **Structure** | Step-based rounding |
| `interpolate`, `normalize` | **Structure** | Range mapping |

### Memo Module

| Function | Category | Rationale |
|----------|----------|-----------|
| `memoize` | **Persistence** | Stores computed results |
| `memoizeBy` | **Persistence** | Stores with custom key |
| `memoizeAsync` | **Persistence** | Stores async results |
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
| `tryCatch` | **Motion** | Exception capture path |
| `memoize` | **Persistence** | Result storage |

---

## Category Distribution

```
Structure    ████████████████████████████████████████████  ~60%
Motion       █████████████████████████                     ~28%
Persistence  ████████                                      ~12%
```

This distribution makes sense — receta is fundamentally a *structural* library (creating and transforming data types). Motion functions enable data flow, and Persistence functions handle caching and indexing.

### By Module Affinity

| Module | Primary | Secondary | Notes |
|--------|---------|-----------|-------|
| **result** | Structure | Motion | Core algebraic type; Motion for flow conversions |
| **option** | Structure | Motion | Core algebraic type; Motion for flow conversions |
| **async** | Motion | — | Almost entirely Motion |
| **predicate** | Structure | — | Entirely constraint/shape definition |
| **validation** | Structure | Motion | Constraint definition with flow conversions |
| **collection** | Structure | Persistence | Structural ops + indexing/pagination |
| **object** | Structure | — | Entirely shape manipulation |
| **string** | Structure | — | Entirely shape transformation |
| **number** | Structure | Motion | Shape + parsing paths |
| **memo** | Persistence | — | Entirely storage/caching |
| **lens** | Structure | — | Entirely structural access |
| **compare** | Structure | — | Entirely ordering definition |
| **function** | Motion | Structure | Flow combinators + structural adapters |

---

## Cross-Cutting Patterns

### Functions that span categories

Some functions naturally bridge categories:

```
Structure ←→ Motion
├── tryCatch:      Captures Motion (exceptions) into Structure (Result/Option)
├── fromNullable:  Captures Motion (nullable flow) into Structure (Option/Result)
├── toResult:      Converts Structure (Option) to Structure (Result) via Motion
├── orThrow:       Converts Structure (Result) back to Motion (exception flow)
└── parse*:        Motion (parsing can fail) producing Structure (typed value)

Motion ←→ Persistence
├── memoize:       Stores Motion results in Persistence (cache)
├── debounce:      Uses Persistence (timer state) to control Motion (timing)
├── throttle:      Uses Persistence (rate state) to control Motion (throughput)
└── poll:          Motion (repeated checking) with Persistence (state tracking)

Structure ←→ Persistence
├── indexByUnique:  Builds Persistence (lookup map) from Structure (array)
├── paginate:       Creates Persistence (windowed view) of Structure (collection)
├── nest:           Builds Persistence (hierarchical index) from Structure (flat data)
├── lruCache:       Persistence with Structure (capacity constraint)
└── clamp:          Structure (range) enforcing Persistence (bounds)
```

### The Flow of Computation

A typical receta pipeline flows through all three categories:

```
1. STRUCTURE    → Define the shape
   ok(rawData)

2. MOTION       → Move it through transformations
   pipe(data, Result.map(transform), Result.flatMap(validate))

3. PERSISTENCE  → Store the result
   memoize(computeExpensiveResult)

4. MOTION       → Retrieve and flow again
   retry(() => fetchFromCache(key))

5. STRUCTURE    → Extract final shape
   Result.unwrapOr(result, defaultValue)
```

---

## Design Implications

### When adding new functions

Ask: **"Is this function primarily about Structure, Motion, or Persistence?"**

- If **Structure**: It should be pure, synchronous, and focused on data shape
- If **Motion**: It may be async, have timing concerns, or control execution flow
- If **Persistence**: It manages state, storage, or capacity

### Module placement guidance

```
Need to create/transform data shapes?          → result, option, object, string, number, lens
Need to define constraints/invariants?          → predicate, validation, compare
Need to control execution flow/timing?          → async, function
Need to store/retrieve/invalidate?              → memo, collection (indexing/pagination)
Need hierarchical/indexed access?               → collection, lens
```

### The "liquidity" insight

Motion functions are about the *liquidity* of structures — how easily they flow between forms:

- **High liquidity**: `fromNullable`, `toResult`, `tryCatch` — seamless conversion
- **Medium liquidity**: `map`, `flatMap` — transformation within a container
- **Low liquidity**: `unwrap`, `orThrow` — forced extraction, may fail

Good APIs maximize liquidity by providing smooth conversion paths between all Structure types.
