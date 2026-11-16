// Finds, shows and shares receta-assets from any project. SKILL.md next to this folder says
// when an agent runs which command.
//
//   search <words…> [--category c] [--limit n] [--json]   rank the assets for a job
//   show <name>                                            print an asset's file
//   guide                                                  print the rules a new asset follows
//   share <file> --category c --why "…" [--from c/name] [--send]
//                                                          print the candidate issue for a new
//                                                          function; send it only with --send
//   where                                                  say which catalog is in use
//
// It runs from a plugin folder with no node_modules, inside projects that may not install
// Receta, so it uses Node built-ins only and runs under Bun or Node 22.6+
// (`node --experimental-strip-types`). That is why it doesn't use Receta or Remeda itself.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  type Candidate,
  type CatalogAsset,
  candidateBody,
  candidateProblems,
  candidateTitle,
  CANDIDATE_LABEL,
  describe,
  findAsset,
  type Hit,
  importsOf,
  privacyWarnings,
  REPO,
  sameCode,
  search,
} from './core.ts'

export * from './core.ts'

export type Catalog = {
  readonly assets: readonly CatalogAsset[]
  /** Where the catalog came from, for a person to read. */
  readonly source: string
  /** Reads a file of the package, like `src/text/uniqueSlug.ts` or `AUTHORING.md`. */
  readonly read: (path: string) => Promise<string>
}

const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main/packages/receta-assets/`
const CACHE_HOURS = 24

// ─── Catalog ─────────────────────────────────────────────────────────────────────────────

const isCatalogAsset = (value: unknown): value is CatalogAsset =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { name?: unknown }).name === 'string' &&
  typeof (value as { path?: unknown }).path === 'string' &&
  Array.isArray((value as { tags?: unknown }).tags)

const parseCatalog = (text: string, source: string): readonly CatalogAsset[] => {
  const json: unknown = JSON.parse(text)
  const assets = (json as { assets?: unknown }).assets
  if (!Array.isArray(assets) || !assets.every(isCatalogAsset)) {
    throw new Error(`${source} is not a receta-assets catalog`)
  }
  return assets
}

const fromDirectory = (root: string): Catalog => ({
  assets: parseCatalog(readFileSync(join(root, 'catalog.json'), 'utf8'), root),
  source: root,
  read: async (path) => readFileSync(join(root, path), 'utf8'),
})

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.text()
}

const cachePath = (base: string): string =>
  join(
    process.env['XDG_CACHE_HOME'] ?? join(homedir(), '.cache'),
    'receta-assets',
    `${base.replace(/[^a-z0-9]+/gi, '_')}catalog.json`,
  )

const isFresh = (path: string): boolean =>
  existsSync(path) && Date.now() - statSync(path).mtimeMs < CACHE_HOURS * 3_600_000

/** The catalog on GitHub, cached for a day. A stale cache beats no catalog when offline. */
const fromUrl = async (base: string): Promise<Catalog> => {
  const cached = cachePath(base)
  const read = (path: string): Promise<string> => fetchText(new URL(path, base).href)
  if (isFresh(cached)) {
    return { assets: parseCatalog(readFileSync(cached, 'utf8'), cached), source: base, read }
  }
  const fetched = await fetchText(new URL('catalog.json', base).href).catch((error: unknown) => {
    if (existsSync(cached)) return readFileSync(cached, 'utf8')
    throw new Error(`Can't reach the catalog at ${base}: ${String(error)}`)
  })
  const assets = parseCatalog(fetched, base)
  mkdirSync(dirname(cached), { recursive: true })
  writeFileSync(cached, fetched)
  return { assets, source: base, read }
}

const parents = (start: string): readonly string[] => {
  const parent = dirname(start)
  return parent === start ? [start] : [start, ...parents(parent)]
}

/** The package installed in a project, or this repository's own copy. */
const findLocalPackage = (start: string): string | undefined =>
  parents(resolve(start))
    .flatMap((dir) => [
      join(dir, 'node_modules', '@ontologyio', 'receta-assets'),
      join(dir, 'packages', 'receta-assets'),
    ])
    .find((dir) => existsSync(join(dir, 'catalog.json')))

/**
 * Finds the catalog: `--catalog` or `RECETA_ASSETS_CATALOG` (a folder, a catalog.json or a
 * URL), else the nearest installed or checked-out package, else `main` on GitHub.
 */
export const loadCatalog = async (
  options: { readonly catalog?: string | undefined; readonly cwd?: string } = {},
): Promise<Catalog> => {
  const given = options.catalog ?? process.env['RECETA_ASSETS_CATALOG']
  if (given !== undefined && given !== '') {
    const base = given.replace(/catalog\.json$/, '')
    return /^https?:\/\//.test(given)
      ? fromUrl(base.endsWith('/') ? base : `${base}/`)
      : fromDirectory(resolve(base))
  }
  const local = findLocalPackage(options.cwd ?? process.cwd())
  return local === undefined ? fromUrl(RAW_BASE) : fromDirectory(local)
}

// ─── Projects ────────────────────────────────────────────────────────────────────────────

const nearestPackageJson = (start: string): string | undefined =>
  parents(resolve(start))
    .map((dir) => join(dir, 'package.json'))
    .find((path) => existsSync(path))

/** Of the two packages every asset imports, those the nearest package.json doesn't list. */
export const missingDependencies = (start: string): readonly string[] => {
  const path = nearestPackageJson(start)
  if (path === undefined) return []
  const json = JSON.parse(readFileSync(path, 'utf8')) as Record<string, Record<string, string> | undefined>
  const listed = ['dependencies', 'devDependencies', 'peerDependencies'].flatMap((field) => Object.keys(json[field] ?? {}))
  return ['remeda', '@ontologyio/receta'].filter((name) => !listed.includes(name))
}

/** Why sharing is off here, or undefined when it is on. */
export const sharingOff = (start: string): string | undefined => {
  const env = (process.env['RECETA_ASSETS_SHARE'] ?? '').toLowerCase()
  if (['0', 'false', 'no', 'off'].includes(env)) return `RECETA_ASSETS_SHARE=${env}`
  return parents(resolve(start))
    .map((dir) => join(dir, 'package.json'))
    .filter((path) => existsSync(path))
    .find((path) => {
      const json: unknown = JSON.parse(readFileSync(path, 'utf8'))
      const receta = (json as { receta?: { shareAssets?: unknown } }).receta
      return receta?.shareAssets === false
    })
    ?.concat(': "receta": { "shareAssets": false }')
}

const createIssue = (repo: string, title: string, body: string): string => {
  const file = join(tmpdir(), `receta-asset-candidate-${process.pid}.md`)
  writeFileSync(file, body)
  const run = (labels: readonly string[]) =>
    spawnSync('gh', ['issue', 'create', '--repo', repo, '--title', title, '--body-file', file, ...labels], {
      encoding: 'utf8',
    })
  const first = run(['--label', CANDIDATE_LABEL])
  // A repository without the label refuses the issue, and the title prefix is enough to find it.
  const result = first.status !== 0 && /label/i.test(first.stderr) ? run([]) : first
  rmSync(file, { force: true })
  if (result.error !== undefined) {
    throw new Error(`gh isn't installed. Open the issue by hand: https://github.com/${repo}/issues/new`)
  }
  if (result.status !== 0) throw new Error(result.stderr.trim())
  return result.stdout.trim()
}

// ─── Command line ────────────────────────────────────────────────────────────────────────

type Args = { readonly words: readonly string[]; readonly flags: ReadonlyMap<string, string> }

const BOOLEAN_FLAGS = new Set(['json', 'send'])

const parseArgs = (argv: readonly string[]): Args =>
  argv.reduce<{ words: string[]; flags: Map<string, string>; pending: string | undefined }>(
    (state, arg) => {
      if (state.pending !== undefined) {
        state.flags.set(state.pending, arg)
        return { ...state, pending: undefined }
      }
      if (!arg.startsWith('--')) return { ...state, words: [...state.words, arg] }
      const [key = '', value] = arg.slice(2).split(/=(.*)/s)
      if (value !== undefined) state.flags.set(key, value)
      else if (BOOLEAN_FLAGS.has(key)) state.flags.set(key, 'true')
      else return { ...state, pending: key }
      return state
    },
    { words: [], flags: new Map(), pending: undefined },
  )

const fileOf = (catalog: Catalog, asset: CatalogAsset): string =>
  /^https?:\/\//.test(catalog.source) ? new URL(asset.path, catalog.source).href : join(catalog.source, asset.path)

const printHits = (catalog: Catalog, hits: readonly Hit[]): void => {
  console.log(`${hits.length} matches in ${catalog.assets.length} assets (${catalog.source})\n`)
  hits.forEach((hit, index) => {
    console.log(`${String(index + 1).padStart(2)}. ${hit.asset.category}/${hit.asset.name}   score ${hit.score.toFixed(1)}, matched ${hit.matched.join(' ')}`)
    console.log(`    ${hit.asset.summary}`)
    // In full: the edge cases a caller must know sit at the end of this line.
    console.log(`    use when: ${hit.asset.useWhen}`)
    if (hit.asset.inputs !== undefined && hit.asset.output !== undefined) {
      const takes = hit.asset.inputs.map((input) => `${input.name}: ${input.type}`).join(', ')
      console.log(`    takes (${takes}), returns ${hit.asset.output}`)
    }
    console.log(`    built from: ${hit.asset.composes.filter((name) => !name.startsWith('R.')).join(', ')}`)
    console.log(`    file: ${fileOf(catalog, hit.asset)}\n`)
  })
}

const commands: Readonly<Record<string, (args: Args) => Promise<number>>> = {
  async search({ words, flags }) {
    const catalog = await loadCatalog({ catalog: flags.get('catalog') })
    const hits = search(catalog.assets, words.join(' '), {
      category: flags.get('category'),
      limit: Number(flags.get('limit') ?? 8),
    })
    if (flags.has('json')) {
      console.log(JSON.stringify(hits.map((hit) => ({ ...hit.asset, score: hit.score, file: fileOf(catalog, hit.asset) })), null, 2))
    } else if (hits.length === 0) {
      console.log(`No asset matches "${words.join(' ')}". Try other words, or write a new one: see \`guide\`.`)
    } else {
      printHits(catalog, hits)
    }
    return 0
  },

  async show({ words, flags }) {
    const catalog = await loadCatalog({ catalog: flags.get('catalog') })
    const asset = findAsset(catalog.assets, words[0] ?? '')
    if (asset === undefined) {
      console.error(`No asset named "${words[0] ?? ''}". Search first: search <words>`)
      return 1
    }
    const missing = missingDependencies(process.cwd())
    console.error(`// ${fileOf(catalog, asset)}`)
    console.error(`// When the project installs @ontologyio/receta-assets: ${asset.import}`)
    if (missing.length > 0) {
      console.error(`// This project's package.json lacks ${missing.join(' and ')}, which the file imports.`)
    }
    process.stdout.write(await catalog.read(asset.path))
    return 0
  },

  async guide({ flags }) {
    const catalog = await loadCatalog({ catalog: flags.get('catalog') })
    console.log(
      [
        '<!-- In a project: the rules for the function and its comment apply as written. The',
        "file goes in the project's helper folder, not src/<category>/, and the commands",
        '(check.ts, catalog.ts, intake.ts) belong to the catalog\'s own repository. -->',
        '',
      ].join('\n'),
    )
    process.stdout.write(await catalog.read('AUTHORING.md'))
    return 0
  },

  async where({ flags }) {
    const catalog = await loadCatalog({ catalog: flags.get('catalog') })
    console.log(`${catalog.source} (${catalog.assets.length} assets)`)
    return 0
  },

  async share({ words, flags }) {
    const file = resolve(words[0] ?? '')
    const off = sharingOff(dirname(file))
    if (off !== undefined) {
      console.log(`Sharing is off for this project (${off}). Nothing was prepared or sent.`)
      return 0
    }
    if (!existsSync(file)) {
      console.error(`No file at ${file}`)
      return 1
    }
    const catalog = await loadCatalog({ catalog: flags.get('catalog') })
    const categories = [...new Set(catalog.assets.map((asset) => asset.category))].sort()
    const code = readFileSync(file, 'utf8')
    const name = basename(file).replace(/\.tsx?$/, '')
    const candidate: Candidate = {
      category: flags.get('category') ?? '',
      name,
      why: flags.get('why') ?? '',
      from: flags.get('from') ?? '',
      code,
    }
    const taken = findAsset(catalog.assets, name)
    if (taken !== undefined && sameCode(await catalog.read(taken.path), code)) {
      console.log(`This is an unchanged copy of ${taken.category}/${taken.name}. There is nothing to share.`)
      return 0
    }
    const projectImports = importsOf(code).filter((source) => source.startsWith('.'))
    if (projectImports.length > 0) {
      console.log(
        `This file imports ${projectImports.join(', ')} from the project. Code that wires assets into a ` +
          'project is not a candidate: offer a function only when it does a job on its own.',
      )
      return 0
    }
    const problems = [
      ...candidateProblems(name, code),
      ...(categories.includes(candidate.category)
        ? []
        : [`--category must be one of: ${categories.join(', ')}`]),
      ...(candidate.why === '' ? ['--why is missing: one or two sentences on the job it does'] : []),
      ...(taken === undefined
        ? []
        : [`${taken.category}/${taken.name} already exists and this file differs: if it is a variant, name it by what differs`]),
      ...(candidate.from === '' || findAsset(catalog.assets, candidate.from) !== undefined
        ? []
        : [`--from ${candidate.from} is not in the catalog`]),
    ]
    const warnings = privacyWarnings(code)
    const { summary, tags } = describe(code, name)
    const closest = search(catalog.assets, [name, summary, ...tags].join(' '), { limit: 3 })
    const title = candidateTitle(candidate)
    const body = candidateBody(candidate, closest)
    const report = [
      closest.length === 0
        ? 'No asset in the catalog is close to it.'
        : `Closest assets: if one already does the job, use it instead of sharing.\n${closest
            .map((hit) => `  - ${hit.asset.category}/${hit.asset.name}: ${hit.asset.summary}`)
            .join('\n')}`,
      warnings.length === 0
        ? 'Nothing in the file matches the patterns for private text (emails, URLs, paths, keys). Domain words are yours to judge.'
        : `These may belong to the project. Remove or generalize them first:\n${warnings.map((w) => `  - ${w}`).join('\n')}`,
    ].join('\n\n')

    if (problems.length > 0) {
      console.log(`Not ready to share:\n${problems.map((problem) => `  - ${problem}`).join('\n')}\n\n${report}`)
      return 1
    }
    if (!flags.has('send')) {
      console.log(`Title: ${title}\n\n${body}\n\n${report}`)
      console.log('\nNothing was sent. Show this to the person, and only with their OK run again with --send.')
      return 0
    }
    console.log(createIssue(process.env['RECETA_ASSETS_REPO'] ?? REPO, title, body))
    return 0
  },
}

const main = async (argv: readonly string[]): Promise<number> => {
  const [command = '', ...rest] = argv
  const run = commands[command]
  if (run === undefined) {
    console.error('Usage: assets.ts search <words…> | show <name> | guide | share <file> --category c --why "…" [--send] | where')
    return 1
  }
  return run(parseArgs(rest))
}

const isMain = process.argv[1] !== undefined && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    },
  )
}
