/**
 * Creates a function that reverses the order of the first two arguments.
 *
 * This is useful when you have a function with arguments in an inconvenient order
 * for partial application or piping.
 *
 * @example
 * ```typescript
 * const divide = (a: number, b: number) => a / b
 * const divideBy = flip(divide)
 *
 * divide(10, 2)      // => 5
 * divideBy(2, 10)    // => 5  (same as divide(10, 2))
 * ```
 *
 * @example
 * ```typescript
 * // Useful for partial application
 * const subtract = (a: number, b: number) => a - b
 * const subtractFrom = flip(subtract)
 *
 * const subtractFrom10 = (n: number) => subtractFrom(n, 10)
 * subtractFrom10(3)  // => 7  (10 - 3)
 * ```
 *
 * @example
 * ```typescript
 * // With object methods
 * const concat = (a: string, b: string) => a + b
 * const append = flip(concat)
 *
 * concat('hello', ' world')   // => 'hello world'
 * append(' world', 'hello')   // => 'hello world'
 * ```
 */
export function flip<A, B, R>(fn: (a: A, b: B) => R): (b: B, a: A) => R
export function flip<A, B, C, R>(fn: (a: A, b: B, c: C) => R): (b: B, a: A, c: C) => R
export function flip<A, B, C, D, R>(
  fn: (a: A, b: B, c: C, d: D) => R
): (b: B, a: A, c: C, d: D) => R
export function flip(fn: (...args: any[]) => any): (...args: any[]) => any {
  return function flipped(...args: any[]) {
    const [first, second, ...rest] = args
    return fn(second, first, ...rest)
  }
}
