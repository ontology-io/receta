import * as R from 'remeda'
import { instrumentedPurry } from '../../utils'
import { ok, err, type Result } from '../../result'
import type { TemplateError, TemplateVars } from '../types'

/**
 * Safely interpolates variables into a template string.
 *
 * Uses `{{variable}}` syntax for interpolation. Returns an error if any
 * variables are missing from the provided values.
 *
 * @param templateStr - The template string with {{variable}} placeholders
 * @param vars - Object containing variable values
 * @returns Result with interpolated string or template error
 *
 * @example
 * ```typescript
 * // Data-first
 * template('Hello {{name}}!', { name: 'Alice' })
 * // => Ok('Hello Alice!')
 *
 * template('Hello {{name}}!', {})
 * // => Err({ type: 'missing_variable', variable: 'name' })
 *
 * // Data-last (in pipe)
 * pipe(
 *   'Welcome {{user}}, you have {{count}} messages',
 *   template({ user: 'Bob', count: 5 })
 * )
 * // => Ok('Welcome Bob, you have 5 messages')
 * ```
 *
 * @see parseTemplate - to extract variable names from a template
 */
export function template(
  templateStr: string,
  vars: TemplateVars
): Result<string, TemplateError>
export function template(
  vars: TemplateVars
): (templateStr: string) => Result<string, TemplateError>
export function template(...args: unknown[]): unknown {
  return instrumentedPurry('template', 'string', templateImplementation, args)
}

function templateImplementation(
  templateStr: string,
  vars: TemplateVars
): Result<string, TemplateError> {
  const pattern = /\{\{(\w+)\}\}/g
  const matches = [...templateStr.matchAll(pattern)]

  // Check for missing variables
  for (const match of matches) {
    const varName = match[1]!
    if (!(varName in vars)) {
      return err({ type: 'missing_variable', variable: varName })
    }
  }

  // Interpolate
  const result = templateStr.replace(pattern, (_, varName) => {
    const value = vars[varName]
    return value === null || value === undefined ? '' : String(value)
  })

  return ok(result)
}

/**
 * Extracts variable names from a template string.
 *
 * Parses `{{variable}}` placeholders and returns an array of unique variable names.
 *
 * @param templateStr - The template string to parse
 * @returns Array of variable names found in the template
 *
 * @example
 * ```typescript
 * parseTemplate('Hello {{name}}, you have {{count}} messages')
 * // => ['name', 'count']
 *
 * parseTemplate('{{user}} sent {{user}} a message')
 * // => ['user'] (duplicates removed)
 *
 * parseTemplate('No variables here')
 * // => []
 * ```
 *
 * @see template - to interpolate variables into a template
 */
export function parseTemplate(templateStr: string): string[] {
  const pattern = /\{\{(\w+)\}\}/g
  const matches = [...templateStr.matchAll(pattern)]
  const variables = matches.map((match) => match[1]!)
  return R.unique(variables)
}
