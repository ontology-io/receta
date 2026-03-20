/**
 * Bridge between receta core's instrument hook and receta-trace's span system.
 *
 * When activated, registers a hook so that all receta core functions
 * (map, flatMap, filter, etc.) automatically create trace spans when
 * called within an active tracer context.
 *
 * @module activate
 */

import { setInstrumentHook } from '@ontologyio/receta/instrument'
import { getActiveContext, runWithContext } from './context'
import type { TraceContext } from './context'
import { createSpan, finalizeSpan } from './span'

/**
 * Activate native tracing for all receta core functions.
 *
 * Registers the instrument hook so that functions like `map`, `flatMap`,
 * `filter`, etc. automatically create spans when called within a tracer context.
 *
 * Returns a cleanup function that deactivates the hook.
 *
 * @example
 * ```typescript
 * const deactivate = activateTracing()
 * // ... run traced code ...
 * deactivate()
 * ```
 */
export function activateTracing(): () => void {
  setInstrumentHook((name, module, fn, args) => {
    const ctx = getActiveContext()

    // Fast path: no active trace context
    if (ctx === undefined) return fn()

    // Respect maxDepth
    if (ctx.depth >= ctx.state.options.maxDepth) return fn()

    const input = args.length === 1 ? args[0] : args
    const span = createSpan(
      ctx.state,
      name,
      input,
      ctx.currentSpan,
      module,
      ctx.depth,
    )

    const childCtx: TraceContext = {
      state: ctx.state,
      currentSpanId: span.id,
      currentSpan: span,
      depth: ctx.depth + 1,
    }

    try {
      const result = runWithContext(childCtx, fn)

      // Handle async: if result is a Promise, finalize when it settles
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            finalizeSpan(ctx.state, span, value)
            return value
          },
          (error) => {
            finalizeSpan(ctx.state, span, undefined, error)
            throw error
          },
        )
      }

      finalizeSpan(ctx.state, span, result)
      return result
    } catch (error) {
      finalizeSpan(ctx.state, span, undefined, error)
      throw error
    }
  })

  return () => setInstrumentHook(undefined)
}

/**
 * Deactivate native tracing for receta core functions.
 * Clears the instrument hook.
 */
export function deactivateTracing(): void {
  setInstrumentHook(undefined)
}
