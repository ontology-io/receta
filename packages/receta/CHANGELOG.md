# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.4](https://github.com/ontology-io/receta/compare/receta@v0.3.3...receta@v0.3.4) (2026-03-07)


### Bug Fixes

* repository url ([22d1b70](https://github.com/ontology-io/receta/commit/22d1b7046529bb1735ff08b2f3c71b9f2be5f20a))

## [0.3.3](https://github.com/ontology-io/receta/compare/receta@v0.3.2...receta@v0.3.3) (2026-02-28)


### Features

* enable ESLint for all monorepo packages ([cc097ac](https://github.com/ontology-io/receta/commit/cc097ace967575b438c0747db716e31a33372e05))
* enable eslint-plugin-receta in receta package (dogfooding) ([d98fd0d](https://github.com/ontology-io/receta/commit/d98fd0d51c2eb66a0b64a9233f3d8c6caa55789d))
* introduce monorepo with nested packages under one deployment configuration ([57dc5fb](https://github.com/ontology-io/receta/commit/57dc5fb1a9936b2d7a804a92fc8e8e93e4075934))

## [0.3.2](https://github.com/ontology-io/receta/compare/v0.3.1...v0.3.2) (2026-02-24)


### Bug Fixes

* npm auth ([35d00f1](https://github.com/ontology-io/receta/commit/35d00f1da9f4bc2cb117eef05a87e60cd15e97e9))

## [0.3.1](https://github.com/ontology-io/receta/compare/v0.3.0...v0.3.1) (2026-02-23)


### Features

* publish to jsr, npm, github ([9a30951](https://github.com/ontology-io/receta/commit/9a30951fc97004cf381f376c22d6650a6e60c664))


### Bug Fixes

* linter issues ([7bc0123](https://github.com/ontology-io/receta/commit/7bc01237370d24036578d179f968c58452c180af))

## [0.3.0](https://github.com/ontology-io/receta/compare/v0.2.0...v0.3.0) (2026-02-21)


### ⚠ BREAKING CHANGES

* **testing:** Testing utilities moved from receta-test to receta/testing

### Features

* **testing:** merge testing utilities into root package ([3c73d56](https://github.com/ontology-io/receta/commit/3c73d566b7b354038b71ca06524201f316c87037))


### Bug Fixes

* remove unused import causing build failure ([cc60b38](https://github.com/ontology-io/receta/commit/cc60b386f67b185c095dab8e7dc7a371fe636c2d))

## [0.2.0](https://github.com/ontology-io/receta/compare/v0.1.0...v0.2.0) (2026-02-02)


### ⚠ BREAKING CHANGES

* **async:** All async error-handling functions now return Result<T, E> by default

### Features

* add act (local CI runner) support with npm scripts ([50008b7](https://github.com/ontology-io/receta/commit/50008b7af7fd25a9f9f908c9c76c3be53de39a68))
* add automated publishing ([9324444](https://github.com/ontology-io/receta/commit/93244440476e9f60f2dae72f01f8e9f0fdf2fdba))
* add cache invalidation utilities to Memo module ([f0fa412](https://github.com/ontology-io/receta/commit/f0fa412eb4695db32181431889c84834f3c2ae04))
* **eslint-plugin:** successfully integrate and test eslint-plugin-receta ([b3ad5f0](https://github.com/ontology-io/receta/commit/b3ad5f0325cbca08738f28a737f95abd31426b3a))
* **eslint:** add eslint-plugin-receta with autofix support ([2dfac77](https://github.com/ontology-io/receta/commit/2dfac77b67968824bb223af9363624b3acb14369))
* implement Async module with comprehensive test suite ([afeb0e3](https://github.com/ontology-io/receta/commit/afeb0e343f25880f85d21fa523586291358ea63a))
* implement Collection module with comprehensive test suite ([466991f](https://github.com/ontology-io/receta/commit/466991f3739e00a46e1d88c5317f1d9a3fbde807))
* implement Compare module with comprehensive test suite and examples ([f017802](https://github.com/ontology-io/receta/commit/f017802f7752f2feaff85d8a3ce38f72e4a71f7c))
* implement Function module with comprehensive test suite ([a087ca7](https://github.com/ontology-io/receta/commit/a087ca75b5a8bb71b5f97c4e092980c53e6e2dd7))
* implement Lens module with comprehensive test suite ([8318871](https://github.com/ontology-io/receta/commit/831887124a6d54e333599c356c01c017f7e2ce8a))
* implement Memo module with comprehensive memoization strategies ([f084587](https://github.com/ontology-io/receta/commit/f08458722b98398bfb584a21635962304add3e04))
* implement Number module with comprehensive test suite ([4c99e53](https://github.com/ontology-io/receta/commit/4c99e53b2b6e928823134edb12af1732c463197c))
* implement Object module with comprehensive test suite ([9028341](https://github.com/ontology-io/receta/commit/9028341906f02a8d14ffd63722be591f0eef89ec))
* implement Option module with comprehensive test suite ([aaf2c6a](https://github.com/ontology-io/receta/commit/aaf2c6a1cda480fe831bec4b31c82e656c961e5e))
* implement Predicate module with comprehensive test suite ([dcd1bc3](https://github.com/ontology-io/receta/commit/dcd1bc335cda9c8fe77d37e01eec6c5c5895cc0d))
* implement Result module with comprehensive test suite ([2df1a48](https://github.com/ontology-io/receta/commit/2df1a48a3d30ce8bf2e1d3aa7c25c2fd2a83646e))
* implement String module with comprehensive test suite ([0cb7d9c](https://github.com/ontology-io/receta/commit/0cb7d9cc090236604ef040dcfa7be0ae280c2880))
* implement Validation module with comprehensive error accumulation ([a8e69a2](https://github.com/ontology-io/receta/commit/a8e69a24af437d2abf18bc779388400c570ffb74))
* integrate Result pattern with async utilities ([38d32bb](https://github.com/ontology-io/receta/commit/38d32bb0c5594aee54744e33452bfa3b1acba0de))
* **number:** add roundTo, normalize, and parseFormattedNumber utilities ([701393e](https://github.com/ontology-io/receta/commit/701393ecd71a203a3abd24f9019afabb248df812))
* **object:** add transformKeys and stripEmpty utilities ([d20e570](https://github.com/ontology-io/receta/commit/d20e57034d1c873e3c7420d84a87bec472e21dfd))
* **result:** add safe parsing utilities (parseJSON, parseNumber, parseInt) ([2ebbd82](https://github.com/ontology-io/receta/commit/2ebbd82e9a50563a461a2bacb4d47e04f4e8035d))
* **string:** add 6 high-value string utility functions ([7fc49c0](https://github.com/ontology-io/receta/commit/7fc49c07f6f694172caf0bb02ad8e0d26dc3b6b7))
* **workspace:** setup Bun workspace with eslint-plugin-receta ([1eca104](https://github.com/ontology-io/receta/commit/1eca1047fe7f5473f5da6835084c654915d23915))


### Bug Fixes

* build eslint-plugin-receta before frozen-lockfile install ([726377c](https://github.com/ontology-io/receta/commit/726377cf7a1d0122a0921134b088d431d7cb9815))
* disable setup-bun cache to prevent stale lockfile issues ([4018cb9](https://github.com/ontology-io/receta/commit/4018cb96f847a15b2626fb376cc2c5c35b3d3fdc))
* eslint plugin in Ci workspace ([e6feaef](https://github.com/ontology-io/receta/commit/e6feaefd5090c7e6e8de6f3bcf87150c2ed36628))
* remove workspace dependency to resolve CI install issue ([dad382a](https://github.com/ontology-io/receta/commit/dad382a84b3dcee3b3d91941b309a181652810df))
* test cases ([6bce556](https://github.com/ontology-io/receta/commit/6bce556d91b2b647067d896fbf5edac88a87e381))
* use --ignore-scripts to break workspace dependency cycle ([12e06a8](https://github.com/ontology-io/receta/commit/12e06a84166f7b230e45dee6247fc925e4a69d5d))


### Code Refactoring

* **async:** make Result the default pattern ([f04d055](https://github.com/ontology-io/receta/commit/f04d055d7a43255e8621b6e591c2c9a16bd1b40c))

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

[0.1.0]: https://github.com/ontology-io/receta/releases/tag/v0.1.0
