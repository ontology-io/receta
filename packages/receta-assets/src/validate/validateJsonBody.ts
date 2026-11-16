import * as R from 'remeda'
import { isObject } from '@ontologyio/receta/predicate'
import { match as matchResult, parseJSON } from '@ontologyio/receta/result'
import {
  collectErrors,
  invalid,
  map,
  match,
  valid,
  type FieldError,
  type Validation,
  type Validator,
} from '@ontologyio/receta/validation'

/** One validator per field, each taking the raw value and returning the typed one. */
export type ValidateJsonBodyFields<T> = { readonly [K in keyof T]: Validator<unknown, T[K], string> }

const bodyError = (message: string): Validation<never, FieldError<string>> => invalid({ field: '', errors: [message] })

const checkFields = <T>(record: Record<string, unknown>, fields: ValidateJsonBodyFields<T>): Validation<T, FieldError<string>> =>
  R.pipe(
    R.entries(fields as Record<string, Validator<unknown, unknown, string>>),
    R.map(([field, validator]) =>
      R.pipe(
        validator(record[field]),
        match<unknown, string, Validation<readonly [string, unknown], FieldError<string>>>({
          onValid: (value) => valid([field, value] as const),
          onInvalid: (errors) => invalid({ field, errors }),
        }),
      ),
    ),
    collectErrors(),
    // Each validator produced its own field's type, so together the entries make a T.
    map((entries) => R.fromEntries(entries) as T),
  )

/**
 * Parses a JSON request body and checks it field by field, returning a typed object or every error.
 *
 * Use when: a handler reads the raw body text, as in a Cloudflare Worker, a Lambda or a
 * webhook whose signature is checked on the raw text, and needs a 400 answer listing every
 * problem. Text that isn't JSON, or JSON that isn't an object, gives one error with
 * `field: ''`. Otherwise each validator gets its raw value, `undefined` when absent, and
 * returns the typed one. Only the declared fields come back; extra keys are dropped.
 *
 * ```text
 *  body text
 *    │ parseJSON
 *    ▼
 *  ⟨ JSON? ⟩─────no────▶ ╭─────────────────────────────────────────────╮
 *    │ yes               │ Invalid([{ field: '', 'Send valid JSON' }]) │
 *    ▼                   ╰─────────────────────────────────────────────╯
 *  ⟨ an object? ⟩──no──▶ ╭────────────────────────────────────────────────╮
 *    │ yes               │ Invalid([{ field: '', 'Send a JSON object' }]) │
 *    ▼                   ╰────────────────────────────────────────────────╯
 *  ┌──────────────────────────┐ some fail ╭───────────────────────────────╮
 *  │ run every field's check  │──────────▶│ Invalid([{ field, errors }…]) │
 *  └────────────┬─────────────┘           ╰───────────────────────────────╯
 *               │ all pass
 *               ▼
 *  ╭─────────────────────────────╮
 *  │ Valid(declared fields only) │
 *  ╰─────────────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * import { isString } from '@ontologyio/receta/predicate'
 * import { invalid, valid } from '@ontologyio/receta/validation'
 *
 * const event = (value: unknown) => (isString(value) ? valid(value) : invalid('Say which event this is'))
 * const id = (value: unknown) => (isString(value) && value !== '' ? valid(value) : invalid('Send the object id'))
 *
 * validateJsonBody('{"event":"invoice.paid","id":"in_1","extra":1}', { event, id })
 * // => Valid({ event: 'invoice.paid', id: 'in_1' })
 *
 * validateJsonBody('{"event":42}', { event, id })
 * // => Invalid([
 * //   { field: 'event', errors: ['Say which event this is'] },
 * //   { field: 'id', errors: ['Send the object id'] },
 * // ])
 *
 * R.pipe('{oops', validateJsonBody({ event, id }))
 * // => Invalid([{ field: '', errors: ['Send valid JSON'] }])
 * ```
 *
 * @tags json, body, request, payload, parse, webhook, api, decode, 400, schema
 * @see parseJSON - @ontologyio/receta/result, the parse that can't throw
 * @see validatePayload - the same checks on a value that is already parsed
 */
export function validateJsonBody<T>(text: string, fields: ValidateJsonBodyFields<T>): Validation<T, FieldError<string>>
export function validateJsonBody<T>(fields: ValidateJsonBodyFields<T>): (text: string) => Validation<T, FieldError<string>>
export function validateJsonBody(...args: unknown[]): unknown {
  return R.purry(validateJsonBodyImplementation, args)
}

const validateJsonBodyImplementation = <T>(text: string, fields: ValidateJsonBodyFields<T>): Validation<T, FieldError<string>> =>
  R.pipe(
    parseJSON<unknown>(text),
    matchResult<unknown, SyntaxError, Validation<T, FieldError<string>>>({
      onOk: (body) => (isObject(body) ? checkFields(body, fields) : bodyError('Send a JSON object')),
      onErr: () => bodyError('Send valid JSON'),
    }),
  )
