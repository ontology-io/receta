// Fails when a link between docs pages leads nowhere. Run `bun run check:links`.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Glob } from 'bun'
import * as R from 'remeda'
import { brokenLinks } from '../src/lib/docs/links'

const CONTENT = join(import.meta.dir, '../content/docs')

const paths = await Array.fromAsync(new Glob('**/*.mdx').scan({ cwd: CONTENT }))
const pages = new Set(paths)
const broken = R.flat(
  await Promise.all(
    R.map(paths, async (page) => brokenLinks(page, await readFile(join(CONTENT, page), 'utf8'), pages)),
  ),
)

for (const { page, target } of broken) console.log(`content/docs/${page}  ${target}`)
console.log(`\n${paths.length} pages checked, ${broken.length} broken links.`)
process.exitCode = broken.length > 0 ? 1 : 0
