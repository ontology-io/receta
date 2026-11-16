import * as R from 'remeda'
import { unwrapOr } from '@ontologyio/receta/result'
import { parseTemplate, template } from '@ontologyio/receta/string'

export type FillTemplateValues = Readonly<Record<string, string | number | boolean | null | undefined>>

/**
 * Fills `{{name}}` placeholders from values, using a fallback for any value that is missing.
 *
 * Use when: rendering a notification, email subject or UI string where a missing value
 * should not stop the message, such as `Hi {{name}}` for a user without a name. A key that
 * is absent, `null` or `undefined` renders as `fallback`. Placeholders are `{{word}}`, with
 * no spaces inside the braces. When every value must be there, use `renderTemplate`.
 *
 * @example
 * ```ts
 * fillTemplate('Hi {{name}}, you have {{count}} new messages', { name: 'Ana', count: 3 }, 'there')
 * // => 'Hi Ana, you have 3 new messages'
 *
 * fillTemplate('Hi {{name}}!', { name: null }, 'there')
 * // => 'Hi there!'
 *
 * R.pipe('Order {{id}} ships {{day}}', fillTemplate({ id: 1042 }, '—'))
 * // => 'Order 1042 ships —'
 * ```
 *
 * @tags template, interpolate, placeholder, mustache, fallback, default, message, i18n
 * @see template - @ontologyio/receta/string, stops at the first missing value
 * @see parseTemplate - @ontologyio/receta/string, lists the placeholders
 * @see renderTemplate - reports every missing value instead of filling it
 */
export function fillTemplate(text: string, values: FillTemplateValues, fallback: string): string
export function fillTemplate(values: FillTemplateValues, fallback: string): (text: string) => string
export function fillTemplate(...args: unknown[]): unknown {
  return R.purry(fillTemplateImplementation, args)
}

const fillTemplateImplementation = (text: string, values: FillTemplateValues, fallback: string): string => {
  const filled = { ...R.fromKeys(parseTemplate(text), R.constant(fallback)), ...R.pickBy(values, R.isNonNullish) }
  // Every placeholder now has a value, so template can't fail.
  return R.pipe(template(text, filled), unwrapOr(text))
}
