import type { Lens } from '../types'
import { purryConfig } from '../../utils'

/**
 * Gets the value focused by a Lens from a source object.
 *
 * This is the primary way to read through a lens. It applies the lens's
 * `get` function to extract the focused value.
 *
 * Supports both data-first and data-last (for use in pipes).
 *
 * @param l - The Lens to view through
 * @param source - The source object to read from
 * @returns The focused value
 *
 * @example
 * ```typescript
 * // Data-first
 * const nameLens = prop<User>('name')
 * const user = { name: 'Alice', age: 30 }
 * view(nameLens, user) // 'Alice'
 * ```
 *
 * @example
 * ```typescript
 * // Data-last (in pipe)
 * import * as R from 'remeda'
 *
 * const result = R.pipe(
 *   user,
 *   view(prop<User>('name'))
 * ) // 'Alice'
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
 * view(cityLens, user) // 'Boston'
 * ```
 *
 * @see set - To update through a lens
 * @see over - To transform through a lens
 * @see prop - To create a property lens
 */
export function view<S, A>(l: Lens<S, A>, source: S): A
export function view<S, A>(l: Lens<S, A>): (source: S) => A
export function view(...args: unknown[]): unknown {
  return purryConfig(viewImplementation, args)
}

function viewImplementation<S, A>(l: Lens<S, A>, source: S): A {
  return l.get(source)
}
