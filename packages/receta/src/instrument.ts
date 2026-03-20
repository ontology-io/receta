/**
 * Lightweight instrumentation hook for receta functions.
 *
 * This module provides a global hook point that tracing libraries (like receta-trace)
 * can register to automatically instrument all receta functions.
 *
 * When no hook is registered, receta functions run with zero overhead.
 * When a hook is registered, it wraps each function call to record spans,
 * emit events, or perform other observability tasks.
 *
 * @module instrument
 */

/**
 * A hook function that wraps receta function execution.
 *
 * @param name - The function name (e.g. 'map', 'flatMap', 'filter')
 * @param module - The module name (e.g. 'result', 'option', 'async')
 * @param fn - A thunk wrapping the actual implementation call
 * @param args - The resolved arguments passed to the implementation
 * @returns The result of calling fn(), potentially wrapped with tracing
 */
export type InstrumentHook = (
  name: string,
  module: string,
  fn: () => unknown,
  args: readonly unknown[],
) => unknown

let _hook: InstrumentHook | undefined

/**
 * Register an instrumentation hook for all receta functions.
 *
 * Pass `undefined` to clear the hook and disable instrumentation.
 *
 * @example
 * ```typescript
 * import { setInstrumentHook } from '@ontologyio/receta/instrument'
 *
 * setInstrumentHook((name, module, fn, args) => {
 *   console.log(`Calling ${module}.${name}`)
 *   const result = fn()
 *   console.log(`${module}.${name} returned`, result)
 *   return result
 * })
 * ```
 */
export function setInstrumentHook(hook: InstrumentHook | undefined): void {
  _hook = hook
}

/**
 * Get the currently registered instrumentation hook.
 * Returns `undefined` when no hook is registered (zero-overhead fast path).
 */
export function getInstrumentHook(): InstrumentHook | undefined {
  return _hook
}
