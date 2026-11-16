import * as R from 'remeda'
import { mapValues } from '@ontologyio/receta/object'
import { oneOf } from '@ontologyio/receta/predicate'

const REDACTED = '[REDACTED]'

/** Lower-case, with `-`, `_` and spaces dropped, so `Api-Key` and `api_key` compare equal. */
const normalizeKey = (key: string): string => R.toLowerCase(key).replace(/[-_\s]/g, '')

/**
 * Replaces the value of each field whose name is on your list with `'[REDACTED]'`, at any depth.
 *
 * Use when: you know exactly which fields are sensitive, such as `ssn`, `dateOfBirth` or
 * `iban`, and want them out of a log, an export or an error report. Names match whole keys,
 * ignoring case, `-`, `_` and spaces, so `'dateOfBirth'` also hides `date_of_birth`. The whole
 * value under a matching key is replaced, nested objects included. Arrays are walked and the
 * input is not changed. The return type stays `T`, but a redacted field holds the string.
 *
 * @example
 * ```ts
 * const patient = {
 *   name: 'Ada',
 *   ssn: '123-45-6789',
 *   visits: [{ date: '2024-01-02', date_of_birth: '1815-12-10' }],
 * }
 *
 * redactKeys(patient, ['ssn', 'dateOfBirth'])
 * // => { name: 'Ada', ssn: '[REDACTED]', visits: [{ date: '2024-01-02', date_of_birth: '[REDACTED]' }] }
 *
 * R.pipe({ iban: 'DE89', amount: 10 }, redactKeys(['IBAN']))
 * // => { iban: '[REDACTED]', amount: 10 }
 *
 * redactKeys({ ssnLast4: '6789' }, ['ssn'])
 * // => { ssnLast4: '6789' }
 * ```
 *
 * @tags redact, pii, gdpr, mask, log, sanitize, scrub, privacy, fields
 * @see redactSecrets - the same walk with a built-in list of credential names
 * @see redactPaths - redacts exact paths such as `user.ssn` instead of names
 */
export function redactKeys<T>(value: T, keys: readonly string[]): T
export function redactKeys(keys: readonly string[]): <T>(value: T) => T
export function redactKeys(...args: unknown[]): unknown {
  return R.purry(redactKeysImplementation, args)
}

const redactKeysImplementation = <T>(value: T, keys: readonly string[]): T => {
  const isListed = oneOf(R.map(keys, normalizeKey))
  const redact = (current: unknown): unknown => {
    if (R.isArray(current)) return R.map(current, redact)
    if (!R.isPlainObject(current)) return current
    return mapValues(current, (inner, key) => (isListed(normalizeKey(String(key))) ? REDACTED : redact(inner)))
  }
  return redact(value) as T
}
