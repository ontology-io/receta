import * as R from 'remeda'
import { not } from '@ontologyio/receta/predicate'
import { collect, flatMap, map, tryCatch, type Result } from '@ontologyio/receta/result'
import { isEmpty } from '@ontologyio/receta/string'

export type ParseQueryStringError = {
  readonly code: 'MALFORMED_ESCAPE'
  /** The key or value whose percent-escape is broken. */
  readonly input: string
  readonly message: string
}

type Pair = readonly [key: string, value: string]

const decode = (part: string): Result<string, ParseQueryStringError> =>
  tryCatch(
    () => decodeURIComponent(part.replaceAll('+', ' ')),
    (): ParseQueryStringError => ({
      code: 'MALFORMED_ESCAPE',
      input: part,
      message: `"${part}" has a broken percent-escape`,
    }),
  )

const decodePair = (pair: string): Result<Pair, ParseQueryStringError> => {
  const [rawKey = '', ...rest] = R.split(pair, '=')
  return R.pipe(
    decode(rawKey),
    flatMap((key) => map(decode(R.join(rest, '=')), (value): Pair => [key, value])),
  )
}

/**
 * Parses a URL query string such as `?tag=a&tag=b&q=red+shoes` into a record of value lists.
 *
 * Use when: a query string, a form-urlencoded body or a hash fragment needs reading
 * without a URL object, and repeated keys such as `tag=a&tag=b` must all survive. Every key
 * maps to a list, so its type never depends on how many times it appeared. `+` is a space,
 * a key without `=` gets `''`, and a broken escape like `%E0%A4%A` is an `Err` instead of
 * the exception `decodeURIComponent` throws.
 *
 * ```text
 *  STEP                    DATA AFTER IT
 *  ──────────────────────  ──────────────────────────────────────────────
 *  input                   '?tag=a&tag=b&q=red+shoes&&flag'
 *  drop '?', split '&'     ['tag=a', 'tag=b', 'q=red+shoes', '', 'flag']
 *  R.filter(not(isEmpty))  ['tag=a', 'tag=b', 'q=red+shoes', 'flag']
 *  R.map(decodePair)       [Ok(['tag','a']), …, Ok(['q','red shoes']), …]
 *  collect                 Ok([['tag','a'], …]), or the first Err
 *  R.groupBy(key)          Ok({ tag: [a, b], q: ['red shoes'], flag: [''] })
 * ```
 *
 * @example
 * ```ts
 * parseQueryString('?tag=a&tag=b&q=red+shoes&&flag')
 * // => Ok({ tag: ['a', 'b'], q: ['red shoes'], flag: [''] })
 *
 * parseQueryString('')
 * // => Ok({})
 *
 * parseQueryString('q=%E0%A4%A')
 * // => Err({ code: 'MALFORMED_ESCAPE', input: '%E0%A4%A', message: '"%E0%A4%A" has a broken percent-escape' })
 * ```
 *
 * @tags query string, url, search params, querystring, form, urlencoded, decode
 * @see parseKeyValuePairs - plain pairs with no escapes, where a repeated key is an error
 * @see tryCatch - @ontologyio/receta/result, turns the decode exception into an Err
 */
export function parseQueryString(
  input: string,
): Result<Readonly<Record<string, readonly string[]>>, ParseQueryStringError> {
  return R.pipe(
    R.split(input.replace(/^[?#]/, ''), '&'),
    R.filter(not(isEmpty)),
    R.map(decodePair),
    (results) => collect(results),
    map((pairs) =>
      R.pipe(
        pairs,
        R.groupBy(([key]) => key),
        R.mapValues((group) => R.map(group, ([, value]) => value)),
      ),
    ),
  )
}
