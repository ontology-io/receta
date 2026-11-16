import * as R from 'remeda'
import { index, optional, over, prop as propLens, set } from '@ontologyio/receta/lens'
import { map } from '@ontologyio/receta/option'
import { eq, not, prop } from '@ontologyio/receta/predicate'

/** What a cart line needs: an id that names the product or variant, and a quantity. */
export type CartSetQuantityLine = { readonly id: string | number; readonly quantity: number }

/**
 * Sets the quantity of the cart line with an id, and removes the line when the quantity is 0 or less.
 *
 * Use when: the quantity input, the "−" button or a "remove" link of a cart row changes one
 * line. Removing is just setting 0, so one handler covers all three. The line keeps its
 * position and other fields. An id that isn't in the cart changes nothing and returns the same
 * array: use `cartAddItem` to add a product.
 *
 * @example
 * ```ts
 * const cart = [{ id: 'mug', quantity: 1, price: 9 }, { id: 'tea', quantity: 2, price: 4 }]
 *
 * cartSetQuantity(cart, 'tea', 5)
 * // => [{ id: 'mug', quantity: 1, price: 9 }, { id: 'tea', quantity: 5, price: 4 }]
 *
 * R.pipe(cart, cartSetQuantity('mug', 0))
 * // => [{ id: 'tea', quantity: 2, price: 4 }]
 *
 * cartSetQuantity(cart, 'cake', 3) === cart
 * // => true
 * ```
 *
 * @tags cart, basket, quantity, remove, update, shopping, ecommerce, checkout, line item, lens
 * @see cartAddItem - adds a line, or adds to its quantity
 * @see optional - @ontologyio/receta/lens, reaches the line if there is one
 */
export function cartSetQuantity<L extends CartSetQuantityLine>(
  lines: readonly L[],
  id: L['id'],
  quantity: number,
): readonly L[]
export function cartSetQuantity<L extends CartSetQuantityLine>(
  id: L['id'],
  quantity: number,
): (lines: readonly L[]) => readonly L[]
export function cartSetQuantity(...args: unknown[]): unknown {
  return R.purry(cartSetQuantityImplementation, args)
}

const cartSetQuantityImplementation = <L extends CartSetQuantityLine>(
  lines: readonly L[],
  id: L['id'],
  quantity: number,
): readonly L[] => {
  const hasId = prop<L, 'id'>('id', eq(id))
  const position = R.findIndex(lines, hasId)
  if (position === -1) return lines
  if (quantity <= 0) return R.filter(lines, not(hasId))
  const setQuantity = set(propLens<L, 'quantity'>('quantity'), quantity as L['quantity'])
  return over(optional(index<L>(position)), map(setQuantity), lines)
}
