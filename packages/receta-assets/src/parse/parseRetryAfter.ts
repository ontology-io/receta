import * as R from 'remeda'
import { filter, fromNullable, map, match, some, type Option } from '@ontologyio/receta/option'
import { isFinite } from '@ontologyio/receta/number'
import { matches } from '@ontologyio/receta/predicate'

const SECONDS = /^\d+$/
/** A day or month name and a clock time: all three HTTP date formats have both. */
const looksLikeHttpDate = matches(/[A-Za-z]{3}.*\d{2}:\d{2}:\d{2}/)

/**
 * Reads a `Retry-After` header, in seconds or as an HTTP date, into how many milliseconds to wait.
 *
 * Use when: an API answered 429 Too Many Requests or 503 Service Unavailable and the client
 * should wait as long as the server asked before trying again. `now` is the current time in
 * milliseconds, such as `Date.now()`, passed in so the function stays pure. A date in the
 * past means no wait, `Some(0)`. A missing or unreadable header is None, so fall back to your
 * own backoff with `unwrapOr`.
 *
 * @example
 * ```ts
 * const now = Date.parse('Wed, 21 Oct 2015 07:27:30 GMT')
 *
 * parseRetryAfter('120', now)
 * // => Some(120000)
 *
 * parseRetryAfter('Wed, 21 Oct 2015 07:28:00 GMT', now)
 * // => Some(30000)
 *
 * R.pipe('Wed, 21 Oct 2015 07:00:00 GMT', parseRetryAfter(now))
 * // => Some(0)
 *
 * parseRetryAfter('soon', now)
 * // => None
 *
 * parseRetryAfter('12.5', now)
 * // => None
 * ```
 *
 * @tags retry after, rate limit, 429, 503, backoff, http, header, throttle
 * @see match - @ontologyio/receta/option, tries the date form when the seconds form is None
 * @see retryWithTimeout - retries a task, with a wait you can take from this
 */
export function parseRetryAfter(header: string | null | undefined, now: number): Option<number>
export function parseRetryAfter(now: number): (header: string | null | undefined) => Option<number>
export function parseRetryAfter(...args: unknown[]): unknown {
  return R.purry(parseRetryAfterImplementation, args)
}

const parseRetryAfterImplementation = (
  header: string | null | undefined,
  now: number,
): Option<number> => {
  const text = R.pipe(fromNullable(header), map((value) => value.trim()))
  const fromSeconds = R.pipe(
    text,
    filter((value) => SECONDS.test(value)),
    map((seconds) => Number(seconds) * 1000),
  )
  const fromDate = (): Option<number> =>
    R.pipe(
      text,
      // Date.parse alone reads '12.5' and '-5' as dates, so only date-shaped text gets here.
      filter(looksLikeHttpDate),
      map((date) => Date.parse(date)),
      filter(isFinite),
      map((at) => Math.max(0, at - now)),
    )
  return match(fromSeconds, { onSome: (wait) => some(wait), onNone: fromDate })
}
