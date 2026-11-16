import * as R from 'remeda'
import { eq, or, startsWith, type Predicate } from '@ontologyio/receta/predicate'

/** `/admin/` and `/admin` mean the same folder; `/` stays `/`. */
const withoutTrailingSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/**
 * Builds a predicate for paths at or below any of the given folders, matching whole segments only.
 *
 * Use when: deciding which routes a middleware guards, which files a tool touches, or which
 * storage keys belong to a tenant, where `/admin` must cover `/admin/users` but not
 * `/administrator`. Trailing slashes are ignored on both sides. Matching is case-sensitive, as
 * URLs and most file systems are. The prefix `/` covers every absolute path.
 *
 * @example
 * ```ts
 * const routes = ['/admin', '/admin/users', '/administrator', '/api/v1/admin', '/docs/']
 *
 * R.filter(routes, isUnderPath(['/admin', '/docs']))
 * // => ['/admin', '/admin/users', '/docs/']
 *
 * R.filter(['tenants/acme/a.png', 'tenants/acme-old/b.png'], isUnderPath(['tenants/acme/']))
 * // => ['tenants/acme/a.png']
 *
 * R.filter(routes, isUnderPath(['/'])).length
 * // => 5
 * ```
 *
 * @tags path, route, prefix, folder, directory, middleware, guard, url, s3, filter
 * @see startsWith - @ontologyio/receta/predicate, a raw prefix that can stop mid-segment
 */
export function isUnderPath(folders: readonly string[]): Predicate<string> {
  const under = R.map(folders, (folder) => {
    const base = withoutTrailingSlash(folder)
    return base === '/' ? startsWith('/') : or(eq(base), startsWith(`${base}/`))
  })
  const matchesAny = or(...under)
  return (path) => matchesAny(withoutTrailingSlash(path))
}
