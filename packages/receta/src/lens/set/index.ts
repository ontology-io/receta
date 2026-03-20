import type { Lens } from '../types'
import { instrumentedPurryConfig2 } from '../../utils'

/**
 * Sets a new value through a Lens, returning an updated source object.
 *
 * This creates a new object with the focused value updated, without mutating
 * the original. The update is immutable and type-safe.
 *
 * Supports both data-first and data-last (for use in pipes).
 *
 * @param l - The Lens to set through
 * @param value - The new value to set
 * @param source - The source object to update
 * @returns A new source object with the focused value updated
 *
 * @example
 * ```typescript
 * // Data-first
 * const nameLens = prop<User>('name')
 * const user = { name: 'Alice', age: 30 }
 *
 * set(nameLens, 'Bob', user)
 * // => { name: 'Bob', age: 30 }
 * // Original user is unchanged
 * ```
 *
 * @example
 * ```typescript
 * // Data-last (in pipe)
 * import * as R from 'remeda'
 *
 * const updated = R.pipe(
 *   user,
 *   set(prop<User>('name'), 'Bob')
 * ) // { name: 'Bob', age: 30 }
 * ```
 *
 * @example
 * ```typescript
 * // With nested lenses
 * const cityLens = path<User, string>('address.city')
 * const user = {
 *   name: 'Alice',
 *   address: { street: '123 Main', city: 'Boston', zip: '02101' }
 * }
 *
 * set(cityLens, 'NYC', user)
 * // => {
 * //   name: 'Alice',
 * //   address: { street: '123 Main', city: 'NYC', zip: '02101' }
 * // }
 * ```
 *
 * @see view - To read through a lens
 * @see over - To transform through a lens
 * @see prop - To create a property lens
 */
export function set<S, A>(l: Lens<S, A>, value: A, source: S): S
export function set<S, A>(l: Lens<S, A>, value: A): (source: S) => S
export function set(...args: unknown[]): unknown {
  return instrumentedPurryConfig2('set', 'lens', setImplementation, args)
}

function setImplementation<S, A>(l: Lens<S, A>, value: A, source: S): S {
  return l.set(value)(source)
}
