import * as R from 'remeda'
import { fromNullable as optionFromNullable, match as matchOption } from '@ontologyio/receta/option'
import { not } from '@ontologyio/receta/predicate'
import { collect, err, flatMap, fromNullable, map, ok, type Result } from '@ontologyio/receta/result'
import { isBlank } from '@ontologyio/receta/string'

export type ParseKeyValuePairsError = {
  readonly code: 'MISSING_EQUALS' | 'EMPTY_KEY' | 'DUPLICATE_KEY'
  /** The pair that broke the rule. */
  readonly input: string
  readonly message: string
}

type Pair = readonly [key: string, value: string]

const PAIR = /^([^=]*)=(.*)$/s

const parsePair = (pair: string): Result<Pair, ParseKeyValuePairsError> =>
  R.pipe(
    fromNullable(PAIR.exec(pair), {
      code: 'MISSING_EQUALS',
      input: pair,
      message: `Expected key=value, got "${pair.trim()}"`,
    } satisfies ParseKeyValuePairsError),
    map(([, key = '', value = '']): Pair => [key.trim(), value.trim()]),
    flatMap(([key, value]) =>
      isBlank(key)
        ? err<ParseKeyValuePairsError>({
            code: 'EMPTY_KEY',
            input: pair,
            message: `Expected a key before "=", got "${pair.trim()}"`,
          })
        : ok<Pair>([key, value]),
    ),
  )

const refuseDuplicates = (
  pairs: readonly Pair[],
): Result<Readonly<Record<string, string>>, ParseKeyValuePairsError> =>
  R.pipe(
    pairs,
    R.groupBy(([key]) => key),
    R.values(),
    R.find(R.hasAtLeast(2)),
    optionFromNullable,
    matchOption({
      onSome: ([[key]]): Result<Readonly<Record<string, string>>, ParseKeyValuePairsError> =>
        err({ code: 'DUPLICATE_KEY', input: key, message: `Key "${key}" appears more than once` }),
      onNone: () => ok(R.fromEntries(pairs)),
    }),
  )

/**
 * Parses `key=value` pairs joined by a separator, such as `ssl=true;pool=5`, into a record.
 *
 * Use when: a single environment variable, connection-string option, header or CLI flag
 * packs several settings, like `OTEL_RESOURCE_ATTRIBUTES=service=api,env=prod`. Keys and
 * values are trimmed, empty segments are skipped, and a value may contain `=`. A segment
 * without `=`, an empty key or a key given twice is an `Err` naming the segment. Values stay
 * strings; parse them further where their type is known.
 *
 * @example
 * ```ts
 * parseKeyValuePairs('ssl=true; pool = 5; token=a=b;', ';')
 * // => Ok({ ssl: 'true', pool: '5', token: 'a=b' })
 *
 * R.pipe('service=api,env=prod', parseKeyValuePairs(','))
 * // => Ok({ service: 'api', env: 'prod' })
 *
 * parseKeyValuePairs('ssl=true;verbose', ';')
 * // => Err({ code: 'MISSING_EQUALS', input: 'verbose', message: 'Expected key=value, got "verbose"' })
 *
 * parseKeyValuePairs('env=dev,env=prod', ',')
 * // => Err({ code: 'DUPLICATE_KEY', input: 'env', message: 'Key "env" appears more than once' })
 * ```
 *
 * @tags key value, pairs, options, env, config, connection string, attributes, dictionary
 * @see parseQueryString - URL-encoded pairs, where repeated keys are allowed
 * @see parseCookieHeader - the lenient reading of a Cookie header
 * @see collect - @ontologyio/receta/result, stops at the first bad pair
 */
export function parseKeyValuePairs(
  input: string,
  separator: string,
): Result<Readonly<Record<string, string>>, ParseKeyValuePairsError>
export function parseKeyValuePairs(
  separator: string,
): (input: string) => Result<Readonly<Record<string, string>>, ParseKeyValuePairsError>
export function parseKeyValuePairs(...args: unknown[]): unknown {
  return R.purry(parseKeyValuePairsImplementation, args)
}

const parseKeyValuePairsImplementation = (
  input: string,
  separator: string,
): Result<Readonly<Record<string, string>>, ParseKeyValuePairsError> =>
  R.pipe(
    input,
    R.split(separator),
    R.filter(not(isBlank)),
    R.map(parsePair),
    (results) => collect(results),
    flatMap(refuseDuplicates),
  )
