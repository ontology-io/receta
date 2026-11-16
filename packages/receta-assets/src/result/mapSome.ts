import * as R from 'remeda'
import { partition, type Option } from '@ontologyio/receta/option'

/**
 * Runs a step that returns an Option on every item and keeps only the Some values, in order.
 *
 * Use when: some items don't produce a value and that's fine, such as keeping the valid
 * emails from a pasted list, the numbers that parse from a column, the users that have a
 * phone number, or the routes that match. Receta validators that return an Option, like
 * `isEmail` and `isUrl`, plug straight in.
 *
 * @example
 * ```ts
 * import { isEmail } from '@ontologyio/receta/string'
 * import { fromNullable } from '@ontologyio/receta/option'
 *
 * mapSome(['ada@example.com', 'not an email', 'grace@example.org'], isEmail)
 * // => ['ada@example.com', 'grace@example.org']
 *
 * const users = [{ name: 'Ada', phone: '+44 20' }, { name: 'Linus' }]
 * R.pipe(users, mapSome((user: { name: string; phone?: string }) => fromNullable(user.phone)))
 * // => ['+44 20']
 * ```
 *
 * @tags filter map, keep valid, optional, collect, compact, pick, extract
 * @see partition - @ontologyio/receta/option, which also counts the Nones
 * @see settleResults - the same idea for Results, keeping each failure
 */
export function mapSome<T, U>(
  items: readonly T[],
  pick: (item: T, index: number) => Option<U>,
): readonly U[]
export function mapSome<T, U>(
  pick: (item: T, index: number) => Option<U>,
): (items: readonly T[]) => readonly U[]
export function mapSome(...args: unknown[]): unknown {
  return R.purry(mapSomeImplementation, args)
}

const mapSomeImplementation = <T, U>(
  items: readonly T[],
  pick: (item: T, index: number) => Option<U>,
): readonly U[] => {
  const [values] = partition(R.map(items, pick))
  return values
}
