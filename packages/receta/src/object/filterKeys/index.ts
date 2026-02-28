/**
 * Filters an object by keeping only keys that match a predicate.
 *
 * @module object/filterKeys
 */

import * as R from 'remeda'
import type { PlainObject } from '../types'

/**
 * Filters an object by keeping only keys that match a predicate.
 *
 * Creates a new object containing only entries whose keys satisfy the predicate.
 * Useful for filtering by key patterns, removing prefixed keys, or selective
 * property inclusion based on key names.
 *
 * @param obj - The object to filter
 * @param predicate - Function that tests each key
 * @returns A new object with filtered keys
 *
 * @example
 * ```typescript
 * // Data-first
 * const config = {
 *   api_key: 'secret',
 *   api_url: 'https://api.example.com',
 *   db_host: 'localhost',
 *   db_port: 5432
 * }
 * filterKeys(config, (key) => key.startsWith('api_'))
 * // => { api_key: 'secret', api_url: 'https://api.example.com' }
 *
 * // Remove private keys
 * filterKeys(obj, (key) => !key.startsWith('_'))
 *
 * // Keep only specific patterns
 * filterKeys(data, (key) => /^[a-z]+$/.test(key))
 *
 * // Data-last (in pipe)
 * pipe(
 *   config,
 *   filterKeys((key) => !key.includes('secret'))
 * )
 * ```
 *
 * @see filterValues - for filtering by values instead of keys
 * @see mask - for allowlist-based filtering with security focus
 */
export function filterKeys<T extends PlainObject>(
  obj: T,
  predicate: (key: string) => boolean
): Partial<T>
export function filterKeys(
  predicate: (key: string) => boolean
): <T extends PlainObject>(obj: T) => Partial<T>
export function filterKeys(...args: unknown[]): unknown {
  return R.purry(filterKeysImplementation, args)
}

function filterKeysImplementation<T extends PlainObject>(
  obj: T,
  predicate: (key: string) => boolean
): Partial<T> {
  const result: Partial<T> = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(key)) {
      result[key as keyof T] = value as T[keyof T]
    }
  })

  return result
}
