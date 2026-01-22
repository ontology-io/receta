/**
 * Masks an object by keeping only specified keys (allowlist-based filtering).
 *
 * @module object/mask
 */

import * as R from 'remeda'
import type { PlainObject } from './types'

/**
 * Masks an object by keeping only specified keys (allowlist-based filtering).
 *
 * Security-focused alternative to Remeda's `pick`. Creates a new object
 * containing only the allowed keys. Useful for sanitizing data before
 * sending to clients, logging, or storing.
 *
 * The key difference from `pick` is the semantic intent: `mask` emphasizes
 * security and data protection, making it clearer when filtering sensitive data.
 *
 * @param obj - The object to mask
 * @param allowedKeys - Array of keys to keep
 * @returns A new object with only the allowed keys
 *
 * @example
 * ```typescript
 * // Data-first
 * const user = {
 *   id: 1,
 *   email: 'alice@example.com',
 *   passwordHash: 'secret',
 *   creditCard: '4111-1111-1111-1111'
 * }
 * mask(user, ['id', 'email'])
 * // => { id: 1, email: 'alice@example.com' }
 *
 * // API response sanitization
 * const safeUser = mask(dbUser, ['id', 'name', 'email', 'role'])
 *
 * // Data-last (in pipe)
 * pipe(
 *   user,
 *   mask(['id', 'email', 'name'])
 * )
 * ```
 *
 * @see Remeda.pick - for similar functionality with different semantics
 */
export function mask<T extends PlainObject>(obj: T, allowedKeys: readonly string[]): Partial<T>
export function mask(allowedKeys: readonly string[]): <T extends PlainObject>(obj: T) => Partial<T>
export function mask(...args: unknown[]): unknown {
  return R.purry(maskImplementation, args)
}

function maskImplementation<T extends PlainObject>(obj: T, allowedKeys: readonly string[]): Partial<T> {
  // Use Remeda's pick internally but provide security-focused API
  return R.pick(obj, allowedKeys as any) as Partial<T>
}
