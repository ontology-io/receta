/**
 * Calculates the sum of an array of numbers.
 *
 * Returns 0 for an empty array.
 *
 * @param values - Array of numbers to sum
 * @returns The sum of all numbers
 *
 * @example
 * ```typescript
 * sum([1, 2, 3, 4]) // => 10
 * sum([]) // => 0
 * sum([-1, 1]) // => 0
 * sum([0.1, 0.2, 0.3]) // => 0.6
 *
 * // Real-world: Shopping cart total
 * const cartTotal = (items: CartItem[]) =>
 *   sum(items.map(item => item.price * item.quantity))
 * ```
 *
 * @see average - for calculating the mean
 */
export function sum(values: readonly number[]): number {
  return values.reduce((acc, val) => acc + val, 0)
}
