import * as R from 'remeda'
import { err, map, ok, unwrapOr, type Result } from '@ontologyio/receta/result'
import { parseTemplate, template } from '@ontologyio/receta/string'

export type RenderTemplateValues = Readonly<Record<string, string | number | boolean | null | undefined>>

export type RenderTemplateError = {
  readonly code: 'MISSING_VALUES'
  readonly missing: readonly string[]
  readonly message: string
}

/**
 * Fills `{{name}}` placeholders from values, or reports every placeholder left without one.
 *
 * Use when: a message must not go out half-filled, such as a transactional email, an SMS
 * or a legal notice, and the error should list everything missing at once rather than one
 * key per attempt. A value that is absent, `null` or `undefined` counts as missing.
 * Placeholders are `{{word}}`, with no spaces inside the braces.
 *
 * @example
 * ```ts
 * renderTemplate('Your code is {{code}}', { code: 481516 })
 * // => Ok('Your code is 481516')
 *
 * renderTemplate('Hi {{name}}, order {{id}} ships {{day}}', { name: 'Ana', day: null })
 * // => Err({ code: 'MISSING_VALUES', missing: ['id', 'day'], message: 'No value for id, day' })
 *
 * R.pipe('{{greeting}}!', renderTemplate({ greeting: 'Hello' }))
 * // => Ok('Hello!')
 * ```
 *
 * @tags template, interpolate, placeholder, strict, missing, email, message, validate
 * @see template - @ontologyio/receta/string, stops at the first missing value
 * @see parseTemplate - @ontologyio/receta/string, lists the placeholders
 * @see fillTemplate - fills missing values with a fallback instead
 */
export function renderTemplate(
  text: string,
  values: RenderTemplateValues,
): Result<string, RenderTemplateError>
export function renderTemplate(
  values: RenderTemplateValues,
): (text: string) => Result<string, RenderTemplateError>
export function renderTemplate(...args: unknown[]): unknown {
  return R.purry(renderTemplateImplementation, args)
}

const renderTemplateImplementation = (
  text: string,
  values: RenderTemplateValues,
): Result<string, RenderTemplateError> => {
  const missing = R.filter(parseTemplate(text), (key) => R.isNullish(values[key]))
  const complete: Result<RenderTemplateValues, RenderTemplateError> = R.isEmpty(missing)
    ? ok(values)
    : err({ code: 'MISSING_VALUES', missing, message: `No value for ${R.join(missing, ', ')}` })
  // With every value present, template can't fail.
  return R.pipe(complete, map((full) => R.pipe(template(text, full), unwrapOr(text))))
}
