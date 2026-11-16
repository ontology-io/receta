// Packs the receta-assets catalog, every asset's file and the authoring rules into one JSON
// module the Worker imports, so answering an agent never needs a second request. Then copies
// the pages' fonts out of @fontsource into public/fonts, so visitors fetch them from us and
// never from Google. Runs before dev, test, typecheck and deploy; both outputs are generated
// and not committed.
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import { parseJSON, unwrap } from '@ontologyio/receta/result'
import * as R from 'remeda'
import type { Bundle, CategoryInfo } from '../src/bundle'
import { FONT_FILES } from '../src/style'
import type { CatalogAsset } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'

const ASSETS = join(import.meta.dir, '..', '..', 'receta-assets')
const OUT = join(import.meta.dir, '..', 'src', 'generated', 'bundle.json')
const FONTS = join(import.meta.dir, '..', 'public', 'fonts')

type Catalog = {
  readonly package: string
  readonly count: number
  readonly categories: readonly CategoryInfo[]
  readonly assets: readonly CatalogAsset[]
}

const catalog = unwrap(parseJSON<Catalog>(await readFile(join(ASSETS, 'catalog.json'), 'utf8')))
const sources = await mapAsyncOrThrow(catalog.assets, (asset) => readFile(join(ASSETS, asset.path), 'utf8'), {
  concurrency: 16,
})

const bundle: Bundle = {
  package: catalog.package,
  count: catalog.count,
  builtAt: new Date().toISOString(),
  categories: catalog.categories,
  authoring: await readFile(join(ASSETS, 'AUTHORING.md'), 'utf8'),
  assets: R.zipWith(catalog.assets, sources, (asset, source) => ({ ...asset, source })),
}

const json = JSON.stringify(bundle)
await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, json)
console.log(`Bundled ${bundle.count} assets, ${Math.round(json.length / 1024)} KB`)

// Only the latin files, at the weights and styles the pages set.
const resolve = createRequire(import.meta.url).resolve
const fontPackage = (file: string): string =>
  file.startsWith('newsreader') ? '@fontsource-variable/newsreader' : '@fontsource/ibm-plex-mono'
await rm(FONTS, { recursive: true, force: true })
await mkdir(FONTS, { recursive: true })
await mapAsyncOrThrow(FONT_FILES, (file) => copyFile(resolve(`${fontPackage(file)}/files/${file}`), join(FONTS, file)), {
  concurrency: FONT_FILES.length,
})
console.log(`Copied ${FONT_FILES.length} font files to public/fonts`)
