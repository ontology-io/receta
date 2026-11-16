import * as R from 'remeda'
import { mapValues } from '@ontologyio/receta/object'
import { includes, or } from '@ontologyio/receta/predicate'

const REDACTED = '[REDACTED]'

// Compared after lower-casing the key and dropping everything but letters and digits,
// so `apiKey`, `api_key`, `X-Api-Key` and `APIKEY` all read as `apikey`.
const SECRET_WORDS = [
  'password',
  'passwd',
  'secret',
  'token',
  'apikey',
  'accesskey',
  'privatekey',
  'authorization',
  'cookie',
  'credential',
] as const

const isSecretName = or(...R.map(SECRET_WORDS, includes))

const isSecretKey = (key: string): boolean => isSecretName(R.toLowerCase(key).replace(/[^a-z0-9]/g, ''))

const redact = (value: unknown): unknown => {
  if (R.isArray(value)) return R.map(value, redact)
  if (!R.isPlainObject(value)) return value
  return mapValues(value, (inner, key) => (isSecretKey(String(key)) ? REDACTED : redact(inner)))
}

/**
 * Replaces the value of every password, token, secret, API key, cookie or authorization field, at any depth.
 *
 * Use when: an object is about to reach a log line, an error report or an analytics event, and
 * it may carry credentials, such as a request body, the headers of a failed call or a config.
 * A key counts as secret when, lower-cased and stripped of `-` and `_`, it contains one of
 * password, passwd, secret, token, apikey, accesskey, privatekey, authorization, cookie or
 * credential. The whole value under such a key becomes `'[REDACTED]'`, nested objects
 * included. It errs toward hiding: `tokenCount` is redacted too. Arrays are walked, class
 * instances such as `Date` are left alone, and the input is not changed. The return type stays
 * `T` so it fits a logger, but a redacted field holds the string `'[REDACTED]'`.
 *
 * ```text
 *  value ──▶ ⟨ array? ⟩──yes──▶ redact each item
 *                │ no
 *                ▼
 *         ⟨ plain object? ⟩──no──▶ ╭─────────────────╮
 *                │ yes             │ value unchanged │
 *                ▼                 ╰─────────────────╯
 *          for each key
 *                │
 *                ▼
 *         ⟨ secret name? ⟩──yes──▶ ╭──────────────╮
 *                │ no              │ '[REDACTED]' │
 *                ▼                 ╰──────────────╯
 *          redact its value
 * ```
 *
 * @example
 * ```ts
 * const request = {
 *   user: 'ada',
 *   password: 'hunter2',
 *   headers: { Authorization: 'Bearer abc', 'X-Api-Key': 'k1', accept: 'json' },
 *   sessions: [{ id: 1, refresh_token: 'r1' }],
 * }
 *
 * redactSecrets(request)
 * // => {
 * //   user: 'ada',
 * //   password: '[REDACTED]',
 * //   headers: { Authorization: '[REDACTED]', 'X-Api-Key': '[REDACTED]', accept: 'json' },
 * //   sessions: [{ id: 1, refresh_token: '[REDACTED]' }],
 * // }
 *
 * redactSecrets({ credentials: { user: 'ada', pass: 'x' }, retries: 3 })
 * // => { credentials: '[REDACTED]', retries: 3 }
 *
 * redactSecrets([{ token: 't' }, 'plain'])
 * // => [{ token: '[REDACTED]' }, 'plain']
 * ```
 *
 * @tags redact, secrets, password, token, log, sanitize, scrub, pii, mask, credentials
 * @see redactKeys - the same walk with your own list of key names
 * @see redactPaths - redacts exact paths such as `user.ssn` instead of names
 * @see mapValues - @ontologyio/receta/object, the per-key rewrite
 */
export function redactSecrets<T>(value: T): T {
  return redact(value) as T
}
