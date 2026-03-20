/**
 * Instrumentation helper for async functions that don't use purry.
 *
 * @module utils/instrumentAsync
 * @internal
 */

import { getInstrumentHook } from '../instrument'

/**
 * Wrap an async function execution with the instrument hook.
 * When no hook is registered, returns the result of fn() directly.
 *
 * @param name - Function name (e.g. 'retry', 'mapAsync')
 * @param module - Module name (e.g. 'async')
 * @param fn - The async function to execute
 * @param args - Arguments for context capture
 * @returns The result of fn(), potentially wrapped with tracing
 * @internal
 */
export function instrumentAsync<T>(
  name: string,
  module: string,
  fn: () => T | Promise<T>,
  args: readonly unknown[],
): T | Promise<T> {
  const hook = getInstrumentHook()
  if (!hook) return fn()
  return hook(name, module, fn, args) as T | Promise<T>
}
