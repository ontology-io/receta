# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Receta-Trace

> Runtime execution tracing for @ontologyio/receta — observe function pipelines with zero-overhead opt-in tracing

## Project Overview

**receta-trace** is a lightweight, zero-overhead execution tracing library for Receta pipelines. It provides observability into functional pipelines by recording execution spans, timing, inputs, outputs, and errors.

This package is part of the Receta monorepo and sits alongside the main receta package (`packages/receta`).

```
┌─────────────────────────────────────┐
│         Your Application            │
├─────────────────────────────────────┤
│    receta-trace (Observability)     │  ← This package
├─────────────────────────────────────┤
│    receta (FP Patterns)             │
├─────────────────────────────────────┤
│    Remeda (FP Primitives)           │
└─────────────────────────────────────┘
```

---

## Common Development Commands

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/__tests__/traced.test.ts
```

### Building & Type Checking

```bash
# Type check without emitting files
bun run typecheck

# Build the project (compiles TypeScript to dist/)
bun run build

# Clean build artifacts
bun run clean
```

### Running Examples

```bash
# Run the main trace usage examples
bun run examples/trace-usage.ts

# Generate and view a complex trace
bun run examples/generate-trace.ts
```

### Development Workflow

```bash
# Typical workflow when developing:
bun test --watch           # Keep running in terminal
bun run typecheck          # Run before committing
bun run build              # Verify build works
```

---

## Architecture

### Core Concepts

**receta-trace** is built around several key abstractions:

1. **Tracer** - Scoped execution context that collects spans
2. **Span** - A single function execution record with timing, inputs, outputs, and events
3. **Trace** - The complete tree of spans produced by a traced execution
4. **TracedFunction** - A function wrapped with `traced()` that records spans when executed within a tracer context
5. **Context** - AsyncLocalStorage-based context propagation for zero-overhead when inactive

### Zero-Overhead Design

When **no tracer is active**, traced functions have near-zero overhead:
- Single `getActiveContext()` check (AsyncLocalStorage lookup)
- If `undefined`, immediately call original function
- No span creation, no data capture, no performance impact

When **a tracer is active**, full span collection happens:
- Timing via `performance.now()`
- Input/output capture (configurable)
- Parent-child relationship tracking
- Event emission during execution
- Tag/annotation support

### Context Propagation

Uses Node.js `AsyncLocalStorage` to propagate trace context across:
- Synchronous function calls
- Async/await boundaries
- Promise chains
- Nested traced functions

Context contains:
- `state` - Tracer configuration and collected root spans
- `currentSpanId` - Active span ID for parent tracking
- `currentSpan` - Mutable span being recorded
- `depth` - Nesting depth for maxDepth enforcement

### Result-Aware Tracing

The tracing system automatically detects Receta `Result` types:
- If a function returns `Err<E>`, the span is marked with `status: 'error'`
- The error value is extracted from `Err.error` and stored in `span.error`
- This provides automatic error tracking without manual instrumentation

---

## Module Structure

```
src/
├── types.ts              # Core type definitions (Span, Trace, TracedFunction, etc.)
├── context.ts            # AsyncLocalStorage-based context management
├── span.ts               # Span creation, finalization, event emission
├── tracer.ts             # Tracer creation and execution (run/runAsync)
├── traced.ts             # traced() wrapper for instrumenting functions
├── tracedPipe.ts         # Traced sync pipe (auto-instruments steps)
├── tracedPipeAsync.ts    # Traced async pipe (auto-instruments async steps)
├── async.ts              # Traced wrappers for Receta async functions
│                         # (tracedRetry, tracedTimeout, tracedMapAsync)
├── format.ts             # Output formatters (toTreeString, toJSON)
├── index.ts              # Public API exports
└── __tests__/            # Test suite
    ├── traced.test.ts
    ├── tracer.test.ts
    ├── tracedPipe.test.ts
    ├── tracedPipeAsync.test.ts
    ├── async.test.ts
    ├── emitEvent.test.ts
    ├── tags.test.ts
    ├── format.test.ts
    └── resultAwareness.test.ts
```

---

## Key Implementation Patterns

### Pattern 1: Traced Function Wrapper

All function instrumentation uses the `traced()` wrapper:

```typescript
// String shorthand for simple cases
const double = traced('double', (x: number) => x * 2)

// Full metadata for complex cases
const fetchUser = traced(
  { name: 'fetchUser', module: 'users', category: 'io' },
  async (id: string) => db.findUser(id)
)

// Works for sync or async functions
// Automatically handles Promise return types
```

### Pattern 2: Span Lifecycle

Each span goes through:
1. **Creation** - `createSpan()` called with parent context
2. **Execution** - Function runs within `runWithContext(childCtx, fn)`
3. **Finalization** - `finalizeSpan()` called with output/error
4. **Freezing** - Mutable span converted to immutable Span
5. **Tree Building** - `buildTrace()` assembles the final trace tree

### Pattern 3: Async Handling

Async functions are handled transparently:

```typescript
// In recordSpan():
const result = runWithContext(childCtx, () => fn(...args))

if (result instanceof Promise) {
  return result.then(
    (value) => {
      finalizeSpan(ctx.state, span, value)
      return value
    },
    (error) => {
      finalizeSpan(ctx.state, span, undefined, error)
      throw error
    }
  ) as T
}
```

This ensures:
- Span finalization happens after Promise settles
- Errors are captured before being re-thrown
- Timing includes full async execution

### Pattern 4: Auto-Naming in Traced Pipes

`tracedPipe` and `tracedPipeAsync` automatically name functions:

```typescript
function getFnName(fn: AnyFn, index: number): string {
  if (isTraced(fn)) {
    return fn.__trace_meta.name  // Use explicit name
  }
  if (fn.name && fn.name !== '' && fn.name !== 'anonymous') {
    return fn.name  // Use function.name
  }
  return `step-${index}`  // Fallback
}
```

Priority: `__trace_meta.name` > `fn.name` > `step-N`

### Pattern 5: Event Emission

Functions can emit events during execution:

```typescript
const fetchData = traced('fetchData', async (url: string) => {
  emitEvent('cache-check', { url })
  const cached = cache.get(url)
  if (cached) {
    emitEvent('cache-hit')
    return cached
  }
  emitEvent('cache-miss')
  return await fetch(url)
})
```

Events are timestamped and attached to the current span, providing insight into decision points and retries.

---

## Dependency Management

### Peer Dependencies

This package has **peer dependencies** on:
- `@ontologyio/receta` - For Result type detection and async wrappers

### Development Dependencies

- `remeda` - For internal utilities (not exported)
- `vitest` - For testing

### TypeScript Project References

The `tsconfig.json` uses TypeScript project references:

```json
{
  "references": [
    { "path": "../receta" }
  ],
  "compilerOptions": {
    "paths": {
      "@ontologyio/receta": ["../receta/src/index.ts"],
      "@ontologyio/receta/*": ["../receta/src/*/index.ts"]
    }
  }
}
```

This ensures:
- Type checking works across packages during development
- Builds happen in the correct order (receta → receta-trace)

---

## Testing Conventions

### Test Organization

Tests are organized by functionality:
- `traced.test.ts` - Core traced() wrapper behavior
- `tracer.test.ts` - Tracer creation and run/runAsync
- `tracedPipe.test.ts` - Sync pipe instrumentation
- `tracedPipeAsync.test.ts` - Async pipe instrumentation
- `async.test.ts` - Traced async wrappers (retry, timeout, mapAsync)
- `emitEvent.test.ts` - Event emission within spans
- `tags.test.ts` - Tag and annotation APIs
- `format.test.ts` - Output formatting (toTreeString, toJSON)
- `resultAwareness.test.ts` - Automatic Result Err detection

### Test Patterns

```typescript
import { describe, it, expect } from 'vitest'
import { traced, createTracer } from '../index'

describe('traced()', () => {
  it('returns original value when no tracer active', () => {
    const fn = traced('test', (x: number) => x * 2)
    expect(fn(5)).toBe(10)
  })

  it('records span when tracer is active', () => {
    const fn = traced('double', (x: number) => x * 2)
    const tracer = createTracer()
    const { result, trace } = tracer.run(() => fn(5))

    expect(result).toBe(10)
    expect(trace.rootSpan.name).toBe('double')
    expect(trace.rootSpan.input).toBe(5)
    expect(trace.rootSpan.output).toBe(10)
  })
})
```

### Coverage Goals

Aim for 90%+ coverage on:
- All exported functions
- Both sync and async code paths
- Error handling paths
- Edge cases (empty inputs, maxDepth, disabled capture)

---

## Public API Surface

### Core Tracing

- `createTracer(options?)` - Create a tracer instance
- `traced(meta, fn)` - Wrap a function with tracing
- `isTraced(fn)` - Check if function is traced
- `getActiveContext()` - Get current trace context (usually internal)

### Span Runtime APIs

- `emitEvent(name, data?)` - Emit timestamped event on current span
- `setTag(key, value)` - Set searchable tag on current span
- `annotate(key, value)` - Alias for setTag (semantic difference)

### Traced Pipes

- `tracedPipe(value, ...fns, options?)` - Traced sync pipeline
- `tracedPipeAsync(value, ...fns, options?)` - Traced async pipeline

### Async Wrappers

- `tracedRetry(retryFn, fn, options)` - Traced retry with attempt events
- `tracedTimeout(timeoutFn, promise, ms, name?)` - Traced timeout
- `tracedMapAsync(mapAsyncFn, items, fn, options)` - Traced concurrent mapping

### Formatters

- `toTreeString(trace, options?)` - Format trace as tree string
- `toJSON(trace)` - Convert trace to JSON-serializable format

### Types

- `Span` - Single execution record
- `Trace` - Complete trace tree
- `SpanEvent` - Timestamped event within a span
- `TracedFunction<F>` - Function wrapped with traced()
- `Tracer` - Tracer interface (run/runAsync)
- `TracerOptions` - Tracer configuration

---

## Configuration Options

### TracerOptions

```typescript
interface TracerOptions {
  captureInputs?: boolean       // Default: true
  captureOutputs?: boolean      // Default: true
  maxDepth?: number             // Default: Infinity
  clock?: () => number          // Default: performance.now
  generateId?: () => string     // Default: crypto.randomUUID
  onSpan?: (span: Span) => void // Default: undefined
}
```

Usage:

```typescript
const tracer = createTracer({
  captureInputs: false,    // Disable input capture for privacy
  maxDepth: 10,            // Stop tracing beyond 10 levels
  onSpan: (span) => {      // Stream spans as they complete
    console.log('Span completed:', span.name, span.durationMs)
  }
})
```

---

## Relationship to Main Receta Package

This package is a **companion** to `@ontologyio/receta`, not a dependency:

- **Independent**: Can be used standalone with any functions
- **Integrates**: Provides traced wrappers for Receta async utilities
- **Result-aware**: Automatically detects Receta Result types
- **Compatible**: Works seamlessly with Receta pipelines

Users can:
1. Use receta alone (no tracing)
2. Add receta-trace for observability (opt-in)
3. Mix traced and untraced functions freely

---

## Development Guidelines

### When Adding New Features

1. **Maintain zero-overhead**: Ensure `getActiveContext() === undefined` fast path
2. **Support both sync/async**: Handle Promise returns transparently
3. **Test with and without tracer**: Verify behavior when inactive
4. **Update TypeScript types**: Keep type definitions in sync
5. **Add examples**: Demonstrate real-world usage in `examples/`

### When Modifying Core Types

Types in `types.ts` are the public API contract. Changes should be:
- **Backward compatible** whenever possible
- **Well-documented** with JSDoc comments
- **Tested** for type inference correctness

### When Working with Context

`AsyncLocalStorage` has subtle behavior:
- Context is **inherited** across async boundaries
- Context is **lost** if you create new Promise chains manually
- Always use `runWithContext()` to ensure proper propagation
- Be careful with `setTimeout`, `setInterval` (context may not propagate)

---

## Common Debugging Scenarios

### Spans Not Being Recorded

**Symptom**: Function runs but no spans appear in trace

**Causes**:
1. Function not wrapped with `traced()`
2. Function called outside `tracer.run()` or `tracer.runAsync()`
3. `maxDepth` exceeded
4. Context lost due to manual Promise creation

**Fix**: Ensure function is traced and called within tracer context

### Async Functions Completing Before Spans Finalize

**Symptom**: Span shows `endTime: 0` or `durationMs: 0`

**Cause**: Span finalized before Promise settles

**Fix**: This shouldn't happen - if it does, there's a bug in `recordSpan()`. File an issue.

### Memory Leaks with onSpan Callback

**Symptom**: Memory grows unbounded when using `onSpan`

**Cause**: Callback holds references to spans, preventing GC

**Fix**: Ensure `onSpan` extracts needed data and discards span reference:

```typescript
const tracer = createTracer({
  onSpan: (span) => {
    // Extract and log, don't store span reference
    logger.info({
      name: span.name,
      duration: span.durationMs,
      status: span.status
    })
  }
})
```

---

## Publishing Notes

This package is published as **@ontologyio/receta-trace** (scoped package) and follows the same publishing workflow as the main receta package:

1. Version bumps via Release Please
2. Publish to npm on release
3. No JSR publish (uses Node.js-specific AsyncLocalStorage)

---

## Quick Reference

```typescript
import { traced, createTracer, tracedPipe, emitEvent, toTreeString } from '@ontologyio/receta-trace'

// Basic usage
const double = traced('double', (x: number) => x * 2)
const tracer = createTracer()
const { result, trace } = tracer.run(() => double(5))

// Traced pipeline
const { result, trace } = tracedPipe(
  [1, 2, 3],
  traced('filter', (xs) => xs.filter(x => x > 1)),
  traced('map', (xs) => xs.map(x => x * 2)),
  traced('sum', (xs) => xs.reduce((a, b) => a + b, 0))
)

// Event emission
const fetch = traced('fetch', async (url: string) => {
  emitEvent('request-start', { url })
  const res = await fetch(url)
  emitEvent('request-complete', { status: res.status })
  return res.json()
})

// View trace
console.log(toTreeString(trace))
```
