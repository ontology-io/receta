import * as R from 'remeda'
import { collect, map, none, some, tryCatch, type Option } from '@ontologyio/receta/option'
import { eq, startsWith } from '@ontologyio/receta/predicate'

type Captured = readonly (readonly [string, string])[]

/** The path's segments, without the query, the fragment, or the empty parts of `//` and a trailing `/`. */
const segmentsOf = (path: string): readonly string[] =>
  R.pipe(path.split(/[?#]/)[0] ?? '', R.split('/'), R.filter(R.isTruthy))

/** A malformed escape such as `%E0%A4%A` throws in decodeURIComponent, so it counts as no match. */
const decode = (text: string): Option<string> => tryCatch(() => decodeURIComponent(text))

const matchSegment = ([wanted, got]: readonly [string, string]): Option<Captured> => {
  if (startsWith(':')(wanted)) return R.pipe(decode(got), map((value): Captured => [[wanted.slice(1), value]]))
  return eq(wanted)(got) ? some([]) : none()
}

/**
 * Matches a URL path against a pattern such as `/users/:id`, returning the named parts it captured.
 *
 * Use when: a server, a service worker or a client-side router must tell whether a path belongs
 * to a route and read its parameters, without pulling in a router. `:name` captures one segment
 * and a final `*` captures the rest, under the key `*`. Captured values are URL-decoded. The
 * query and the fragment are ignored, and so are repeated and trailing slashes. Literal segments
 * compare exactly, case included. `None` when the path doesn't fit or holds a malformed escape.
 *
 * ```text
 *  pattern   /users  /:id  /files  /*
 *  path      /users  /42   /files  /2024/report%20final.pdf
 *            ──────  ────  ──────  ─────────────────────────
 *            equal   id    equal   * = '2024/report final.pdf'
 *
 *  result    Some({ id: '42', '*': '2024/report final.pdf' })
 * ```
 *
 * @example
 * ```ts
 * matchPath('/users/42/files/2024/report%20final.pdf', '/users/:id/files/*')
 * // => Some({ id: '42', '*': '2024/report final.pdf' })
 *
 * matchPath('/users/42/?tab=posts', '/users/:id')
 * // => Some({ id: '42' })
 *
 * matchPath('/users/42/posts', '/users/:id')
 * // => None
 *
 * R.pipe('/teams/a%2Fb/members', matchPath('/teams/:team/members'))
 * // => Some({ team: 'a/b' })
 * ```
 *
 * @tags route, path, url, pattern, params, router, match, wildcard, slug
 * @see routePath - finds which of several routes a path belongs to
 * @see collect - @ontologyio/receta/option, every segment must match for a `Some`
 */
export function matchPath(path: string, pattern: string): Option<Readonly<Record<string, string>>>
export function matchPath(pattern: string): (path: string) => Option<Readonly<Record<string, string>>>
export function matchPath(...args: unknown[]): unknown {
  return R.purry(matchPathImplementation, args)
}

const matchPathImplementation = (path: string, pattern: string): Option<Readonly<Record<string, string>>> => {
  const wanted = segmentsOf(pattern)
  const got = segmentsOf(path)
  const hasRest = eq('*')(R.last(wanted) ?? '')
  const fixed: readonly string[] = hasRest ? R.dropLast(wanted, 1) : wanted
  const fits = hasRest ? got.length >= fixed.length : got.length === fixed.length
  if (!fits) return none()
  const rest: Option<Captured> = hasRest
    ? R.pipe(decode(R.join(R.drop(got, fixed.length), '/')), map((value): Captured => [['*', value]]))
    : some([])
  const pairs = R.zip(fixed, got)
  const segments = R.map(pairs, matchSegment)
  return R.pipe(
    collect([...segments, rest]),
    map((parts) => R.fromEntries(R.flat(parts))),
  )
}
