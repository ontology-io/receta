// Packs the receta-assets catalog, every asset's file and the authoring rules into one JSON
// module the Worker imports, so answering an agent never needs a second request. Runs before
// dev, test, typecheck and deploy; the output is generated and not committed.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import { parseJSON, unwrap } from '@ontologyio/receta/result'
import * as R from 'remeda'
import type { Bundle, CategoryInfo } from '../src/bundle'
import type { CatalogAsset } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'

const ASSETS = join(import.meta.dir, '..', '..', 'receta-assets')
const OUT = join(import.meta.dir, '..', 'src', 'generated', 'bundle.json')

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
