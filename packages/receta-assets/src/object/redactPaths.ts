import * as R from 'remeda'
import { mapValues } from '@ontologyio/receta/object'
import { eq } from '@ontologyio/receta/predicate'

const REDACTED = '[REDACTED]'

const isWildcard = eq('*')

/** Replaces what sits at `segments` below `value`, leaving everything off the path as it was. */
const redactAt = (value: unknown, segments: readonly string[]): unknown => {
  const [head, ...rest] = segments
  if (head === undefined) return REDACTED
  if (R.isArray(value)) {
    const isOnPath = (position: number): boolean => isWildcard(head) || String(position) === head
    return R.map(value, (item, position) => (isOnPath(position) ? redactAt(item, rest) : item))
  }
  if (!R.isPlainObject(value)) return value
  if (isWildcard(head)) return mapValues(value, (inner) => redactAt(inner, rest))
  return Object.hasOwn(value, head) ? { ...value, [head]: redactAt(value[head], rest) } : value
}

/**
 * Replaces the value at each dot path with `'[REDACTED]'`, where `*` stands for every array item or key.
 *
 * Use when: one field must go but the same name is harmless elsewhere, such as `card.number`
 * but not `order.number`, or `users.*.email` in an export. A path that isn't there is
 * skipped: no key is added. Array items are reached by position (`items.0.pin`) or all at once
 * (`items.*.pin`). The input is not changed. The return type stays `T`, but a redacted field
 * holds the string.
 *
 * @example
 * ```ts
 * const order = {
 *   number: 'A-17',
 *   card: { number: '4242 4242 4242 4242', brand: 'visa' },
 *   users: [{ name: 'Ada', email: 'ada@example.com' }, { name: 'Linus', email: 'l@example.com' }],
 * }
 *
 * redactPaths(order, ['card.number', 'users.*.email'])
 * // => {
 * //   number: 'A-17',
 * //   card: { number: '[REDACTED]', brand: 'visa' },
 * //   users: [{ name: 'Ada', email: '[REDACTED]' }, { name: 'Linus', email: '[REDACTED]' }],
 * // }
 *
 * R.pipe({ a: { b: 1 } }, redactPaths(['a.missing', 'nope.deeper']))
 * // => { a: { b: 1 } }
 *
 * redactPaths({ tokens: ['t1', 't2'] }, ['tokens.1'])
 * // => { tokens: ['t1', '[REDACTED]'] }
 * ```
 *
 * @tags redact, path, mask, pii, log, export, sanitize, wildcard, nested
 * @see redactKeys - redacts by key name at any depth instead of by path
 * @see redactSecrets - redacts credential-like names without a list
 */
export function redactPaths<T>(value: T, paths: readonly string[]): T
export function redactPaths(paths: readonly string[]): <T>(value: T) => T
export function redactPaths(...args: unknown[]): unknown {
  return R.purry(redactPathsImplementation, args)
}

const redactPathsImplementation = <T>(value: T, paths: readonly string[]): T =>
  R.reduce(paths, (current: unknown, path) => redactAt(current, path.split('.')), value as unknown) as T
