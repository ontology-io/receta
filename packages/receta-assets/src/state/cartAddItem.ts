import * as R from 'remeda'
import { index, optional, over, prop as propLens } from '@ontologyio/receta/lens'
import { map } from '@ontologyio/receta/option'
import { eq, prop } from '@ontologyio/receta/predicate'

/** What a cart line needs: an id that names the product or variant, and a quantity. */
export type CartAddItemLine = { readonly id: string | number; readonly quantity: number }

/**
 * Adds a line to a cart, or adds its quantity to the line with the same id, so a product appears once.
 *
 * Use when: an "Add to cart" button, a reorder or a cart merge after login adds products to
 * the cart in state. A new id is appended at the end with the given line. An id already in
 * the cart keeps its line and position and only its quantity grows, so a price or note on the
 * existing line wins. A quantity of 0 or less adds nothing and returns the same array. Give
 * each variant its own id (`'shirt-m-blue'`) when variants must be separate lines.
 *
 * @example
 * ```ts
 * const cart = [{ id: 'mug', quantity: 1, price: 9 }]
 *
 * cartAddItem(cart, { id: 'tea', quantity: 2, price: 4 })
 * // => [{ id: 'mug', quantity: 1, price: 9 }, { id: 'tea', quantity: 2, price: 4 }]
 *
 * R.pipe(cart, cartAddItem({ id: 'mug', quantity: 2, price: 8 }))
 * // => [{ id: 'mug', quantity: 3, price: 9 }]
 *
 * cartAddItem(cart, { id: 'tea', quantity: 0, price: 4 }) === cart
 * // => true
 * ```
 *
 * @tags cart, basket, add to cart, quantity, shopping, ecommerce, checkout, line item, lens
 * @see cartSetQuantity - sets a line's quantity, removing it at 0
 * @see optional - @ontologyio/receta/lens, reaches the existing line if there is one
 */
export function cartAddItem<L extends CartAddItemLine>(lines: readonly L[], line: L): readonly L[]
export function cartAddItem<L extends CartAddItemLine>(line: L): (lines: readonly L[]) => readonly L[]
export function cartAddItem(...args: unknown[]): unknown {
  return R.purry(cartAddItemImplementation, args)
}

const cartAddItemImplementation = <L extends CartAddItemLine>(lines: readonly L[], line: L): readonly L[] => {
  if (line.quantity <= 0) return lines
  const position = R.findIndex(lines, prop<L, 'id'>('id', eq(line.id)))
  if (position === -1) return [...lines, line]
  const addQuantity = over(propLens<L, 'quantity'>('quantity'), (quantity) => (quantity + line.quantity) as L['quantity'])
  return over(optional(index<L>(position)), map(addQuantity), lines)
}
