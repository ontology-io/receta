# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-31

### Added

#### Core Modules
- **result** — Type-safe error handling with `Result<T, E>`
  - Constructors: `ok`, `err`, `tryCatch`, `tryCatchAsync`
  - Transformers: `map`, `mapErr`, `flatMap`, `flatMapAsync`
  - Extractors: `unwrap`, `unwrapOr`, `unwrapOrElse`
  - Combinators: `collect`, `combine`, `partition`
  - Pattern matching with `match`

- **option** — Nullable value handling with `Option<T>`
  - Constructors: `some`, `none`, `fromNullable`, `fromResult`
  - Transformers: `map`, `flatMap`, `filter`
  - Extractors: `unwrap`, `unwrapOr`, `unwrapOrElse`
  - Combinators: `collect`, `combine`
  - Interop with Result via `toResult`

- **async** — Async utilities for concurrency and retry
  - `mapAsync` — Concurrent mapping with configurable limits
  - `filterAsync` — Async filtering
  - `retry` — Retry with exponential backoff
  - `timeout` — Promise timeout wrapper
  - `debounce`, `throttle` — Rate limiting
  - `sleep` — Promise-based delay
  - `pipeAsync` — Async-aware pipe composition
  - `promiseAllSettled` — Typed wrapper for Promise.allSettled

- **predicate** — Composable predicate builders
  - Comparison: `gt`, `gte`, `lt`, `lte`, `between`
  - Combinators: `and`, `or`, `not`
  - Builders: `where`, `oneOf`, `matches`
  - Type guards integration

- **validation** — Form and data validation
  - `validate` — Single field validation
  - `combine` — Error accumulation across fields
  - `field` — Field-level validators
  - Integration with `string` validators

- **collection** — Advanced collection operations
  - `nest` — Type-safe grouping (returns Map)
  - `diff` — Set difference with added/removed/unchanged
  - `paginate`, `paginateCursor` — Pagination helpers
  - `indexByUnique` — Safe unique indexing returning Result
  - Set operations: `union`, `intersection`, `difference`, `symmetricDiff`
  - `flatten` — Tree to flat array with depth tracking
  - `batchBy` — Group consecutive items
  - `windowSliding` — Sliding window over arrays
  - `cartesianProduct` — All combinations (type-safe for 2-5 arrays)
  - `moveIndex`, `insertAt`, `updateAt`, `removeAtIndex` — Immutable array operations

- **object** — Safe object manipulation
  - `flatten`, `unflatten` — Nested object transformation
  - `getPath`, `hasPath` — Safe nested access
  - `mask` — Property whitelisting
  - `deepMerge` — Deep object merging
  - `validateShape` — Runtime shape validation
  - `renameKeys` — Key renaming with mapping
  - `transformKeys` — Deep case transformation (camelCase ↔ snake_case ↔ kebab-case ↔ PascalCase)
  - `stripEmpty` — Remove null/undefined/empty values

- **string** — String utilities and validation
  - Transformers: `slugify`, `camelCase`, `snakeCase`, `kebabCase`, `pascalCase`, `capitalize`, `titleCase`
  - Validators: `isEmail`, `isUrl`, `isEmpty`, `isNumeric`
  - Template: `template` — String interpolation
  - Sanitization: `escapeHtml`, `unescapeHtml`, `stripTags`
  - `pluralize` — Count-aware pluralization
  - `truncateWords` — Word-boundary truncation
  - `escapeRegex` — Safe regex patterns
  - `normalizeWhitespace` — Whitespace normalization
  - `initials` — Extract initials for avatars
  - `highlight` — Wrap matches in HTML tags

- **number** — Number formatting and validation
  - Formatting: `toCurrency`, `toBytes`, `toPercentage`, `toOrdinal`
  - Validation: `isPositive`, `isNegative`, `isInteger`, `inRange`
  - Math: `clamp`, `percentage`, `ratio`, `roundTo`, `normalize`
  - Parsing: `parseFormattedNumber`

- **memo** — Memoization strategies
  - `memoize` — Basic memoization
  - `memoizeBy` — Custom key extraction
  - `memoizeAsync` — Async memoization with deduplication
  - Cache strategies: TTL, LRU, WeakMap
  - Cache invalidation helpers

- **lens** — Functional lenses for immutable updates
  - Constructors: `lens`, `prop`, `path`, `index`
  - Operations: `view`, `set`, `over`
  - Composition: `compose`
  - Optional lenses for nullable paths

- **compare** — Comparator builders
  - Basic: `ascending`, `descending`
  - Combinators: `compose`, `reverse`
  - Type-specific: `natural`, `localeCompare`, `byDate`
  - Property-based: `by`, `byProp`

- **function** — Function combinators
  - Conditionals: `ifElse`, `when`, `unless`, `cond`, `switchCase`, `guard`
  - Composition: `compose`, `converge`, `juxt`, `ap`
  - Partial application: `partial`, `partialRight`, `flip`
  - Arity control: `unary`, `binary`, `nAry`
  - Utilities: `tap`, `tryCatch`, `memoize`, `once`, `identity`, `constant`

#### Documentation
- Comprehensive module guides (8 docs per module)
- Real-world examples for all modules
- Migration guides from vanilla patterns
- API reference documentation
- Module development guide

#### Project Infrastructure
- TypeScript configuration with strict type checking
- Test suite with Bun test runner
- Build system with TypeScript compiler
- Tree-shakeable module exports

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- N/A (initial release)

---

## Release Notes

This is the initial release of Receta, providing a comprehensive functional programming toolkit built on top of Remeda. All core modules are feature-complete and production-ready.

### Highlights
- 🎯 **Result-first error handling** — No more try/catch hell
- 🔒 **Type-safe nullability** — Option type eliminates undefined bugs
- ⚡ **Async utilities** — Concurrency control, retry, debounce/throttle
- 🧩 **Composable predicates** — Readable, reusable filter logic
- ✅ **Form validation** — Error accumulation out of the box
- 📦 **Tree-shakeable** — Import only what you need
- 📚 **Comprehensive docs** — 100+ documentation files

### Breaking Changes
- None (initial release)

### Migration Guide
- See individual module documentation for migration from vanilla TypeScript patterns
- [Result Migration Guide](./docs/result/06-migration.md)
- [Option Migration Guide](./docs/option/06-migration.md)
- [Async Migration Guide](./docs/async/06-migration.md)

[0.1.0]: https://github.com/khaledmaher/receta/releases/tag/v0.1.0
