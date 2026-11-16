import * as R from 'remeda'
import { collect, map, type Err, type Ok, type Result } from '@ontologyio/receta/result'

// Distributes over Ok<T> | Err<E>, so each picks its side of a field's Result.
type OkValue<R> = R extends Ok<infer T> ? T : never
type ErrValue<R> = R extends Err<infer E> ? E : never

/** The Ok value of each field. */
export type SequenceRecordValues<Rs> = { readonly [K in keyof Rs]: OkValue<Rs[K]> }

/** Any field's Err value. */
export type SequenceRecordError<Rs> = { [K in keyof Rs]: ErrValue<Rs[K]> }[keyof Rs]

/**
 * Turns a record of Results into one Result of a record: Ok with every field's value, or the first field's Err.
 *
 * Use when: several values are parsed or loaded separately, such as the fields of a request,
 * the settings of a config or the parts of a page, and the code needs one typed object or a
 * reason to stop. Field names and types carry over, so `{ port: Result<number, E> }`
 * becomes `Result<{ port: number }, E>`. Fields are checked in the order they were written.
 *
 * @example
 * ```ts
 * import { err, ok, parseNumber } from '@ontologyio/receta/result'
 *
 * sequenceRecord({ host: ok('db.internal'), port: parseNumber('5432') })
 * // => Ok({ host: 'db.internal', port: 5432 })
 *
 * sequenceRecord({ host: ok('db.internal'), port: err('PORT missing'), user: err('USER missing') })
 * // => Err('PORT missing')
 * ```
 *
 * @tags record, object, combine, fields, config, form, all, struct
 * @see sequenceRecordAll - reports every field's error, keyed by field
 * @see sequenceOptionRecord - the same for Options
 * @see collect - @ontologyio/receta/result, the same for a list
 */
export function sequenceRecord<const Rs extends Readonly<Record<string, Result<unknown, unknown>>>>(
  results: Rs,
): Result<SequenceRecordValues<Rs>, SequenceRecordError<Rs>> {
  return R.pipe(
    R.entries(results),
    R.map(([key, result]) => map(result, (value) => [key, value] as const)),
    (entries) => collect(entries),
    map((entries) => R.fromEntries(entries)),
    // R.entries forgets which key held which type, so the record's type is restated here.
  ) as Result<SequenceRecordValues<Rs>, SequenceRecordError<Rs>>
}
