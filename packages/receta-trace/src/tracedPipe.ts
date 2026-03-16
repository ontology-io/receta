import type { Trace } from './types'
import { createTracer } from './tracer'
import type { TracerOptions } from './types'
import { traced, isTraced } from './traced'

/**
 * Get a display name for a function.
 * Uses __trace_meta.name if traced, fn.name if available, or step-N fallback.
 */
type AnyFn = (...args: any[]) => any

function getFnName(fn: AnyFn, index: number): string {
  if (isTraced(fn)) {
    return fn.__trace_meta.name
  }
  if (fn.name && fn.name !== '' && fn.name !== 'anonymous') {
    return fn.name
  }
  return `step-${index}`
}

/**
 * Ensure a function is traced. If already traced, return as-is.
 * Otherwise wrap it with an auto-generated name.
 */
function ensureTraced(fn: AnyFn, index: number): AnyFn {
  if (isTraced(fn)) {
    return fn
  }
  return traced(getFnName(fn, index), fn)
}

/**
 * Traced synchronous pipe — composes functions left-to-right and
 * returns both the result and a complete execution trace.
 *
 * Each step is automatically instrumented. Functions already wrapped
 * with `traced()` keep their explicit names; others are auto-named
 * using `fn.name` or `step-N` fallback.
 *
 * @example
 * ```typescript
 * const { result, trace } = tracedPipe(
 *   5,
 *   (x) => x * 2,    // auto-named "step-0"
 *   (x) => x + 1,    // auto-named "step-1"
 * )
 * // result === 11
 * // trace.rootSpan.children has 2 spans
 * ```
 *
 * @example
 * ```typescript
 * const double = traced('double', (x: number) => x * 2)
 * const { result, trace } = tracedPipe(5, double)
 * // trace shows span named "double"
 * ```
 */
export function tracedPipe<A, B>(
  value: A,
  fn1: (a: A) => B,
  options?: TracerOptions,
): { result: B; trace: Trace }

export function tracedPipe<A, B, C>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  options?: TracerOptions,
): { result: C; trace: Trace }

export function tracedPipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  options?: TracerOptions,
): { result: D; trace: Trace }

export function tracedPipe<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  options?: TracerOptions,
): { result: E; trace: Trace }

export function tracedPipe<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  options?: TracerOptions,
): { result: F; trace: Trace }

export function tracedPipe<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  options?: TracerOptions,
): { result: G; trace: Trace }

export function tracedPipe<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  options?: TracerOptions,
): { result: H; trace: Trace }

export function tracedPipe<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  options?: TracerOptions,
): { result: I; trace: Trace }

export function tracedPipe<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  options?: TracerOptions,
): { result: J; trace: Trace }

export function tracedPipe<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F,
  fn6: (f: F) => G,
  fn7: (g: G) => H,
  fn8: (h: H) => I,
  fn9: (i: I) => J,
  fn10: (j: J) => K,
  options?: TracerOptions,
): { result: K; trace: Trace }

// Implementation
export function tracedPipe(
  initialValue: any,
  ...rest: any[]
): { result: any; trace: Trace } {
  // Separate functions from options (last arg may be TracerOptions object)
  let fns: AnyFn[]
  let options: TracerOptions | undefined

  const lastArg = rest[rest.length - 1]
  if (lastArg !== undefined && typeof lastArg === 'object' && typeof lastArg !== 'function') {
    options = lastArg as TracerOptions
    fns = rest.slice(0, -1) as AnyFn[]
  } else {
    fns = rest as AnyFn[]
  }

  const tracedFns = fns.map((fn, i) => ensureTraced(fn, i))
  const tracer = createTracer(options)

  return tracer.run(() => {
    let result = initialValue
    for (const fn of tracedFns) {
      result = (fn as any)(result)
    }
    return result
  })
}
