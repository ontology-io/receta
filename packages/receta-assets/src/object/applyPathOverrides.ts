import * as R from 'remeda'
import { getPath, setPath, type PlainObject } from '@ontologyio/receta/object'
import { isNone } from '@ontologyio/receta/option'
import { isNotEmpty } from '@ontologyio/receta/predicate'
import { invalid, valid, type Validation } from '@ontologyio/receta/validation'

export type ApplyPathOverridesProblem = {
  readonly code: 'PATH_NOT_FOUND' | 'WRONG_TYPE'
  readonly path: string
  readonly message: string
}

const kindOf = (value: unknown): string => {
  if (R.isArray(value)) return 'array'
  if (R.isNullish(value)) return 'null'
  return typeof value
}

const withArticle = (kind: string): string => (/^[aeiou]/.test(kind) ? `an ${kind}` : `a ${kind}`)

/** What is wrong with one override, or nothing. */
const problemsOf = (value: PlainObject, path: string, next: unknown): readonly ApplyPathOverridesProblem[] => {
  const current = getPath(path.split('.'), value)
  if (isNone(current)) return [{ code: 'PATH_NOT_FOUND', path, message: `Nothing to set at "${path}"` }]
  const [was, got] = [kindOf(current.value), kindOf(next)]
  // A null slot is a setting left empty on purpose, so any value may fill it.
  if (was === 'null' || was === got) return []
  return [{ code: 'WRONG_TYPE', path, message: `"${path}" holds ${withArticle(was)}, got ${withArticle(got)}` }]
}

/**
 * Applies a record of `'dot.path': value` overrides to an object, but only if every path exists and keeps its type.
 *
 * Use when: layering overrides from CLI flags, environment-specific files or an admin
 * screen onto a known config, where one bad key must stop the whole set and the user should
 * see every mistake at once, not one per run. It returns `Valid(updated)` when all overrides
 * fit, otherwise `Invalid` with one problem per bad path: `PATH_NOT_FOUND` or `WRONG_TYPE`.
 * A setting that holds `null` takes any value. Nothing is applied unless everything fits, and
 * the input is never changed.
 *
 * @example
 * ```ts
 * const config = { db: { host: 'localhost', port: 5432 }, cache: { ttl: 60 }, proxy: null }
 *
 * applyPathOverrides(config, { 'db.host': 'db.internal', 'cache.ttl': 300 })
 * // => Valid({ db: { host: 'db.internal', port: 5432 }, cache: { ttl: 300 }, proxy: null })
 *
 * R.pipe(config, applyPathOverrides({ 'db.port': '6543', 'cache.tll': 300, 'db.host': 'x' }))
 * // => Invalid([
 * //   { code: 'WRONG_TYPE', path: 'db.port', message: '"db.port" holds a number, got a string' },
 * //   { code: 'PATH_NOT_FOUND', path: 'cache.tll', message: 'Nothing to set at "cache.tll"' },
 * // ])
 *
 * applyPathOverrides(config, {})
 * // => Valid({ db: { host: 'localhost', port: 5432 }, cache: { ttl: 60 }, proxy: null })
 * ```
 *
 * @tags config, override, cli, flags, layer, settings, strict, typo, validation, nested
 * @see setExistingPath - one override, as a Result
 * @see setPath - @ontologyio/receta/object, the write once every path checks out
 */
export function applyPathOverrides<T extends object>(
  value: T,
  overrides: Readonly<Record<string, unknown>>,
): Validation<T, ApplyPathOverridesProblem>
export function applyPathOverrides<T extends object>(
  overrides: Readonly<Record<string, unknown>>,
): (value: T) => Validation<T, ApplyPathOverridesProblem>
export function applyPathOverrides(...args: unknown[]): unknown {
  return R.purry(applyPathOverridesImplementation, args)
}

const applyPathOverridesImplementation = <T extends object>(
  value: T,
  overrides: Readonly<Record<string, unknown>>,
): Validation<T, ApplyPathOverridesProblem> => {
  const entries = R.entries(overrides)
  const problems = R.flatMap(entries, ([path, next]) => problemsOf(value as PlainObject, path, next))
  if (isNotEmpty(problems)) return invalid(problems)
  const updated = R.reduce(entries, (current, [path, next]) => setPath(path.split('.'), next, current), value as PlainObject)
  return valid(updated as T)
}
