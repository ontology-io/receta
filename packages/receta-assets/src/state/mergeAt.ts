import * as R from 'remeda'
import { over, path } from '@ontologyio/receta/lens'

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

/** Some fields of the object at dot path `P` inside `S`, or `never` when no object is there. */
export type MergeAtPatch<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly unknown[]
  ? never
  : NonNullable<ValueAt<S, P>> extends object
    ? Partial<NonNullable<ValueAt<S, P>>>
    : never

/**
 * Returns new state with some fields of the object at a dot path replaced, keeping its other fields.
 *
 * Use when: a form section, a server response or a settings panel updates several fields of
 * one nested object at once, such as `'profile.address'` or `'filters'`, and the rest of that
 * object must survive. The merge is one level deep: a nested object inside the patch replaces
 * the old one whole. A missing object is created from the patch. The patch is checked against
 * the object's type, and the input is never changed.
 *
 * @example
 * ```ts
 * const state = { profile: { name: 'Ada', address: { city: 'London', zip: 'N1', country: 'UK' } } }
 *
 * mergeAt(state, 'profile.address', { city: 'Paris', zip: '75001' })
 * // => { profile: { name: 'Ada', address: { city: 'Paris', zip: '75001', country: 'UK' } } }
 *
 * R.pipe(state, mergeAt('profile', { name: 'Ada L.' })).profile.name
 * // => 'Ada L.'
 * ```
 *
 * @tags merge, patch, assign, update, partial, nested, object, immutable, reducer, lens
 * @see setAt - replaces one value instead of merging
 * @see over - @ontologyio/receta/lens, applies the merge through the path lens
 */
export function mergeAt<S, P extends string>(state: S, at: P, patch: MergeAtPatch<S, P>): S
export function mergeAt<S, P extends string>(at: P, patch: MergeAtPatch<S, P>): (state: S) => S
export function mergeAt(...args: unknown[]): unknown {
  return R.purry(mergeAtImplementation, args)
}

const mergeAtImplementation = <S>(state: S, at: string, patch: object): S =>
  over(path<S, object | undefined>(at), (current) => ({ ...current, ...patch }), state)
