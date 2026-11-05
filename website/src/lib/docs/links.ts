// Finds links between docs pages that lead nowhere. Pure, so scripts/check-links.ts only
// reads files. Start at brokenLinks.
import * as R from 'remeda'

export type BrokenLink = { readonly page: string; readonly target: string }

const CODE = /```[\s\S]*?```|`[^`\n]*`/g
const LINK = /\]\(([^)\s]+)\)/g
const EXTERNAL = /^([a-z]+:|#)/

/** Files served from public/, which aren't pages but are fair to link to. */
const isPublicFile = (target: string): boolean => /^\/[\w-]+\.txt$/.test(target)

const withoutFragment = (target: string): string => target.split('#')[0] ?? ''

/** Resolves ./ and ../ against a page's folder, the way a browser would. */
const resolve = (page: string, target: string): string =>
  R.reduce(
    target.split('/'),
    (folders: readonly string[], part) => {
      if (part === '.' || part === '') return folders
      return part === '..' ? R.dropLast(folders, 1) : R.concat(folders, [part])
    },
    R.dropLast(page.split('/'), 1),
  ).join('/')

/** The page files an internal link could mean. */
const candidates = (page: string, target: string): readonly string[] => {
  if (target.startsWith('/docs')) {
    const route = target.replace(/^\/docs\/?/, '')
    return route === '' ? ['index.mdx'] : [`${route}.mdx`, `${route}/index.mdx`]
  }
  const resolved = resolve(page, target)
  return resolved.endsWith('.mdx') ? [resolved] : [`${resolved}.mdx`, `${resolved}/index.mdx`]
}

const linksIn = (text: string): readonly string[] =>
  R.map([...text.replace(CODE, '').matchAll(LINK)], ([, target]) => target ?? '')

const isInternal = (target: string): boolean => !EXTERNAL.test(target) && !isPublicFile(target)

/** Every internal link on a page that doesn't reach another page. */
export const brokenLinks = (
  page: string,
  text: string,
  pages: ReadonlySet<string>,
): readonly BrokenLink[] =>
  R.pipe(
    linksIn(text),
    R.filter(isInternal),
    R.map(withoutFragment),
    R.filter((target) => target !== ''),
    R.filter((target) => !candidates(page, target).some((path) => pages.has(path))),
    R.map((target) => ({ page, target })),
  )
