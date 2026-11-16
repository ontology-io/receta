import * as R from 'remeda'
import { always, by, matches, type Predicate } from '@ontologyio/receta/predicate'
import { escapeRegex } from '@ontologyio/receta/string'

/**
 * Builds a fuzzy predicate: the query's letters must appear in the text in order, gaps allowed.
 *
 * Use when: a command palette, file picker or quick switcher should find `GitHub Settings`
 * from `ghs`, the way editors do. Matching ignores case. Spaces in the query are ignored, and
 * any character, including `.` or `(`, is matched as itself. It only says yes or no; sort the
 * matches yourself if closer ones should come first. A blank query keeps everything.
 *
 * @example
 * ```ts
 * const commands = [{ label: 'GitHub Settings' }, { label: 'Go to Symbol' }, { label: 'Toggle Sidebar' }]
 *
 * R.filter(commands, matchesSubsequence('ghs', (command) => command.label))
 * // => [{ label: 'GitHub Settings' }]
 *
 * R.filter(['index.ts', 'index.tsx', 'readme.md'], matchesSubsequence('i.tsx', R.identity()))
 * // => ['index.tsx']
 *
 * R.filter(commands, matchesSubsequence(' ', (command) => command.label)).length
 * // => 3
 * ```
 *
 * @tags fuzzy, subsequence, command palette, quick open, picker, search, filter, abbreviation
 * @see matchesSearch - whole words inside chosen fields
 * @see escapeRegex - @ontologyio/receta/string, keeps `.` and `(` literal
 */
export function matchesSubsequence<T>(query: string, select: (item: T) => string): Predicate<T> {
  const letters = query.replace(/\s+/g, '').split('')
  if (R.isEmpty(letters)) return always<T>()
  const inOrder = new RegExp(R.join(R.map(letters, escapeRegex), '.*'), 'iu')
  return by(select, matches(inOrder))
}
