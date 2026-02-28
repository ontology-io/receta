/**
 * Utilities for creating data-first/data-last functions with different parameter patterns.
 *
 * @module utils/purry
 */

/**
 * Creates a function that supports both data-first and data-last signatures
 * where the "configuration" parameter comes first.
 *
 * Pattern:
 * - Data-first: `fn(config, data)` → result
 * - Data-last: `fn(config)` → `(data) => result`
 *
 * This differs from Remeda's `purry` which expects data-first as `fn(data, ...args)`.
 *
 * Use this for:
 * - Lens operations: `view(lens, source)` / `view(lens)(source)`
 * - Predicate builders: `where(spec, obj)` / `where(spec)(obj)`
 * - Any function where config/spec/lens comes before data
 *
 * @param impl - Implementation function with signature `(config, data) => result`
 * @param args - Arguments passed to the wrapper function
 * @returns Either the result (data-first) or curried function (data-last)
 *
 * @example
 * ```typescript
 * // Define wrapper with overloads
 * function myFn<T>(config: Config, data: T): Result
 * function myFn<T>(config: Config): (data: T) => Result
 * function myFn(...args: unknown[]): unknown {
 *   return purryConfig(myFnImpl, args)
 * }
 *
 * // Implementation
 * function myFnImpl<T>(config: Config, data: T): Result {
 *   // ... logic
 * }
 *
 * // Usage
 * myFn(config, data)        // data-first
 * myFn(config)(data)        // data-last
 * pipe(data, myFn(config))  // in pipe
 * ```
 *
 * @internal
 */
export function purryConfig(impl: any, args: readonly unknown[]): any {
  // Data-first: both config and data provided
  if (args.length === 2) {
    return impl(args[0], args[1])
  }

  // Data-last: only config provided, return function that takes data
  if (args.length === 1) {
    return (data: unknown) => impl(args[0], data)
  }

  throw new Error(`purryConfig: expected 1 or 2 arguments, got ${args.length}`)
}

/**
 * Creates a function that supports both data-first and data-last signatures
 * where TWO configuration parameters come before the data.
 *
 * Pattern:
 * - Data-first: `fn(config1, config2, data)` → result
 * - Data-last: `fn(config1, config2)` → `(data) => result`
 *
 * Use this for:
 * - Lens operations with functions: `over(lens, fn, source)` / `over(lens, fn)(source)`
 * - Validation: `validate(schema, options, data)` / `validate(schema, options)(data)`
 *
 * @param impl - Implementation with signature `(config1, config2, data) => result`
 * @param args - Arguments passed to the wrapper function
 *
 * @example
 * ```typescript
 * function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A, source: S): S
 * function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A): (source: S) => S
 * function over(...args: unknown[]): unknown {
 *   return purryConfig2(overImpl, args)
 * }
 * ```
 *
 * @internal
 */
export function purryConfig2(impl: any, args: readonly unknown[]): any {
  // Data-first: all three parameters provided
  if (args.length === 3) {
    return impl(args[0], args[1], args[2])
  }

  // Data-last: only config parameters provided
  if (args.length === 2) {
    return (data: unknown) => impl(args[0], args[1], data)
  }

  throw new Error(`purryConfig2: expected 2 or 3 arguments, got ${args.length}`)
}

/**
 * Creates a function that supports both data-first and data-last signatures
 * where THREE configuration parameters come before the data.
 *
 * Pattern:
 * - Data-first: `fn(config1, config2, config3, data)` → result
 * - Data-last: `fn(config1, config2, config3)` → `(data) => result`
 *
 * Use this for:
 * - Conditional functions: `ifElse(pred, onTrue, onFalse, value)` / `ifElse(pred, onTrue, onFalse)(value)`
 *
 * @param impl - Implementation with signature `(config1, config2, config3, data) => result`
 * @param args - Arguments passed to the wrapper function
 *
 * @example
 * ```typescript
 * function ifElse<T, U>(
 *   predicate: Predicate<T>,
 *   onTrue: Mapper<T, U>,
 *   onFalse: Mapper<T, U>,
 *   value: T
 * ): U
 * function ifElse<T, U>(
 *   predicate: Predicate<T>,
 *   onTrue: Mapper<T, U>,
 *   onFalse: Mapper<T, U>
 * ): (value: T) => U
 * function ifElse(...args: unknown[]): unknown {
 *   return purryConfig3(ifElseImpl, args)
 * }
 * ```
 *
 * @internal
 */
export function purryConfig3(impl: any, args: readonly unknown[]): any {
  // Data-first: all four parameters provided
  if (args.length === 4) {
    return impl(args[0], args[1], args[2], args[3])
  }

  // Data-last: only config parameters provided
  if (args.length === 3) {
    return (data: unknown) => impl(args[0], args[1], args[2], data)
  }

  throw new Error(`purryConfig3: expected 3 or 4 arguments, got ${args.length}`)
}
