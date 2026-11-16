import * as R from 'remeda'
import { err, flatMap, mapErr, ok, parseJSON, type Result } from '@ontologyio/receta/result'

export type ParseJsonObjectError = {
  readonly code: 'INVALID_JSON' | 'NOT_AN_OBJECT'
  readonly input: string
  readonly message: string
}

const describe = (value: unknown): string =>
  R.isArray(value) ? 'an array' : value === null ? 'null' : `a ${typeof value}`

/**
 * Parses JSON text that must hold an object, such as a settings blob, a webhook body or a cached record.
 *
 * Use when: the code is about to read fields from parsed JSON, where an array, a number or
 * `null` would slip past `JSON.parse` and fail later as "cannot read property". Broken JSON
 * is `INVALID_JSON`, with the parser's reason in the message; valid JSON that isn't an object
 * is `NOT_AN_OBJECT`. The fields themselves stay `unknown`; check them next.
 *
 * @example
 * ```ts
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * parseJsonObject('{"theme":"dark","fontSize":14}')
 * // => Ok({ theme: 'dark', fontSize: 14 })
 *
 * parseJsonObject('[1, 2]')
 * // => Err({ code: 'NOT_AN_OBJECT', input: '[1, 2]', message: 'Expected a JSON object, got an array' })
 *
 * R.pipe(parseJsonObject('{theme: dark}'), mapErr((error) => error.code))
 * // => Err('INVALID_JSON')
 * ```
 *
 * @tags json, object, parse, payload, webhook, settings, localstorage, body
 * @see parseJsonAs - also checks each field's type against a schema
 * @see parseJSON - @ontologyio/receta/result, the parse underneath
 */
export function parseJsonObject(input: string): Result<Record<string, unknown>, ParseJsonObjectError> {
  return R.pipe(
    parseJSON<unknown>(input),
    mapErr((error): ParseJsonObjectError => ({
      code: 'INVALID_JSON',
      input,
      message: `Not valid JSON: ${error.message}`,
    })),
    flatMap((value) =>
      R.isPlainObject(value)
        ? ok(value)
        : err<ParseJsonObjectError>({
            code: 'NOT_AN_OBJECT',
            input,
            message: `Expected a JSON object, got ${describe(value)}`,
          }),
    ),
  )
}
