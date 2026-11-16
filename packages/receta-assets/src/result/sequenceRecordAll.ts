import * as R from 'remeda'
import { err, isErr, isOk, ok, type Err, type Ok, type Result } from '@ontologyio/receta/result'

// Distributes over Ok<T> | Err<E>, so each picks its side of a field's Result.
type OkValue<R> = R extends Ok<infer T> ? T : never
type ErrValue<R> = R extends Err<infer E> ? E : never

/** The Ok value of each field. */
export type SequenceRecordAllValues<Rs> = { readonly [K in keyof Rs]: OkValue<Rs[K]> }

/** The Err value of each field that failed; fields that succeeded are absent. */
export type SequenceRecordAllErrors<Rs> = { readonly [K in keyof Rs]?: ErrValue<Rs[K]> }

/**
 * Turns a record of Results into Ok with every field's value, or Err with the error of every field that failed, by name.
 *
 * Use when: a form, a request body or a config has several fields parsed separately, and
 * the caller should get every field's problem at once, keyed by field so it can sit next to
 * the right input or be listed in a startup error. Field names and types carry over.
 *
 * @example
 * ```ts
 * import { err, ok } from '@ontologyio/receta/result'
 *
 * sequenceRecordAll({ name: ok('api'), port: ok(8080) })
 * // => Ok({ name: 'api', port: 8080 })
 *
 * sequenceRecordAll({
 *   name: ok('api'),
 *   port: err('PORT must be a number'),
 *   workers: err('WORKERS must be at least 1'),
 * })
 * // => Err({ port: 'PORT must be a number', workers: 'WORKERS must be at least 1' })
 * ```
 *
 * @tags record, object, form, fields, config, all errors, by field, struct
 * @see sequenceRecord - stops at the first field that failed
 * @see collectAllErrors - the same for a list
 */
export function sequenceRecordAll<const Rs extends Readonly<Record<string, Result<unknown, unknown>>>>(
  results: Rs,
): Result<SequenceRecordAllValues<Rs>, SequenceRecordAllErrors<Rs>> {
  const entries = R.entries(results)
  const errors = R.fromEntries(
    R.flatMap(entries, ([key, result]) => (isErr(result) ? [[key, result.error] as const] : [])),
  )
  const values = R.fromEntries(
    R.flatMap(entries, ([key, result]) => (isOk(result) ? [[key, result.value] as const] : [])),
  )
  // R.entries forgets which key held which type, so the record types are restated here.
  return (R.isEmpty(errors) ? ok(values) : err(errors)) as Result<
    SequenceRecordAllValues<Rs>,
    SequenceRecordAllErrors<Rs>
  >
}
