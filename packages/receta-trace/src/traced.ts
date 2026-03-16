import type { FnMeta, TracedFunction } from './types'
import { getActiveContext } from './context'
import { recordSpan } from './span'

/**
 * Wraps a function with trace metadata.
 *
 * When called within an active tracer context, records a span with timing,
 * inputs, outputs, and parent-child relationships. When no tracer is active,
 * calls the original function directly with near-zero overhead.
 *
 * @example
 * ```typescript
 * // String shorthand
 * const double = traced('double', (x: number) => x * 2)
 *
 * // Full metadata
 * const fetchUser = traced(
 *   { name: 'fetchUser', module: 'users', category: 'io' },
 *   async (id: string) => db.findUser(id)
 * )
 *
 * // Without active tracer — zero overhead
 * double(5) // => 10
 *
 * // With active tracer — records a span
 * const tracer = createTracer()
 * tracer.run(() => double(5)) // records span { name: 'double', input: 5, output: 10, ... }
 * ```
 *
 * @param metaOrName - Function metadata or a string name shorthand
 * @param fn - The function to wrap
 * @returns The wrapped function with `__trace_meta` property
 */
export function traced<F extends (...args: any[]) => any>(
  metaOrName: FnMeta | string,
  fn: F,
): TracedFunction<F> {
  const meta: FnMeta =
    typeof metaOrName === 'string' ? { name: metaOrName } : metaOrName

  const wrapper = ((...args: any[]) => {
    const ctx = getActiveContext()

    if (ctx === undefined) {
      return fn(...args)
    }

    if (ctx.depth >= ctx.state.options.maxDepth) {
      return fn(...args)
    }

    return recordSpan(ctx, meta.name, fn, args)
  }) as TracedFunction<F>

  Object.defineProperty(wrapper, '__trace_meta', {
    value: meta,
    enumerable: false,
    writable: false,
  })

  Object.defineProperty(wrapper, 'name', {
    value: meta.name,
    configurable: true,
  })

  Object.defineProperty(wrapper, 'length', {
    value: fn.length,
    configurable: true,
  })

  return wrapper
}

/**
 * Check if a function has been wrapped with traced().
 */
export function isTraced(
  fn: (...args: any[]) => any,
): fn is TracedFunction<(...args: any[]) => any> {
  return '__trace_meta' in fn
}
