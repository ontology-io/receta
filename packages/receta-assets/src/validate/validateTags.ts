import * as R from 'remeda'
import { by, gt, lte } from '@ontologyio/receta/predicate'
import { truncate } from '@ontologyio/receta/string'
import {
  collectErrors,
  flatMap,
  fromPredicate,
  invalid,
  map,
  maxLength,
  required,
  valid,
  type Validation,
} from '@ontologyio/receta/validation'

export type ValidateTagsRules = {
  /** Most tags allowed. */
  readonly maxItems: number
  /** Most characters in one tag. */
  readonly maxLength: number
}

const tagRule = (rules: ValidateTagsRules) => (raw: string, index: number): Validation<string, string> =>
  R.pipe(
    raw.trim(),
    required(`Tag ${index + 1} is empty`),
    flatMap((tag) => maxLength(rules.maxLength, `"${truncate(tag, { length: 16 })}" is longer than ${rules.maxLength} characters`)(tag)),
  )

/** One message per tag that appears more than once, ignoring case. */
const noRepeats = (tags: readonly string[]): Validation<readonly string[], string> => {
  const repeated = R.pipe(
    tags,
    R.groupBy((tag) => tag.toLowerCase()),
    R.values(),
    R.filter(by((group) => group.length, gt(1))),
    R.map(([first]) => `"${first}" is listed more than once`),
  )
  return R.isEmpty(repeated) ? valid(tags) : invalid(repeated)
}

/**
 * Checks a list of tags or labels: none blank, none too long, no repeats, and not too many.
 *
 * Use when: a post, product, ticket or contact editor takes free-form tags and should report
 * every bad one at once, by position or by name. Tags are trimmed, and the trimmed list is
 * what comes back. Repeats are found ignoring case, so `React` and `react` clash; they are
 * looked for once every tag is fine on its own. The count is checked alongside the tags.
 *
 * @example
 * ```ts
 * validateTags([' news ', 'launch'], { maxItems: 5, maxLength: 20 })
 * // => Valid(['news', 'launch'])
 *
 * validateTags(['react', '', 'typescript-and-javascript', 'css'], { maxItems: 3, maxLength: 20 })
 * // => Invalid([
 * //   'Tag 2 is empty',
 * //   '"typescript-an..." is longer than 20 characters',
 * //   'Use at most 3 tags',
 * // ])
 *
 * R.pipe(['react', 'React'], validateTags({ maxItems: 5, maxLength: 20 }))
 * // => Invalid(['"react" is listed more than once'])
 * ```
 *
 * @tags tags, labels, keywords, categories, list, duplicates, unique, form
 * @see collectErrors - @ontologyio/receta/validation, keeps every tag's message
 */
export function validateTags(tags: readonly string[], rules: ValidateTagsRules): Validation<readonly string[], string>
export function validateTags(rules: ValidateTagsRules): (tags: readonly string[]) => Validation<readonly string[], string>
export function validateTags(...args: unknown[]): unknown {
  return R.purry(validateTagsImplementation, args)
}

const validateTagsImplementation = (tags: readonly string[], rules: ValidateTagsRules): Validation<readonly string[], string> => {
  const eachTag = R.pipe(R.map(tags, tagRule(rules)), collectErrors(), flatMap(noRepeats))
  const count = fromPredicate(by((list: readonly string[]) => list.length, lte(rules.maxItems)), `Use at most ${rules.maxItems} tags`)
  return R.pipe(
    collectErrors([eachTag, count(tags)]),
    // collectErrors gives back an array of both values; the trimmed tags are the first.
    map(([trimmed = []]) => trimmed),
  )
}
