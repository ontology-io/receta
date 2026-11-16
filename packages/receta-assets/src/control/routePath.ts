import * as R from 'remeda'
import { collect, flatten, fromNullable, isSome, map, none, some, tryCatch, type Option } from '@ontologyio/receta/option'
import { eq, startsWith } from '@ontologyio/receta/predicate'

export type RoutePathMatch<K extends string> = {
  readonly route: K
  readonly params: Readonly<Record<string, string>>
}

type Captured = readonly (readonly [string, string])[]

const segmentsOf = (path: string): readonly string[] =>
  R.pipe(path.split(/[?#]/)[0] ?? '', R.split('/'), R.filter(R.isTruthy))

const decode = (text: string): Option<string> => tryCatch(() => decodeURIComponent(text))

const matchSegment = ([wanted, got]: readonly [string, string]): Option<Captured> => {
  if (startsWith(':')(wanted)) return R.pipe(decode(got), map((value): Captured => [[wanted.slice(1), value]]))
  return eq(wanted)(got) ? some([]) : none()
}

/** The same matching as the `matchPath` asset, kept here so this file stands alone. */
const matchOne = (path: string, pattern: string): Option<Readonly<Record<string, string>>> => {
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

/**
 * Finds the first route in a table whose pattern matches a URL path, with the parameters it captured.
 *
 * Use when: dispatching requests in a small server, a worker or an edge function, or choosing
 * a screen in a client, without a router library. Routes are tried in the table's order, so list
 * `/users/new` before `/users/:id`. Patterns use `:name` for one segment and a final `*` for the
 * rest; values are URL-decoded, and the query, the fragment and extra slashes are ignored.
 * `None` when no route matches, which is the 404.
 *
 * @example
 * ```ts
 * import { match } from '@ontologyio/receta/option'
 *
 * const routes = {
 *   home: '/',
 *   newUser: '/users/new',
 *   user: '/users/:id',
 *   asset: '/static/*',
 * }
 *
 * routePath('/users/new', routes)
 * // => Some({ route: 'newUser', params: {} })
 *
 * routePath('/users/42?tab=posts', routes)
 * // => Some({ route: 'user', params: { id: '42' } })
 *
 * R.pipe(
 *   '/nope',
 *   routePath(routes),
 *   match({ onSome: ({ route }) => route, onNone: () => 'notFound' }),
 * )
 * // => 'notFound'
 * ```
 *
 * @tags router, route, url, path, dispatch, params, 404, request, navigation
 * @see matchPath - one pattern against one path
 * @see dispatchCommand - dispatch by an exact name instead of a pattern
 */
export function routePath<K extends string>(
  path: string,
  routes: Readonly<Record<K, string>>,
): Option<RoutePathMatch<K>>
export function routePath<K extends string>(
  routes: Readonly<Record<K, string>>,
): (path: string) => Option<RoutePathMatch<K>>
export function routePath(...args: unknown[]): unknown {
  return R.purry(routePathImplementation, args)
}

const routePathImplementation = <K extends string>(
  path: string,
  routes: Readonly<Record<K, string>>,
): Option<RoutePathMatch<K>> =>
  R.pipe(
    R.entries(routes as Readonly<Record<string, string>>),
    // Remeda's pipe is lazy here: matching stops at the first route that fits.
    R.map(([route, pattern]) => map(matchOne(path, pattern), (params) => ({ route: route as K, params }))),
    R.find((matched) => isSome(matched)),
    fromNullable,
    flatten(),
  )
