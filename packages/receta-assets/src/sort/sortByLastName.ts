import * as R from 'remeda'
import { byString, compose, natural } from '@ontologyio/receta/compare'
import { matches } from '@ontologyio/receta/predicate'

/**
 * Sorts people by last name, then by the rest of the name, when only a full-name field exists.
 *
 * Use when: listing staff, authors, attendees or customers in a directory where the data holds
 * one `name` field like 'Ada Lovelace'. The last word is the last name, after dropping suffixes
 * such as 'Jr.', 'Sr.', 'II' or 'PhD', so 'Martin Luther King Jr.' sorts under King. Names are
 * compared naturally with case ignored. Particles stay with the first name, so 'Ludwig van
 * Beethoven' sorts under Beethoven. It can't know family-name-first orders.
 *
 * @example
 * ```ts
 * const speakers = ['Grace Hopper', 'Martin Luther King Jr.', 'Ada Lovelace', 'ludwig van Beethoven', 'Alan Turing']
 *
 * sortByLastName(speakers, R.identity())
 * // => ['ludwig van Beethoven', 'Grace Hopper', 'Martin Luther King Jr.', 'Ada Lovelace', 'Alan Turing']
 *
 * const staff = [{ name: 'Sam Lee' }, { name: 'Ana Lee' }, { name: 'Cher' }]
 * R.pipe(staff, sortByLastName((person) => person.name), R.map(R.prop('name')))
 * // => ['Cher', 'Ana Lee', 'Sam Lee']
 * ```
 *
 * @tags sort, last name, surname, family name, people, directory, contacts, full name, alphabetical
 * @see sectionsByInitial - A–Z sections for a directory
 * @see natural - @ontologyio/receta/compare, the case-ignoring comparison of each part
 */
export function sortByLastName<T>(items: readonly T[], fullName: (item: T) => string): readonly T[]
export function sortByLastName<T>(fullName: (item: T) => string): (items: readonly T[]) => readonly T[]
export function sortByLastName(...args: unknown[]): unknown {
  return R.purry(sortByLastNameImplementation, args)
}

type Named<T> = { readonly item: T; readonly last: string; readonly rest: string; readonly full: string }

const SUFFIX = /^(?:jr|sr|ii|iii|iv|phd|md|esq)\.?,?$/i

const lastNameFirst = compose<Named<unknown>>(
  natural((person) => person.last),
  natural((person) => person.rest),
  byString((person) => person.full),
)

const sortByLastNameImplementation = <T>(items: readonly T[], fullName: (item: T) => string): readonly T[] =>
  R.pipe(
    items,
    // Split each name once, rather than inside every comparison.
    R.map((item): Named<T> => {
      const full = fullName(item).trim()
      const words = R.dropLastWhile(full.split(/\s+/), matches(SUFFIX))
      return { item, last: R.last(words) ?? full, rest: R.join(R.dropLast(words, 1), ' '), full }
    }),
    R.sort(lastNameFirst),
    R.map((person) => person.item),
  )
