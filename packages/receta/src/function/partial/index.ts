/**
 * Creates a partially applied function by pre-filling arguments from the left.
 *
 * Returns a new function that, when called, invokes the original function with
 * the pre-filled arguments followed by any new arguments.
 *
 * @example
 * ```typescript
 * const greet = (greeting: string, name: string) => `${greeting}, ${name}!`
 *
 * const sayHello = partial(greet, 'Hello')
 * sayHello('Alice')    // => 'Hello, Alice!'
 * sayHello('Bob')      // => 'Hello, Bob!'
 * ```
 *
 * @example
 * ```typescript
 * // Multiple arguments
 * const multiply = (a: number, b: number, c: number) => a * b * c
 *
 * const double = partial(multiply, 2)
 * double(3, 4)         // => 24  (2 * 3 * 4)
 *
 * const quadruple = partial(multiply, 2, 2)
 * quadruple(5)         // => 20  (2 * 2 * 5)
 * ```
 *
 * @example
 * ```typescript
 * // Creating specialized functions
 * const log = (level: string, module: string, message: string) =>
 *   `[${level}] ${module}: ${message}`
 *
 * const logError = partial(log, 'ERROR')
 * const logUserError = partial(log, 'ERROR', 'UserModule')
 *
 * logUserError('Invalid input')  // => '[ERROR] UserModule: Invalid input'
 * ```
 */
export function partial<Args extends readonly any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R
export function partial<Args extends readonly any[], R>(
  fn: (...args: Args) => R,
  ...prefilledArgs: any[]
): (...args: any[]) => R
export function partial(fn: (...args: any[]) => any, ...prefilledArgs: any[]): any {
  return function partiallyApplied(...remainingArgs: any[]) {
    return fn(...prefilledArgs, ...remainingArgs)
  }
}
