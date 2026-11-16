import * as R from 'remeda'
import { byBoolean, byString, compose, natural } from '@ontologyio/receta/compare'
import { eq } from '@ontologyio/receta/predicate'

export type SectionsByInitialSection<T> = {
  /** An uppercase letter, or `'#'` for names that start with a digit or a symbol. */
  readonly letter: string
  readonly items: readonly T[]
}

/**
 * Sorts items by name and splits them into A–Z sections by first letter, with '#' last for digits and symbols.
 *
 * Use when: building a contacts list, a glossary, a brand directory or any long list with an
 * alphabet index on the side. Accents are folded, so 'Émile' files under E and 'Ålesund' under A.
 * Names starting with a digit or symbol share a '#' section at the end. Inside a section, names
 * are in natural order, case ignored. Letters from other scripts get sections of their own.
 *
 * @example
 * ```ts
 * const contacts = ['Émile', 'anna', 'Bob', '42 Club', 'Ålesund Co', 'Ben']
 *
 * sectionsByInitial(contacts, R.identity())
 * // => [
 * //   { letter: 'A', items: ['Ålesund Co', 'anna'] },
 * //   { letter: 'B', items: ['Ben', 'Bob'] },
 * //   { letter: 'E', items: ['Émile'] },
 * //   { letter: '#', items: ['42 Club'] },
 * // ]
 *
 * const people = [{ name: 'zoe' }, { name: '@ops' }]
 * R.pipe(people, sectionsByInitial((person) => person.name), R.map(R.prop('letter')))
 * // => ['Z', '#']
 * ```
 *
 * @tags sort, alphabet, sections, index, contacts, directory, glossary, initial, letter, a-z, group
 * @see sortNatural - the same name order without sections
 * @see natural - @ontologyio/receta/compare, the order inside each section
 */
export function sectionsByInitial<T>(
  items: readonly T[],
  name: (item: T) => string,
): readonly SectionsByInitialSection<T>[]
export function sectionsByInitial<T>(
  name: (item: T) => string,
): (items: readonly T[]) => readonly SectionsByInitialSection<T>[]
export function sectionsByInitial(...args: unknown[]): unknown {
  return R.purry(sectionsByInitialImplementation, args)
}

const LETTER = /^\p{L}$/u
const ACCENTS = /\p{Diacritic}/gu

const initialOf = (text: string): string => {
  // NFD splits 'É' into 'E' and an accent, which ACCENTS then removes.
  const first = text.trim().normalize('NFD').replace(ACCENTS, '').charAt(0).toUpperCase()
  return LETTER.test(first) ? first : '#'
}

const lettersThenHash = compose<SectionsByInitialSection<unknown>>(
  byBoolean((section) => eq('#')(section.letter)),
  natural((section) => section.letter),
)

const sectionsByInitialImplementation = <T>(
  items: readonly T[],
  name: (item: T) => string,
): readonly SectionsByInitialSection<T>[] =>
  R.pipe(
    items,
    // Sorting before grouping leaves each section already in order.
    R.sort(compose(natural(name), byString(name))),
    R.groupBy((item) => initialOf(name(item))),
    R.entries(),
    R.map(([letter, members]) => ({ letter, items: members })),
    R.sort(lettersThenHash),
  )
