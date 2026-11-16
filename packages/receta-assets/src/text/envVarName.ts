import * as R from 'remeda'
import { kebabCase, slugify } from '@ontologyio/receta/string'

/**
 * Turns any label or key into an environment variable name: `api url` becomes `API_URL`.
 *
 * Use when: generating `.env` entries, CI secrets or config keys from setting names that
 * people typed, or from camelCase keys in a config object. Accents are dropped, anything
 * other than letters and digits separates words, and a name starting with a digit gets a
 * `_` in front so shells accept it. A label with no letters or digits gives `''`.
 *
 * @example
 * ```ts
 * envVarName('apiUrl')
 * // => 'API_URL'
 *
 * envVarName('Database URL (primary)')
 * // => 'DATABASE_URL_PRIMARY'
 *
 * envVarName('2fa secret')
 * // => '_2FA_SECRET'
 *
 * envVarName('Café host')
 * // => 'CAFE_HOST'
 * ```
 *
 * @tags env, environment variable, config, constant, screaming snake case, dotenv, secret
 * @see kebabCase - @ontologyio/receta/string, splits camelCase into words
 * @see slugify - @ontologyio/receta/string, drops accents and symbols
 * @see columnName - the same cleanup as a lowercase snake_case column
 * @see propertyName - the same cleanup as a camelCase property
 */
export function envVarName(label: string): string {
  return R.pipe(
    kebabCase(label),
    slugify,
    (slug) => slug.replaceAll('-', '_').toUpperCase(),
    (name) => (/^\d/.test(name) ? `_${name}` : name),
  )
}
