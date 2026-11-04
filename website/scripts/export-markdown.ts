// Writes the docs as plain text into public/, so agents can read them: a .md beside each
// page's address, plus llms.txt and llms-full.txt. Runs before every build, after the
// reference is generated. Start at exportMarkdown.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { Glob } from 'bun'
import * as R from 'remeda'
import { SITE_URL } from '../src/content/home.content'
import { docsContent } from '../src/content/docs.content'
import { llmsFull, llmsIndex, pageMarkdown, pageRoute, parsePage } from '../src/lib/docs/markdown'

const WEBSITE = join(import.meta.dir, '..')
const CONTENT = join(WEBSITE, 'content/docs')
const PUBLIC = join(WEBSITE, 'public')

/** A folder's overview comes before the pages inside it. */
const readingOrder = (path: string): string => path.replace(/index\.mdx$/, '')

const readPages = async () => {
  const paths = await Array.fromAsync(new Glob('**/*.mdx').scan({ cwd: CONTENT }))
  return R.pipe(
    await Promise.all(
      R.map(R.sortBy(paths, readingOrder), async (path) =>
        parsePage(path, await readFile(join(CONTENT, path), 'utf8')),
      ),
    ),
  )
}

const writeInPublic = async (route: string, text: string): Promise<void> => {
  const path = join(PUBLIC, route)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text)
}

const exportMarkdown = async (): Promise<void> => {
  const pages = await readPages()
  await rm(join(PUBLIC, 'docs'), { recursive: true, force: true })
  await rm(join(PUBLIC, 'docs.md'), { force: true })
  for (const page of pages) await writeInPublic(`${pageRoute(page.path)}.md`, pageMarkdown(page))
  await writeInPublic('llms.txt', llmsIndex(SITE_URL, docsContent.description, pages))
  await writeInPublic('llms-full.txt', llmsFull(pages))
}

await exportMarkdown()
