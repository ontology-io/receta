import * as R from 'remeda'
import { clamp } from '@ontologyio/receta/number'

const MASK = '••••'

/**
 * Hides the middle of a secret, showing a few characters at each end: `sk_l••••9xQz`.
 *
 * Use when: displaying an API key, token or account ID so a person can tell which one it
 * is without seeing it. Each end shows at most `visible` characters, and never more than a
 * quarter of the value, so a short secret stays mostly hidden. The mask has a fixed length,
 * so it doesn't reveal how long the secret is.
 *
 * @example
 * ```ts
 * maskMiddle('sk_live_51Hx9QzT2kLm4P9xQz', 4)
 * // => 'sk_l••••9xQz'
 *
 * maskMiddle('abc123', 4)
 * // => 'a••••3'
 *
 * R.pipe('xyz', maskMiddle(4))
 * // => '••••'
 * ```
 *
 * @tags mask, secret, api key, token, redact, obfuscate, credentials
 * @see clamp - @ontologyio/receta/number, caps what each end may show
 * @see maskCardNumber - card numbers, last four only
 */
export function maskMiddle(secret: string, visible: number): string
export function maskMiddle(visible: number): (secret: string) => string
export function maskMiddle(...args: unknown[]): unknown {
  return R.purry(maskMiddleImplementation, args)
}

const maskMiddleImplementation = (secret: string, visible: number): string => {
  const shown = clamp(visible, 0, Math.floor(secret.length / 4))
  return `${secret.slice(0, shown)}${MASK}${secret.slice(secret.length - shown)}`
}
