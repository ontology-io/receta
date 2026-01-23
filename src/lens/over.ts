import type { Lens } from './types'
import { purryConfig2 } from '../utils'

/**
 * Applies a transformation function to the value focused by a Lens.
 *
 * This is the most powerful lens operation. It reads the current value,
 * applies a transformation, and sets the result - all immutably.
 *
 * Supports both data-first and data-last (for use in pipes).
 *
 * @param l - The Lens to transform through
 * @param fn - Function to transform the focused value
 * @param source - The source object to update
 * @returns A new source object with the transformed value
 *
 * @example
 * ```typescript
 * // Data-first
 * const ageLens = prop<User>('age')
 * const user = { name: 'Alice', age: 30 }
 *
 * over(ageLens, age => age + 1, user)
 * // => { name: 'Alice', age: 31 }
 * ```
 *
 * @example
 * ```typescript
 * // Data-last (in pipe)
 * import * as R from 'remeda'
 *
 * const updated = R.pipe(
 *   user,
 *   over(prop<User>('age'), age => age + 1)
 * ) // { name: 'Alice', age: 31 }
 * ```
 *
 * @example
 * ```typescript
 * // String manipulation
 * const nameLens = prop<User>('name')
 * const user = { name: 'alice', age: 30 }
 *
 * over(nameLens, name => name.toUpperCase(), user)
 * // => { name: 'ALICE', age: 30 }
 * ```
 *
 * @example
 * ```typescript
 * // Complex transformations with nested lenses
 * interface State {
 *   cart: {
 *     items: Array<{ id: string; quantity: number }>
 *   }
 * }
 *
 * const itemsLens = path<State, any>('cart.items')
 *
 * over(
 *   itemsLens,
 *   items => items.map(item =>
 *     item.id === 'abc' ? { ...item, quantity: item.quantity + 1 } : item
 *   ),
 *   state
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Incrementing a counter (React state pattern)
 * const countLens = prop<State>('count')
 * setState(over(countLens, n => n + 1))
 * ```
 *
 * @see view - To read through a lens
 * @see set - To directly set a value through a lens
 * @see prop - To create a property lens
 */
export function over<S, A>(l: Lens<S, A>, fn: (a: A) => A, source: S): S
export function over<S, A>(l: Lens<S, A>, fn: (a: A) => A): (source: S) => S
export function over(...args: unknown[]): unknown {
  return purryConfig2(overImplementation, args)
}

function overImplementation<S, A>(l: Lens<S, A>, fn: (a: A) => A, source: S): S {
  const currentValue = l.get(source)
  const newValue = fn(currentValue)
  return l.set(newValue)(source)
}
