import * as R from 'remeda'
import { endsWith, includes, not, or, startsWith } from '@ontologyio/receta/predicate'
import { slugify } from '@ontologyio/receta/string'
import { flatMap, fromPredicate, matches, maxLength, required, validate, type Validation } from '@ontologyio/receta/validation'

const MAX_SLUG_LENGTH = 64

/**
 * Checks a slug a person typed, and when its characters are wrong, suggests the slug to use.
 *
 * Use when: a CMS, store or workspace form lets people edit a URL slug, and you want to refuse
 * `My Post!` with a message that offers `my-post` instead of silently rewriting it. The input
 * is trimmed. A slug is lowercase letters, digits and single hyphens, at most 64 characters,
 * not starting or ending with a hyphen.
 *
 * @example
 * ```ts
 * validateSlugField(' spring-sale-2026 ')
 * // => Valid('spring-sale-2026')
 *
 * validateSlugField('Spring Sale!')
 * // => Invalid(['Use lowercase letters, numbers and hyphens, like "spring-sale"'])
 *
 * validateSlugField('-sale--')
 * // => Invalid(["Don't start or end with a hyphen", 'Use one hyphen between words'])
 * ```
 *
 * @tags slug, url, permalink, path, handle, cms, seo, field
 * @see slugify - @ontologyio/receta/string, makes the suggested slug
 * @see uniqueSlug - a slug from a title that avoids the ones taken
 */
export function validateSlugField(input: string): Validation<string, string> {
  const slug = input.trim()
  const suggestion = slugify(slug)
  const charactersMessage = suggestion === ''
    ? 'Use lowercase letters, numbers and hyphens'
    : `Use lowercase letters, numbers and hyphens, like "${suggestion}"`
  return R.pipe(
    slug,
    required('Enter a slug'),
    flatMap(
      validate([
        matches(/^[a-z0-9-]+$/, charactersMessage),
        fromPredicate(not(or(startsWith('-'), endsWith('-'))), "Don't start or end with a hyphen"),
        fromPredicate(not(includes('--')), 'Use one hyphen between words'),
        maxLength(MAX_SLUG_LENGTH, `Keep the slug under ${MAX_SLUG_LENGTH + 1} characters`),
      ]),
    ),
  )
}
