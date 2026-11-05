/**
 * Creates a partially applied function by pre-filling arguments from the right.
 *
 * Returns a new function that, when called, invokes the original function with
 * any new arguments followed by the pre-filled arguments.
 *
 * This is the mirror of `partial`, filling arguments from the end instead of the start.
 *
 * @example
 * ```typescript
 * const divide = (a: number, b: number) => a / b
 *
 * const divideBy10 = partialRight(divide, 10)
 * divideBy10(100)  // => 10  (100 / 10)
 * divideBy10(50)   // => 5   (50 / 10)
 * ```
 *
 * @example
 * ```typescript
 * // Useful when the settings come last
 * const formatDate = (date: Date, format: string, locale: string) =>
 *   date.toLocaleDateString(locale, { dateStyle: format as any })
 *
 * const formatInUS = partialRight(formatDate, 'en-US')
 * const formatInFR = partialRight(formatDate, 'fr-FR')
 *
 * const launch = new Date('2026-01-22T12:00:00Z')
 * formatInUS(launch, 'short')   // => '1/22/26'
 * formatInFR(launch, 'short')   // => '22/01/2026'
 * ```
 *
 * @example
 * ```typescript
 * // Multiple arguments from the right
 * const log = (message: string, level: string, timestamp: string) =>
 *   `${timestamp} [${level}] ${message}`
 *
 * const logNow = partialRight(log, 'INFO', '2026-01-22T10:00:00Z')
 * logNow('Application started')  // => '2026-01-22T10:00:00Z [INFO] Application started'
 * ```
 *
 * @see partial - for left-to-right partial application
 */
export function partialRight<Args extends readonly any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R
export function partialRight<Args extends readonly any[], R>(
  fn: (...args: Args) => R,
  ...prefilledArgs: any[]
): (...args: any[]) => R
export function partialRight(fn: (...args: any[]) => any, ...prefilledArgs: any[]): any {
  return function partiallyAppliedRight(...remainingArgs: any[]) {
    return fn(...remainingArgs, ...prefilledArgs)
  }
}
