import * as R from 'remeda'
import { mask, rename, type PlainObject } from '@ontologyio/receta/object'

/** The mapping's new names, each holding the value of the key it was mapped from. */
export type PickRenamedResult<T, M> = {
  [K in keyof M as M[K] extends string ? M[K] : never]: K extends keyof T ? T[K] : never
}

/**
 * Keeps only the keys named in a mapping, and gives each the new name the mapping says.
 *
 * Use when: turning a third-party or legacy record into your own shape, such as a Stripe
 * customer into `{ id, email, createdAt }`, where every field you don't map should be left
 * behind rather than leak through. A mapped key missing from the input is missing from the
 * output, and a key can keep its name by mapping it to itself. The result type follows the
 * mapping.
 *
 * @example
 * ```ts
 * const customer = { id: 'cus_1', email: 'ada@example.com', created: 1700000000, livemode: false, metadata: {} }
 *
 * pickRenamed(customer, { id: 'id', email: 'email', created: 'createdAt' })
 * // => { id: 'cus_1', email: 'ada@example.com', createdAt: 1700000000 }
 *
 * R.pipe({ user_name: 'ada', pwd_hash: 'x' }, pickRenamed({ user_name: 'username' }))
 * // => { username: 'ada' }
 *
 * pickRenamed({ a: 1 } as { a: number; b?: number }, { b: 'beta' })
 * // => {}
 * ```
 *
 * @tags rename, pick, map, fields, adapter, dto, api, response, whitelist, projection
 * @see rename - @ontologyio/receta/object, renames but keeps unmapped keys
 * @see mask - @ontologyio/receta/object, picks without renaming
 */
export function pickRenamed<T extends object, const M extends { readonly [K in keyof T]?: string }>(
  value: T,
  mapping: M,
): PickRenamedResult<T, M>
export function pickRenamed<T extends object, const M extends { readonly [K in keyof T]?: string }>(
  mapping: M,
): (value: T) => PickRenamedResult<T, M>
export function pickRenamed(...args: unknown[]): unknown {
  return R.purry(pickRenamedImplementation, args)
}

const pickRenamedImplementation = (value: PlainObject, mapping: Record<string, string>): PlainObject =>
  R.pipe(value, mask(R.keys(mapping)), rename(mapping))
