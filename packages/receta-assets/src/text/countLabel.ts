import * as R from 'remeda'
import { format } from '@ontologyio/receta/number'
import { pluralize } from '@ontologyio/receta/string'

/** A noun as one word that pluralizes by English rules, or both forms when it doesn't. */
export type CountLabelNoun = string | { readonly one: string; readonly other: string }

/**
 * Writes a count with its noun in the right form and thousands separators: `1,234 replies`.
 *
 * Use when: a badge, heading or summary says how many of something there are, such as
 * `1 item`, `0 files` or `3 people`. Only exactly 1 takes the singular. Regular English
 * plurals are built for you (`reply` gives `replies`); pass `{ one, other }` for irregular
 * ones like `person`/`people`, or for words the rules get wrong. English only.
 *
 * @example
 * ```ts
 * countLabel(1, 'item')
 * // => '1 item'
 *
 * countLabel(1234, 'reply')
 * // => '1,234 replies'
 *
 * countLabel(0, 'file')
 * // => '0 files'
 *
 * R.pipe(3, countLabel({ one: 'person', other: 'people' }))
 * // => '3 people'
 * ```
 *
 * @tags count, plural, pluralize, label, quantity, badge, noun, items
 * @see pluralize - @ontologyio/receta/string, the English plural rules
 * @see format - @ontologyio/receta/number, the thousands separators
 */
export function countLabel(count: number, noun: CountLabelNoun): string
export function countLabel(noun: CountLabelNoun): (count: number) => string
export function countLabel(...args: unknown[]): unknown {
  return R.purry(countLabelImplementation, args)
}

const countLabelImplementation = (count: number, noun: CountLabelNoun): string => {
  const word = R.isString(noun)
    ? pluralize(noun, count, { wordOnly: true })
    : pluralize(noun.one, count, { wordOnly: true, plural: noun.other })
  return `${format(count, { decimals: 0, locale: 'en-US' })} ${word}`
}
