import * as R from 'remeda'
import { fromNullable as optionFromNullable, partition } from '@ontologyio/receta/option'
import { fromNullable, map, type Result } from '@ontologyio/receta/result'

export type ParseContentTypeError = {
  readonly code: 'INVALID_CONTENT_TYPE'
  readonly input: string
  readonly message: string
}

export type ParseContentTypeMedia = {
  /** `type/subtype`, lowercased, such as `application/json`. */
  readonly mediaType: string
  readonly type: string
  readonly subtype: string
  /** Parameter names lowercased, values unquoted and otherwise as sent. */
  readonly params: Readonly<Record<string, string>>
}

const MEDIA_TYPE = /^\s*([\w.+-]+)\/([\w.+-]+)\s*$/
const PARAM = /^\s*([^=\s]+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^\s"]*))\s*$/

const parseParam = (param: string) => optionFromNullable(PARAM.exec(param))

/**
 * Parses a `Content-Type` header such as `application/json; charset=utf-8` into its media type and parameters.
 *
 * Use when: an HTTP handler, a webhook receiver or an upload step must decide how to read a
 * body, check for `application/json` before parsing, or find a multipart `boundary` or a
 * `charset`. Type and subtype are lowercased, as they are case-insensitive; quoted
 * parameter values are unquoted, and malformed parameters are skipped. A header without
 * `type/subtype` is an `Err`, which usually means 415 Unsupported Media Type.
 *
 * @example
 * ```ts
 * parseContentType('Application/JSON; charset=UTF-8')
 * // => Ok({ mediaType: 'application/json', type: 'application', subtype: 'json', params: { charset: 'UTF-8' } })
 *
 * parseContentType('multipart/form-data; boundary="----x1"; junk')
 * // => Ok({ mediaType: 'multipart/form-data', type: 'multipart', subtype: 'form-data', params: { boundary: '----x1' } })
 *
 * parseContentType('json')
 * // => Err({ code: 'INVALID_CONTENT_TYPE', input: 'json', message: 'Expected a media type such as application/json, got "json"' })
 * ```
 *
 * @tags content type, mime, media type, header, charset, boundary, multipart, http
 * @see partition - @ontologyio/receta/option, keeps the parameters that parsed
 */
export function parseContentType(
  header: string,
): Result<ParseContentTypeMedia, ParseContentTypeError> {
  const [media = '', ...rawParams] = R.split(header, ';')
  const [params] = partition(R.map(rawParams, parseParam))
  return R.pipe(
    fromNullable(MEDIA_TYPE.exec(media), {
      code: 'INVALID_CONTENT_TYPE',
      input: header,
      message: `Expected a media type such as application/json, got "${header}"`,
    } satisfies ParseContentTypeError),
    map(([, rawType = '', rawSubtype = '']) => {
      const type = R.toLowerCase(rawType)
      const subtype = R.toLowerCase(rawSubtype)
      return {
        mediaType: `${type}/${subtype}`,
        type,
        subtype,
        params: R.fromEntries(
          R.map(params, ([, name = '', quoted, bare = '']): [string, string] => [
            name.toLowerCase(),
            quoted === undefined ? bare : quoted.replace(/\\(.)/g, '$1'),
          ]),
        ),
      }
    }),
  )
}
