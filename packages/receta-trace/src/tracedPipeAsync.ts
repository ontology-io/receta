import type { Trace, TracerOptions } from './types'
import { createTracer } from './tracer'
import { traced, isTraced } from './traced'

type AnyFn = (...args: any[]) => any

/**
 * Get a display name for a function.
 */
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
 * Ensure a function is traced.
 */
function ensureTraced(fn: AnyFn, index: number): AnyFn {
  if (isTraced(fn)) {
    return fn
  }
  return traced(getFnName(fn, index), fn)
}

/**
 * Traced async pipe — composes async functions left-to-right and
 * returns both the result and a complete execution trace.
 *
 * Like `pipeAsync`, but instruments each step. Functions already wrapped
 * with `traced()` keep their names; others are auto-named.
 *
 * @example
 * ```typescript
 * const { result, trace } = await tracedPipeAsync(
 *   userId,
 *   traced('fetchUser', fetchUser),
 *   traced('getEmail', (user) => user.email),
 * )
 * ```
 */
export function tracedPipeAsync<A, B>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  options?: TracerOptions,
): Promise<{ result: B; trace: Trace }>

export function tracedPipeAsync<A, B, C>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  options?: TracerOptions,
): Promise<{ result: C; trace: Trace }>

export function tracedPipeAsync<A, B, C, D>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  options?: TracerOptions,
): Promise<{ result: D; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  options?: TracerOptions,
): Promise<{ result: E; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E, F>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  options?: TracerOptions,
): Promise<{ result: F; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E, F, G>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  options?: TracerOptions,
): Promise<{ result: G; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E, F, G, H>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  options?: TracerOptions,
): Promise<{ result: H; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E, F, G, H, I>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  options?: TracerOptions,
): Promise<{ result: I; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E, F, G, H, I, J>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  fn9: (i: I) => J | Promise<J>,
  options?: TracerOptions,
): Promise<{ result: J; trace: Trace }>

export function tracedPipeAsync<A, B, C, D, E, F, G, H, I, J, K>(
  value: A,
  fn1: (a: A) => B | Promise<B>,
  fn2: (b: B) => C | Promise<C>,
  fn3: (c: C) => D | Promise<D>,
  fn4: (d: D) => E | Promise<E>,
  fn5: (e: E) => F | Promise<F>,
  fn6: (f: F) => G | Promise<G>,
  fn7: (g: G) => H | Promise<H>,
  fn8: (h: H) => I | Promise<I>,
  fn9: (i: I) => J | Promise<J>,
  fn10: (j: J) => K | Promise<K>,
  options?: TracerOptions,
): Promise<{ result: K; trace: Trace }>

// Implementation
export async function tracedPipeAsync(
  initialValue: any,
  ...rest: any[]
): Promise<{ result: any; trace: Trace }> {
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

  return tracer.runAsync(async () => {
    let result = initialValue
    for (const fn of tracedFns) {
      result = await (fn as any)(result)
    }
    return result
  })
}
