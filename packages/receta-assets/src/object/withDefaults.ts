import * as R from 'remeda'
import { deepMerge, stripEmpty, type PlainObject } from '@ontologyio/receta/object'

/** Any part of `T` at any depth, where `null` and `undefined` mean "use the default". */
export type WithDefaultsInput<T> = {
  readonly [K in keyof T]?:
    | (T[K] extends readonly unknown[] | ((...args: never[]) => unknown)
        ? T[K]
        : T[K] extends object
          ? WithDefaultsInput<T[K]>
          : T[K])
    | null
    | undefined
}

// Only null and undefined go: '' and [] are values the caller chose.
const KEEP_EMPTY_VALUES = { stripEmptyStrings: false, stripEmptyArrays: false, stripEmptyObjects: false }

/**
 * Fills in every missing setting from a defaults object, at any depth, where `null` and `undefined` count as missing.
 *
 * Use when: merging user, file or environment config over defaults, or completing a partial
 * options argument, where a nested default must survive a partial override and an explicit
 * `undefined` must not wipe it out (a plain spread or `deepMerge` lets it). Nested plain
 * objects merge key by key. Arrays and everything else are replaced whole by the given value:
 * `[]` and `''` are kept, because someone chose them. Neither input is changed.
 *
 * @example
 * ```ts
 * const defaults = {
 *   port: 3000,
 *   db: { host: 'localhost', pool: { min: 2, max: 10 } },
 *   origins: ['http://localhost:3000'],
 * }
 *
 * withDefaults({ db: { pool: { max: 50 } }, port: undefined }, defaults)
 * // => { port: 3000, db: { host: 'localhost', pool: { min: 2, max: 50 } }, origins: ['http://localhost:3000'] }
 *
 * R.pipe({ origins: [], db: { host: null } }, withDefaults(defaults))
 * // => { port: 3000, db: { host: 'localhost', pool: { min: 2, max: 10 } }, origins: [] }
 * ```
 *
 * @tags defaults, config, options, merge, deep, fallback, settings, partial
 * @see deepMerge - @ontologyio/receta/object, the merge, which lets undefined overwrite
 * @see stripEmpty - @ontologyio/receta/object, drops null and undefined before the merge
 */
export function withDefaults<T extends object>(value: WithDefaultsInput<T>, defaults: T): T
export function withDefaults<T extends object>(defaults: T): (value: WithDefaultsInput<T>) => T
export function withDefaults(...args: unknown[]): unknown {
  return R.purry(withDefaultsImplementation, args)
}

const withDefaultsImplementation = (value: PlainObject, defaults: PlainObject): PlainObject =>
  deepMerge([defaults, stripEmpty(value, KEEP_EMPTY_VALUES)])
