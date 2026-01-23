import * as R from 'remeda'

/**
 * Creates a function that only accepts one argument, ignoring additional arguments.
 *
 * This is useful when passing functions to higher-order functions that provide
 * multiple arguments, but you only want to use the first one.
 *
 * @example
 * ```typescript
 * // parseInt takes two arguments, which causes issues with map
 * ['1', '2', '3'].map(parseInt)           // => [1, NaN, NaN] (unexpected!)
 * ['1', '2', '3'].map(unary(parseInt))    // => [1, 2, 3] (correct)
 * ```
 *
 * @example
 * ```typescript
 * const logFirst = unary(console.log)
 *
 * ['a', 'b', 'c'].forEach(logFirst)
 * // Logs:
 * // a
 * // b
 * // c
 * // (without indices or array)
 * ```
 *
 * @example
 * ```typescript
 * // Wrapping functions for cleaner callbacks
 * const parseNumber = unary(Number)
 * const inputs = ['42', '3.14', '100']
 *
 * inputs.map(parseNumber)  // => [42, 3.14, 100]
 * ```
 */
export function unary<A, R>(fn: (a: A, ...rest: any[]) => R): (a: A) => R {
  return function unaryFunction(a: A): R {
    return fn(a)
  }
}

/**
 * Creates a function that only accepts two arguments, ignoring additional arguments.
 *
 * This is useful when you want to limit the number of arguments passed to a function
 * in callbacks or higher-order functions.
 *
 * @example
 * ```typescript
 * const add = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)
 *
 * add(1, 2, 3, 4)           // => 10
 * binary(add)(1, 2, 3, 4)   // => 3 (only uses first two)
 * ```
 *
 * @example
 * ```typescript
 * // Limiting callback arguments
 * const logTwo = binary(console.log)
 *
 * ['a', 'b', 'c'].forEach(logTwo)
 * // Logs:
 * // a 0
 * // b 1
 * // c 2
 * // (ignores array parameter)
 * ```
 */
export function binary<A, B, R>(fn: (a: A, b: B, ...rest: any[]) => R): (a: A, b: B) => R {
  return function binaryFunction(a: A, b: B): R {
    return fn(a, b)
  }
}

/**
 * Creates a function that only accepts N arguments, ignoring additional arguments.
 *
 * This is the generalized version of `unary` and `binary`, allowing you to specify
 * exactly how many arguments should be accepted.
 *
 * @example
 * ```typescript
 * const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)
 *
 * const sumTwo = nAry(2, sum)
 * sumTwo(1, 2, 3, 4, 5)  // => 3 (only sums first two)
 *
 * const sumThree = nAry(3, sum)
 * sumThree(1, 2, 3, 4, 5)  // => 6 (only sums first three)
 * ```
 *
 * @example
 * ```typescript
 * // Controlling variadic functions
 * const max = (...nums: number[]) => Math.max(...nums)
 *
 * const maxOfTwo = nAry(2, max)
 * maxOfTwo(5, 10, 2, 8)  // => 10 (only considers first two)
 * ```
 *
 * @example
 * ```typescript
 * // Creating specialized versions
 * const log = (...args: any[]) => console.log(...args)
 *
 * const logOne = nAry(1, log)
 * const logThree = nAry(3, log)
 *
 * logOne('a', 'b', 'c')      // Logs: a
 * logThree('a', 'b', 'c', 'd')  // Logs: a b c
 * ```
 */
export function nAry<R>(n: number, fn: (...args: any[]) => R): (...args: any[]) => R {
  return function nAryFunction(...args: any[]): R {
    return fn(...R.take(args, n))
  }
}
