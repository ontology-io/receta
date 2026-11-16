import * as R from 'remeda'
import { not, oneOf } from '@ontologyio/receta/predicate'
import { slugify } from '@ontologyio/receta/string'

/**
 * Turns a title into a URL slug that doesn't collide with the slugs already taken.
 *
 * Use when: a new post, page or record needs a readable URL and some slugs are in use.
 * The plain slug comes back when it is free, otherwise the first free `-2`, `-3`, … suffix.
 *
 * @example
 * ```ts
 * uniqueSlug('Hello World!', [])
 * // => 'hello-world'
 *
 * uniqueSlug('Hello World!', ['hello-world', 'hello-world-2'])
 * // => 'hello-world-3'
 *
 * R.pipe('Café Münster', uniqueSlug(['cafe-munster']))
 * // => 'cafe-munster-2'
 * ```
 *
 * @tags slug, url, permalink, dedupe, collision, seo
 * @see slugify - @ontologyio/receta/string, the slug without the collision check
 */
export function uniqueSlug(title: string, taken: readonly string[]): string
export function uniqueSlug(taken: readonly string[]): (title: string) => string
export function uniqueSlug(...args: unknown[]): unknown {
  return R.purry(uniqueSlugImplementation, args)
}

const uniqueSlugImplementation = (title: string, taken: readonly string[]): string => {
  const base = slugify(title)
  const withSuffix = (n: number): string => (n === 1 ? base : `${base}-${n}`)
  // One more candidate than slugs taken, so at least one of them is free.
  const free = R.pipe(R.range(1, taken.length + 2), R.map(withSuffix), R.find(not(oneOf(taken))))
  return free ?? base
}
