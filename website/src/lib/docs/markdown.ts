// Turns docs pages into plain text for agents: one markdown file per page, plus the
// llms.txt index and the single-file llms-full.txt. Pure, so scripts/export-markdown.ts
// only moves files. Start at parsePage.
import * as R from 'remeda'

export type MarkdownPage = {
  /** Path relative to content/docs, such as result/patterns.mdx. */
  readonly path: string
  readonly title: string
  readonly description: string
  readonly body: string
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/

const frontmatterValue = (frontmatter: string, key: string): string => {
  const line = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]?.trim() ?? ''
  return line.replace(/^"|"$/g, '').replaceAll('\\"', '"')
}

const FENCES = /(^```[\s\S]*?^```[ \t]*$)/gm
const FIGURE_TAG = /^<\/?[A-Z]\w*(?:\s[^\n]*)?>$/gm

const withoutFigureTags = (text: string): string =>
  text.replace(FIGURE_TAG, '').replace(/\n{3,}/g, '\n\n')

/**
 * A figure is drawn on the site and is words everywhere else, so its tags go and its
 * children stay. Code fences are left alone: their JSX is an example.
 */
const keepFigureWords = (text: string): string =>
  R.pipe(
    text.split(FENCES),
    R.map((part, index) => (index % 2 === 1 ? part : withoutFigureTags(part))),
    R.join(''),
  )

/** Reads a page's title and description, and keeps the text without MDX comments or figures. */
export const parsePage = (path: string, text: string): MarkdownPage => {
  const frontmatter = FRONTMATTER.exec(text)?.[1] ?? ''
  return {
    path,
    title: frontmatterValue(frontmatter, 'title'),
    description: frontmatterValue(frontmatter, 'description'),
    body: keepFigureWords(text.replace(FRONTMATTER, '').replace(/\{\/\*[\s\S]*?\*\/\}\n*/g, '')).trim(),
  }
}

/** The address of a page, with no extension. */
export const pageRoute = (path: string): string => {
  const route = path.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '')
  return route === '' ? '/docs' : `/docs/${route}`
}

/** A page as a standalone markdown file. */
export const pageMarkdown = ({ title, description, body }: MarkdownPage): string =>
  R.pipe(
    [`# ${title}`, description, body],
    R.filter(Boolean),
    R.join('\n\n'),
    (text) => `${text}\n`,
  )

const GROUPS = [
  ['Get started', (path: string) => !path.includes('/')],
  ['Reference', (path: string) => path.startsWith('reference/')],
  ['Guides', () => true],
] as const

const groupOf = ({ path }: MarkdownPage): string =>
  R.find(GROUPS, ([, matches]) => matches(path))?.[0] ?? ''

const indexLine = (siteUrl: string, page: MarkdownPage): string => {
  const link = `[${page.title}](${siteUrl}${pageRoute(page.path)}.md)`
  return page.description ? `- ${link}: ${page.description}` : `- ${link}`
}

const contextTitle = ({ path, title }: MarkdownPage): MarkdownPage['title'] => {
  const [area] = path.split('/')
  return path.includes('/') && !path.startsWith('reference/') ? `${area}: ${title}` : title
}

/** The llms.txt index: what Receta is, then every page with a one-line summary. */
export const llmsIndex = (siteUrl: string, summary: string, pages: readonly MarkdownPage[]): string =>
  R.pipe(
    GROUPS,
    R.map(([group]) => {
      const inGroup = R.filter(pages, (page) => groupOf(page) === group)
      const lines = R.map(inGroup, (page) =>
        indexLine(siteUrl, { ...page, title: contextTitle(page) }),
      )
      return `## ${group}\n\n${R.join(lines, '\n')}`
    }),
    (sections) => R.join(['# Receta', `> ${summary}`, ...sections], '\n\n'),
    (text) => `${text}\n`,
  )

/** Every page in one file, for an agent that should read it all first. */
export const llmsFull = (pages: readonly MarkdownPage[]): string =>
  R.pipe(pages, R.map(pageMarkdown), R.join('\n---\n\n'))
