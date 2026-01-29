# Performance Metadata & Benchmarking System

> **Status**: Future Roadmap
> **Priority**: P2 (Post-Core Modules)
> **Impact**: High (Enables AI-driven optimization, performance budgets, auto-docs)

## Vision

Make Receta the **first functional programming library with built-in complexity analysis** — where every recipe has type-safe performance metadata that enables AI-driven optimization, compile-time performance budgets, and automatic documentation generation.

## Problem Statement

Currently, developers must:
- Guess at the performance characteristics of composed functions
- Manually analyze complexity of pipelines
- Discover performance issues at runtime
- Lack tooling to enforce performance budgets

With performance metadata, developers can:
- **See complexity before using a recipe** (documentation)
- **Let AI choose optimal implementations** (development)
- **Enforce performance budgets in CI/CD** (quality)
- **Monitor theoretical vs actual performance** (production)

## Goals

### For AI Development
- AI can select `O(n)` over `O(n²)` implementations automatically
- Automatic code review flags pipelines exceeding budgets
- Generated documentation includes performance characteristics

### For Developers
- Informed decisions when choosing recipes
- Type-safe performance budgets enforced at build time
- Know which functions to profile/optimize

### For Production
- Compare actual vs theoretical performance (detect regressions)
- Alert when complexity increases unexpectedly
- Predict cloud costs based on data size and complexity

## Core Components

### 1. Complexity Type System

```typescript
// src/types/complexity.ts

/**
 * Big-O complexity notation as TypeScript types
 */
export type Complexity =
  | 'O(1)'       // Constant
  | 'O(log n)'   // Logarithmic
  | 'O(n)'       // Linear
  | 'O(n log n)' // Linearithmic
  | 'O(n²)'      // Quadratic
  | 'O(2ⁿ)'      // Exponential

/**
 * Performance characteristics of a recipe
 */
export interface PerformanceProfile {
  /** Time complexity */
  time: Complexity

  /** Space complexity */
  space: Complexity

  /** Expected operations for n=1000 */
  operationsAt1K?: number

  /** Lazy or eager evaluation */
  evaluation: 'lazy' | 'eager'

  /** Allocates new memory? */
  allocates: boolean

  /** Async overhead type */
  asyncOverhead?: 'microtask' | 'event-loop' | 'none'
}
```

### 2. Recipe Metadata

```typescript
/**
 * Complete metadata for a recipe including performance
 */
export interface RecipeMetadata<TInput = unknown, TOutput = unknown> {
  /** Recipe name (e.g., "Result.map") */
  name: string

  /** Human-readable description */
  description: string

  /** Performance characteristics */
  performance: PerformanceProfile

  /** Other recipes this depends on */
  dependencies?: string[]

  /** Benchmark results (populated at runtime) */
  benchmark?: BenchmarkResult
}

export interface BenchmarkResult {
  /** Average execution time (ms) */
  avgTime: number

  /** Operations per second */
  opsPerSecond: number

  /** Sample size tested */
  sampleSize: number

  /** Memory allocated (bytes) */
  memoryDelta?: number
}
```

### 3. Annotated Functions

Every exported function gets metadata:

```typescript
// src/result/map.ts

export const mapMetadata: RecipeMetadata = {
  name: 'Result.map',
  description: 'Transform the Ok value of a Result',
  performance: {
    time: 'O(1)',       // Single conditional check
    space: 'O(1)',      // Only allocates new wrapper
    evaluation: 'eager',
    allocates: true,
    operationsAt1K: 1,  // Same regardless of input size
  },
  dependencies: ['Result.isOk', 'ok'],
}

export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E>
export function map<T, U>(
  fn: (value: T) => U
): <E>(result: Result<T, E>) => Result<U, E>
export function map(...args: unknown[]): unknown {
  return R.purry(mapImplementation, args)
}
```

### 4. Composition Complexity Analyzer

```typescript
// src/types/analyze-complexity.ts

/**
 * Calculate combined complexity from a pipeline
 */
export function analyzeComplexity(
  ...recipes: RecipeMetadata[]
): PerformanceProfile {
  return {
    time: dominantComplexity(recipes.map(r => r.performance.time)),
    space: summedComplexity(recipes.map(r => r.performance.space)),
    evaluation: recipes.some(r => r.performance.evaluation === 'lazy')
      ? 'lazy'
      : 'eager',
    allocates: recipes.some(r => r.performance.allocates),
    asyncOverhead: recipes.find(r => r.performance.asyncOverhead)
      ?.performance.asyncOverhead,
  }
}

/**
 * Get dominant time complexity (max)
 */
function dominantComplexity(complexities: Complexity[]): Complexity {
  const order: Complexity[] = [
    'O(1)',
    'O(log n)',
    'O(n)',
    'O(n log n)',
    'O(n²)',
    'O(2ⁿ)'
  ]

  return complexities.reduce((max, current) =>
    order.indexOf(current) > order.indexOf(max) ? current : max
  , 'O(1)')
}
```

### 5. Performance Budget Validation

```typescript
// src/types/performance-guard.ts

export interface PerformanceBudget {
  maxTimeComplexity: Complexity
  maxSpaceComplexity: Complexity
  maxAllocations?: boolean
}

export function validateBudget(
  profile: PerformanceProfile,
  budget: PerformanceBudget
): { ok: true } | { ok: false; violations: string[] } {
  const violations: string[] = []

  if (exceedsComplexity(profile.time, budget.maxTimeComplexity)) {
    violations.push(
      `Time ${profile.time} exceeds budget ${budget.maxTimeComplexity}`
    )
  }

  if (exceedsComplexity(profile.space, budget.maxSpaceComplexity)) {
    violations.push(
      `Space ${profile.space} exceeds budget ${budget.maxSpaceComplexity}`
    )
  }

  return violations.length > 0
    ? { ok: false, violations }
    : { ok: true }
}
```

### 6. Runtime Benchmarking

```typescript
// src/benchmark/runner.ts

export interface BenchmarkOptions {
  sizes?: number[]         // [10, 100, 1000, 10000]
  iterations?: number      // 100
  warmup?: number          // 10
}

/**
 * Benchmark a recipe function
 */
export async function benchmark<T, U>(
  metadata: RecipeMetadata<T, U>,
  fn: (input: T) => U,
  generateInput: (size: number) => T,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const { sizes = [10, 100, 1000, 10000], iterations = 100, warmup = 10 } = options

  const results: Array<{ size: number; time: number }> = []

  for (const size of sizes) {
    const input = generateInput(size)

    // Warmup runs
    for (let i = 0; i < warmup; i++) {
      fn(input)
    }

    // Actual measurement
    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      fn(input)
    }
    const end = performance.now()

    const avgTime = (end - start) / iterations
    results.push({ size, time: avgTime })
  }

  const largestTest = results[results.length - 1]

  return {
    avgTime: largestTest.time,
    opsPerSecond: 1000 / largestTest.time,
    sampleSize: sizes[sizes.length - 1],
  }
}
```

## Implementation Phases

### Phase 1: Type System Foundation (Week 1-2)
- [ ] Define `Complexity`, `PerformanceProfile`, `RecipeMetadata` types
- [ ] Implement `analyzeComplexity()` composition analyzer
- [ ] Implement `validateBudget()` validation function
- [ ] Write comprehensive tests for type system

### Phase 2: Annotate Existing Modules (Week 3-6)
- [ ] Add metadata to all `result` module functions
- [ ] Add metadata to all `option` module functions
- [ ] Add metadata to all `async` module functions
- [ ] Add metadata to all `validation` module functions
- [ ] Add metadata to all `predicate` module functions
- [ ] Add metadata to remaining modules (collection, object, string, etc.)

### Phase 3: Build Benchmark Suite (Week 7-8)
- [ ] Implement `benchmark()` runner with warmup and iterations
- [ ] Create input generators for each module
- [ ] Write benchmarks for all annotated functions
- [ ] Set up benchmark CI workflow (store results as artifacts)

### Phase 4: Auto-Generate Documentation (Week 9-10)
- [ ] Create doc generator script reading metadata
- [ ] Generate performance tables for each module
- [ ] Add complexity info to existing API reference docs
- [ ] Create visual complexity comparison charts

### Phase 5: CI/CD Integration (Week 11-12)
- [ ] Add performance budget validation to build
- [ ] Create GitHub Action for benchmark regression detection
- [ ] Add performance metrics to PR comments
- [ ] Set up monitoring dashboard for production usage

## Usage Examples

### Example 1: Analyze Pipeline Complexity

```typescript
import { analyzeComplexity } from 'receta/types/analyze-complexity'
import { mapMetadata } from 'receta/result/map'
import { flatMapMetadata } from 'receta/result/flatMap'
import { mapAsyncMetadata } from 'receta/async/mapAsync'

// Define pipeline
const userSignupPipeline = pipe(
  validateInput,           // O(1)
  Result.map(hashPassword),      // O(1)
  Result.flatMap(saveToDb),      // O(1)
  Result.flatMap(sendEmail)      // O(1)
)

// Analyze combined complexity
const complexity = analyzeComplexity(
  mapMetadata,
  flatMapMetadata,
  flatMapMetadata,
)

console.log(complexity)
// {
//   time: 'O(1)',
//   space: 'O(1)',
//   evaluation: 'eager',
//   allocates: true
// }
```

### Example 2: Enforce Performance Budget

```typescript
import { validateBudget } from 'receta/types/performance-guard'

const budget = {
  maxTimeComplexity: 'O(n)' as const,
  maxSpaceComplexity: 'O(n)' as const,
}

const validation = validateBudget(pipelineComplexity, budget)

if (!validation.ok) {
  throw new Error(`Performance budget exceeded: ${validation.violations.join(', ')}`)
}
```

### Example 3: AI Chooses Optimal Recipe

```typescript
// AI decision tree:
// Need to process 10,000 items with async operations
// Option 1: Sequential mapAsync (O(n), but slow)
// Option 2: Parallel mapAsync with concurrency=10 (O(n), faster)

const recipes = [
  { name: 'sequential', metadata: sequentialMapAsyncMetadata },
  { name: 'parallel', metadata: parallelMapAsyncMetadata },
]

// AI picks based on operationsAt1K and asyncOverhead
const optimal = recipes.reduce((best, current) =>
  current.metadata.performance.operationsAt1K < best.metadata.performance.operationsAt1K
    ? current
    : best
)

console.log(`AI chose: ${optimal.name}`)
```

### Example 4: Auto-Generated Performance Docs

```typescript
// scripts/generate-performance-docs.ts

function generatePerfDocs(metadata: RecipeMetadata): string {
  return `
## ${metadata.name}

${metadata.description}

### Performance

| Metric | Value |
|--------|-------|
| Time Complexity | ${metadata.performance.time} |
| Space Complexity | ${metadata.performance.space} |
| Evaluation | ${metadata.performance.evaluation} |
| Allocates | ${metadata.performance.allocates ? 'Yes' : 'No'} |

### Benchmark (n=1000)

${metadata.benchmark ? `
- Avg time: ${metadata.benchmark.avgTime.toFixed(3)}ms
- Ops/sec: ${metadata.benchmark.opsPerSecond.toFixed(0)}
- Memory: ${metadata.benchmark.memoryDelta ?? 'N/A'}
` : '*Run benchmarks to populate*'}
  `.trim()
}
```

## Benefits Summary

### For AI-Assisted Development
✅ AI selects optimal recipes based on complexity
✅ Automatic performance code review
✅ AI generates performance-aware pipelines

### For Developers
✅ See complexity before using a recipe
✅ Enforce performance budgets at build time
✅ Know which functions need optimization

### For Production
✅ Monitor actual vs theoretical performance
✅ Detect performance regressions automatically
✅ Predict costs based on data size

### For Documentation
✅ Auto-generated performance tables
✅ Visual complexity comparisons
✅ Real benchmark data in docs

## Open Questions

### Technical
- **Should complexity be part of the type system?** Could we make `map<T, U, Complexity = 'O(1)'>` part of the signature?
- **How to handle user-provided functions?** If `map(result, fn)` depends on `fn`'s complexity, how do we track that?
- **Memory profiling approach?** Use `process.memoryUsage()` or integrate with V8 profiler?

### API Design
- **Metadata co-location?** Keep metadata in same file or separate `*.metadata.ts` files?
- **Export strategy?** Export metadata alongside functions or via separate import path?
- **Composition helpers?** Should we provide `pipe.analyze()` to auto-analyze pipelines?

### Documentation
- **Visual format?** Use charts, tables, or both for complexity docs?
- **Benchmark display?** Show raw numbers or normalized scores?
- **Comparison mode?** Allow comparing multiple recipes side-by-side?

### CI/CD
- **Budget enforcement level?** Error, warning, or info?
- **Benchmark storage?** Store in git, artifacts, or external DB?
- **Regression threshold?** What % slowdown triggers a failure?

## Related Work

### Inspiration
- **Haskell's Criterion**: Robust benchmarking library
- **Rust's `#[bench]`**: Built-in benchmark annotation
- **OCaml's complexity annotations**: Academic research on type-level complexity

### Differentiation
Receta would be **unique** in combining:
- Type-safe complexity metadata
- Composition complexity analysis
- Runtime benchmark integration
- Auto-generated performance docs
- CI/CD performance budgets

## Success Metrics

### Phase 1 Complete
- [ ] All core types defined and tested
- [ ] Composition analyzer handles 10+ recipe combinations
- [ ] Budget validator catches violations correctly

### Phase 2 Complete
- [ ] 100% of exported functions have metadata
- [ ] TypeScript compiles without errors
- [ ] All metadata is accurate (manual review)

### Phase 3 Complete
- [ ] Benchmarks run for all recipes
- [ ] Results stored and accessible
- [ ] CI runs benchmarks on every PR

### Phase 4 Complete
- [ ] Performance docs auto-generated
- [ ] Docs include complexity tables and benchmarks
- [ ] Visual charts showing complexity comparisons

### Phase 5 Complete
- [ ] Performance budgets enforced in CI
- [ ] Regression detection working
- [ ] Production monitoring dashboard live

## Timeline

**Estimated Effort**: 12 weeks (3 months)
**Team Size**: 1-2 developers
**Dependencies**: All core modules complete

**Milestones**:
- **Month 1**: Type system + annotations for Result/Option/Async
- **Month 2**: Benchmarks + annotations for remaining modules
- **Month 3**: Documentation generation + CI/CD integration

## Next Steps

When ready to implement:

1. **Create RFC**: Detailed design doc with API proposals
2. **Prototype**: Build type system for one module (Result)
3. **Validate**: Get community feedback on approach
4. **Iterate**: Refine based on feedback
5. **Implement**: Follow phased approach above

## Related Documentation

- [CLAUDE.md](/CLAUDE.md) - Core development principles
- [LAYERED-ARCHITECTURE.md](/docs/LAYERED-ARCHITECTURE.md) - Receta's place in the FP stack
- [Module Development Guide](/docs/module-development-guide.md) - How to implement modules
- [Result Module](/src/result/) - Reference implementation pattern

---

**Status**: This is a future roadmap item. Implementation will begin after all P0-P2 core modules are complete.
