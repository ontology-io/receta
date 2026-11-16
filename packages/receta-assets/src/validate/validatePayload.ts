import * as R from 'remeda'
import { isObject } from '@ontologyio/receta/predicate'
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
export type ValidatePayloadFields<T> = { readonly [K in keyof T]: Validator<unknown, T[K], string> }

const checkFields = <T>(record: Record<string, unknown>, fields: ValidatePayloadFields<T>): Validation<T, FieldError<string>> =>
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
 * Turns an unknown value, such as a parsed request body, into a typed object, field by field.
 *
 * Use when: a handler gets `req.body`, a queue message or a webhook payload as `unknown`, and
 * each field needs its own check and type before use. Each validator gets the raw value,
 * `undefined` when the key is absent, and returns the typed value, so it can trim or convert.
 * Only the declared fields come back; extra keys are dropped, so a stray `isAdmin` can't
 * slip into an update. A value that isn't a plain object gives one error with `field: ''`.
 *
 * @example
 * ```ts
 * import { isInteger, isString } from '@ontologyio/receta/predicate'
 * import { invalid, valid } from '@ontologyio/receta/validation'
 *
 * const text = (value: unknown) => (isString(value) && value.trim() !== '' ? valid(value.trim()) : invalid('Enter some text'))
 * const quantity = (value: unknown) => (isInteger(value) && value > 0 ? valid(value) : invalid('Use a whole number above 0'))
 *
 * validatePayload({ sku: ' A-1 ', quantity: 2, isAdmin: true }, { sku: text, quantity })
 * // => Valid({ sku: 'A-1', quantity: 2 })
 *
 * validatePayload({ quantity: 0 }, { sku: text, quantity })
 * // => Invalid([
 * //   { field: 'sku', errors: ['Enter some text'] },
 * //   { field: 'quantity', errors: ['Use a whole number above 0'] },
 * // ])
 *
 * R.pipe([1, 2], validatePayload({ sku: text, quantity }))
 * // => Invalid([{ field: '', errors: ['Send an object'] }])
 * ```
 *
 * @tags payload, body, request, unknown, decode, schema, api, webhook, input, typed
 * @see schema - @ontologyio/receta/validation, for values that already have their type
 * @see validateJsonBody - the same, starting from the raw JSON text
 */
export function validatePayload<T>(payload: unknown, fields: ValidatePayloadFields<T>): Validation<T, FieldError<string>>
export function validatePayload<T>(fields: ValidatePayloadFields<T>): (payload: unknown) => Validation<T, FieldError<string>>
export function validatePayload(...args: unknown[]): unknown {
  return R.purry(validatePayloadImplementation, args)
}

const validatePayloadImplementation = <T>(payload: unknown, fields: ValidatePayloadFields<T>): Validation<T, FieldError<string>> =>
  isObject(payload) ? checkFields(payload, fields) : invalid({ field: '', errors: ['Send an object'] })
