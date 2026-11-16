import * as R from 'remeda'
import { collect, map, type Option, type Some } from '@ontologyio/receta/option'

// Distributes over Some<T> | None, so it picks the value side of a field's Option.
type SomeValue<O> = O extends Some<infer T> ? T : never

/** The Some value of each field. */
export type SequenceOptionRecordValues<Os> = { readonly [K in keyof Os]: SomeValue<Os[K]> }

/**
 * Turns a record of Options into Some of a record when every field has a value, or None when any is missing.
 *
 * Use when: an object only makes sense with all its parts, such as an address that needs
 * street, city and postcode, a connection that needs host, user and password, or a price that
 * needs amount and currency. Field names and types carry over, so
 * `{ city: Option<string> }` becomes `Option<{ city: string }>`.
 *
 * @example
 * ```ts
 * import { fromNullable, none, some } from '@ontologyio/receta/option'
 *
 * const form = { street: '1 Main St', city: 'Springfield', postcode: undefined }
 *
 * sequenceOptionRecord({ street: some(form.street), city: some(form.city) })
 * // => Some({ street: '1 Main St', city: 'Springfield' })
 *
 * sequenceOptionRecord({ city: fromNullable(form.city), postcode: fromNullable(form.postcode) })
 * // => None
 *
 * sequenceOptionRecord({ only: none() })
 * // => None
 * ```
 *
 * @tags record, object, all present, combine, fields, required, struct, optional
 * @see sequenceRecord - the same for Results, with the first error
 * @see collect - @ontologyio/receta/option, the same for a list
 */
export function sequenceOptionRecord<const Os extends Readonly<Record<string, Option<unknown>>>>(
  options: Os,
): Option<SequenceOptionRecordValues<Os>> {
  return R.pipe(
    R.entries(options),
    R.map(([key, option]) => map(option, (value) => [key, value] as const)),
    (entries) => collect(entries),
    map((entries) => R.fromEntries(entries)),
    // R.entries forgets which key held which type, so the record's type is restated here.
  ) as Option<SequenceOptionRecordValues<Os>>
}
