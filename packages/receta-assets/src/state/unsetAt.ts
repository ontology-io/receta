import * as R from 'remeda'
import { removeAtIndex } from '@ontologyio/receta/collection'
import { path, set, view } from '@ontologyio/receta/lens'

type Step<T, K extends string> = T extends readonly (infer Item)[]
  ? K extends `${number}`
    ? Item
    : never
  : K extends keyof T
    ? T[K]
    : never

type ValueAt<S, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? ValueAt<NonNullable<Step<NonNullable<S>, Head>>, Rest>
  : Step<NonNullable<S>, P>

/** `P` when it is a dot path inside `S`, otherwise `never`, so the call doesn't compile. */
export type UnsetAtPath<S, P extends string> = [ValueAt<S, P>] extends [never] ? never : P

/** `parent` without `key`: an object loses the key, an array the item at that position. */
const without = (parent: unknown, key: string): unknown => {
  if (R.isArray(parent)) return removeAtIndex(parent, Number(key))
  if (R.isPlainObject(parent) && Object.hasOwn(parent, key)) return R.omit(parent, [key])
  return parent
}

/**
 * Returns new state with the key at a dot path deleted, not set to `undefined`, or with the array item removed.
 *
 * Use when: an entry must disappear from a nested record, such as a closed tab from
 * `'tabs.byId.t3'`, a cleared error from `'form.errors.email'` or a draft from `'drafts.p1'`, so
 * `Object.keys`, `in` and JSON no longer see it. A numeric last part removes that array item
 * and the later ones shift up. A path that isn't there returns the same state object. Only
 * remove optional keys: the type stays `S`.
 *
 * @example
 * ```ts
 * const state = {
 *   form: { errors: { email: 'Required', name: 'Too short' } as Record<string, string> },
 *   tabs: ['a', 'b', 'c'],
 * }
 *
 * unsetAt(state, 'form.errors.email').form
 * // => { errors: { name: 'Too short' } }
 *
 * R.pipe(state, unsetAt('tabs.1')).tabs
 * // => ['a', 'c']
 *
 * unsetAt(state, 'form.errors.phone') === state
 * // => true
 * ```
 *
 * @tags unset, delete, remove, omit, key, clear, dissoc, nested, immutable, lens
 * @see setAt - writes a value instead
 * @see removeWhereAt - removes array items by a predicate
 * @see path - @ontologyio/receta/lens, reaches the object that holds the key
 */
export function unsetAt<S, P extends string>(state: S, at: UnsetAtPath<S, P>): S
export function unsetAt<S, P extends string>(at: UnsetAtPath<S, P>): (state: S) => S
export function unsetAt(...args: unknown[]): unknown {
  return R.purry(unsetAtImplementation, args)
}

const unsetAtImplementation = <S>(state: S, at: string): S => {
  const segments = at.split('.')
  const key = R.last(segments) ?? ''
  const parentPath = R.join(R.dropLast(segments, 1), '.')
  if (parentPath === '') return without(state, key) as S
  const parentLens = path<S, unknown>(parentPath)
  const parent = view(parentLens, state)
  const next = without(parent, key)
  // Nothing removed: keep the same state, so subscribers don't see a change.
  return next === parent ? state : set(parentLens, next, state)
}
