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

export type CatalogAsset = {
  readonly name: string
  readonly category: string
  readonly import: string
  /** Relative to the package root, like `src/text/uniqueSlug.ts`. */
  readonly path: string
  readonly summary: string
  readonly useWhen: string
  readonly tags: readonly string[]
  readonly composes: readonly string[]
  readonly signatures: readonly string[]
  readonly hasDiagram: boolean
}

export type Catalog = {
  readonly assets: readonly CatalogAsset[]
  /** Where the catalog came from, for a person to read. */
  readonly source: string
  /** Reads a file of the package, like `src/text/uniqueSlug.ts` or `AUTHORING.md`. */
  readonly read: (path: string) => Promise<string>
}

export type Hit = {
  readonly asset: CatalogAsset
  readonly score: number
  /** The words of the query that matched, after stemming. */
  readonly matched: readonly string[]
}

export type Candidate = {
  readonly category: string
  readonly name: string
  readonly why: string
  /** `category/name` of the asset it was adapted from, or '' when it is new. */
  readonly from: string
  readonly code: string
}

export const REPO = 'ontology-io/receta'
export const CANDIDATE_LABEL = 'asset-candidate'
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main/packages/receta-assets/`
const CACHE_HOURS = 24
const MARKER = '<!-- receta-asset-candidate v1 -->'
const NO_RESPONSE = '_No response_'

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

// ─── Search ──────────────────────────────────────────────────────────────────────────────
//
// BM25 over the fields an agent would describe a job with, weighted by how much each one
// says about the asset. Words are stemmed, and a word also matches the words it starts or
// that start it ("cach" finds "cache"), which covers most of the gap to embeddings for a
// vocabulary this size. The agent judges meaning from the top results.

const STOPWORDS = new Set([
  'a', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'code', 'do', 'each', 'for', 'from',
  'function', 'helper', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'need',
  'of', 'on', 'one', 'or', 'so', 'some', 'that', 'the', 'then', 'this', 'to', 'util',
  'utility', 'want', 'way', 'we', 'when', 'with', 'write',
])

const stem = (word: string): string => {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 4 && word.endsWith('ied')) return `${word.slice(0, -3)}y`
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3)
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2)
  if (word.length > 4 && /(?:ss|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** Words of a text, with camelCase split: `parseIntInRange` gives parse, int, range. */
export const tokenize = (text: string): readonly string[] =>
  text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem)

const FIELDS: readonly { readonly weight: number; readonly text: (asset: CatalogAsset) => string }[] = [
  { weight: 3, text: (asset) => asset.name },
  { weight: 2.5, text: (asset) => asset.tags.join(' ') },
  { weight: 2, text: (asset) => asset.summary },
  { weight: 1.5, text: (asset) => asset.composes.join(' ') },
  { weight: 1, text: (asset) => asset.useWhen },
  { weight: 1, text: (asset) => asset.category },
]

const K1 = 1.2
const B = 0.75
const PREFIX_WEIGHT = 0.6
const MIN_PREFIX = 4
const MIN_SHARED = 5

type Field = { readonly counts: ReadonlyMap<string, number>; readonly length: number }

const countWords = (words: readonly string[]): ReadonlyMap<string, number> =>
  words.reduce((counts, word) => counts.set(word, (counts.get(word) ?? 0) + 1), new Map<string, number>())

const sharedPrefix = (a: string, b: string): number => {
  const at = [...a].findIndex((char, index) => char !== b[index])
  return at < 0 ? Math.min(a.length, b.length) : at
}

/**
 * Each query word, plus the catalog words it starts or that start it ("cach" and "cache"),
 * or that share its first five letters ("expire" and "expiry").
 */
const expand = (word: string, vocabulary: readonly string[]): readonly (readonly [string, number])[] => [
  [word, 1],
  ...vocabulary
    .filter((other) => other !== word && Math.min(other.length, word.length) >= MIN_PREFIX)
    .filter((other) => other.startsWith(word) || word.startsWith(other) || sharedPrefix(word, other) >= MIN_SHARED)
    .map((other) => [other, PREFIX_WEIGHT] as const),
]

/** Ranks the catalog for a job described in words. Best first; only assets that match. */
export const search = (
  assets: readonly CatalogAsset[],
  query: string,
  options: { readonly category?: string | undefined; readonly limit?: number } = {},
): readonly Hit[] => {
  const docs = assets.map((asset) => ({
    asset,
    fields: FIELDS.map((field): Field => {
      const words = tokenize(field.text(asset))
      return { counts: countWords(words), length: words.length }
    }),
  }))
  const averages = FIELDS.map(
    (_, index) => docs.reduce((sum, doc) => sum + (doc.fields[index]?.length ?? 0), 0) / Math.max(docs.length, 1),
  )
  const documentFrequency = docs.reduce((frequency, doc) => {
    new Set(doc.fields.flatMap((field) => [...field.counts.keys()])).forEach((word) =>
      frequency.set(word, (frequency.get(word) ?? 0) + 1),
    )
    return frequency
  }, new Map<string, number>())
  const vocabulary = [...documentFrequency.keys()]
  const idf = (word: string): number => {
    const frequency = documentFrequency.get(word) ?? 0
    return Math.log(1 + (docs.length - frequency + 0.5) / (frequency + 0.5))
  }
  const queryWords = [...new Set(tokenize(query))]
  const expansions = queryWords.map((word) => [word, expand(word, vocabulary)] as const)
  const exactName = query.replace(/\s+/g, '').toLowerCase()

  return docs
    .filter((doc) => options.category === undefined || doc.asset.category === options.category)
    .map((doc): Hit => {
      const perWord = expansions.map(([word, forms]) => {
        const score = forms.reduce(
          (total, [form, formWeight]) =>
            total +
            doc.fields.reduce((sum, field, index) => {
              const count = field.counts.get(form) ?? 0
              if (count === 0) return sum
              const norm = 1 - B + (B * field.length) / (averages[index] ?? 1)
              const weight = FIELDS[index]?.weight ?? 1
              return sum + weight * formWeight * idf(form) * ((count * (K1 + 1)) / (count + K1 * norm))
            }, 0),
          0,
        )
        return [word, score] as const
      })
      const nameBonus =
        doc.asset.name.toLowerCase() === exactName ||
        `${doc.asset.category}/${doc.asset.name}`.toLowerCase() === exactName
          ? 100
          : 0
      return {
        asset: doc.asset,
        score: perWord.reduce((sum, [, score]) => sum + score, nameBonus),
        matched: perWord.filter(([, score]) => score > 0).map(([word]) => word),
      }
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit ?? 8)
}

export const findAsset = (assets: readonly CatalogAsset[], name: string): CatalogAsset | undefined =>
  assets.find((asset) => asset.name === name || `${asset.category}/${asset.name}` === name)

// ─── Candidates ──────────────────────────────────────────────────────────────────────────
//
// A candidate travels as a GitHub issue. Its body uses the same `### Heading` sections as
// the issue form in .github/ISSUE_TEMPLATE/asset-candidate.yml, so one parser reads both,
// and the file comes last because its comment holds fences of its own.

const ALLOWED_IMPORT = /^(?:remeda|@ontologyio\/receta\/[a-z]+)$/
const RECETA_IMPORT = /^@ontologyio\/receta\/[a-z]+$/

const importsOf = (code: string): readonly string[] =>
  [...code.matchAll(/^\s*(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm)].map(
    (match) => match[1] ?? match[2] ?? '',
  )

/** The JSDoc right above the first `export function name`, without its stars. */
const docAbove = (code: string, name: string): string => {
  const at = code.search(new RegExp(`^export function ${name}\\b`, 'm'))
  if (at < 0) return ''
  const block = /\/\*\*([\s\S]*?)\*\/\s*$/.exec(code.slice(0, at))
  return (block?.[1] ?? '')
    .split('\n')
    .map((line) => line.replace(/^\s*\* ?/, ''))
    .join('\n')
    .trim()
}

/** The first paragraph and the `@tags` words of a candidate's comment. */
export const describe = (code: string, name: string): { readonly summary: string; readonly tags: readonly string[] } => {
  const doc = docAbove(code, name)
  return {
    summary: (doc.split(/\n\s*\n/)[0] ?? '').replace(/\s+/g, ' ').trim(),
    tags: (/^@tags\s+(.+)$/m.exec(doc)?.[1] ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
  }
}

/** What stops a file from being an asset, judged from its text. The intake runs the full check. */
export const candidateProblems = (name: string, code: string): readonly string[] => {
  const doc = docAbove(code, name)
  const imports = importsOf(code)
  const otherExports = [...code.matchAll(/^export\s+(?!type\b|interface\b)(?:async\s+)?(\w+)\s+(\w+)/gm)].filter(
    (match) => !(match[1] === 'function' && match[2] === name),
  )
  return [
    ...(/^[a-z][A-Za-z0-9]*$/.test(name) ? [] : [`"${name}" is not a camelCase function name`]),
    ...(new RegExp(`^export function ${name}\\b`, 'm').test(code)
      ? []
      : [`the file must export a function named after it: export function ${name}`]),
    ...(doc === '' ? ['no JSDoc comment right above the function'] : []),
    ...(doc !== '' && !/^Use when:/m.test(doc) ? ['the comment has no "Use when:" paragraph'] : []),
    ...(doc !== '' && !/@example/.test(doc) ? ['the comment has no @example'] : []),
    ...(doc !== '' && !/^@tags\s+\S/m.test(doc) ? ['the comment has no @tags line'] : []),
    ...imports
      .filter((source) => !ALLOWED_IMPORT.test(source))
      .map((source) => `imports "${source}": an asset imports only remeda and @ontologyio/receta/*`),
    ...(imports.some((source) => RECETA_IMPORT.test(source)) ? [] : ['uses no Receta function']),
    ...otherExports.map((match) => `exports ${match[2] ?? 'something'} besides the function and its types`),
  ]
}

const PRIVATE_PATTERNS: readonly (readonly [RegExp, string])[] = [
  [/[\w.+-]+@(?!example\.)[\w-]+\.[a-z]{2,}/gi, 'an email address'],
  [/https?:\/\/(?!(?:www\.)?example\.(?:com|org)|localhost|github\.com\/ontology-io)[^\s'"`)]+/g, 'a URL'],
  [/(?:\/Users\/|\/home\/|[A-Z]:\\)[^\s'"`]+/g, 'an absolute path'],
  [/\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*['"][^'"]+['"]/gi, 'a credential'],
  [/\b[A-Za-z0-9_-]{32,}\b/g, 'a long key-like string'],
]

/** Text that may belong to the project the function came from. Each one needs a look. */
export const privacyWarnings = (code: string): readonly string[] =>
  PRIVATE_PATTERNS.flatMap(([pattern, what]) =>
    [...code.matchAll(pattern)].map((match) => `${what}: ${match[0].slice(0, 60)}`),
  )

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

export const candidateTitle = (candidate: Candidate): string =>
  `asset candidate: ${candidate.category}/${candidate.name}`

export const candidateBody = (candidate: Candidate, closest: readonly Hit[]): string => {
  const longestFence = Math.max(3, ...[...candidate.code.matchAll(/^\s*\*?\s*(`{3,})/gm)].map((m) => (m[1] ?? '').length))
  const fence = '`'.repeat(longestFence + 1)
  return [
    MARKER,
    '### Category',
    candidate.category,
    '### Why it was needed',
    candidate.why === '' ? NO_RESPONSE : candidate.why,
    '### Adapted from',
    candidate.from === '' ? NO_RESPONSE : candidate.from,
    '### Closest existing assets',
    closest.length === 0
      ? 'None matched.'
      : closest.map((hit) => `- \`${hit.asset.category}/${hit.asset.name}\`: ${hit.asset.summary}`).join('\n'),
    '### The file',
    `${fence}ts\n${candidate.code.trimEnd()}\n${fence}`,
  ].join('\n\n')
}

type Parsed =
  | { readonly ok: true; readonly candidate: Candidate }
  | { readonly ok: false; readonly problem: string }

/** Reads a candidate issue written by `share` or by the issue form. */
export const parseCandidate = (body: string): Parsed => {
  const sections = new Map(
    body
      .replace(/\r\n/g, '\n')
      .split(/^### /m)
      .slice(1)
      .map((section) => {
        const newline = section.indexOf('\n')
        return [section.slice(0, newline).trim(), section.slice(newline + 1).trim()] as const
      }),
  )
  const answer = (heading: string): string => {
    const text = sections.get(heading) ?? ''
    return text === NO_RESPONSE ? '' : text
  }
  const lines = answer('The file').split('\n')
  const open = /^(`{3,}|~{3,})\s*(?:ts|typescript)?\s*$/.exec(lines[0]?.trim() ?? '')
  // The last fence of the same length closes it: the fences inside the comment come earlier.
  const closeAt =
    open === null ? -1 : lines.reduce((last, line, index) => (index > 0 && line.trim() === open[1] ? index : last), -1)
  if (open === null || closeAt < 0) return { ok: false, problem: 'no fenced TypeScript file under "### The file"' }
  const code = `${lines.slice(1, closeAt).join('\n')}\n`
  const name = /^export function (\w+)/m.exec(code)?.[1]
  if (name === undefined) return { ok: false, problem: 'the file exports no function' }
  return {
    ok: true,
    candidate: { category: answer('Category'), name, why: answer('Why it was needed'), from: answer('Adapted from'), code },
  }
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

const clip = (text: string, length: number): string =>
  text.length <= length ? text : `${text.slice(0, length - 1).trimEnd()}…`

const fileOf = (catalog: Catalog, asset: CatalogAsset): string =>
  /^https?:\/\//.test(catalog.source) ? new URL(asset.path, catalog.source).href : join(catalog.source, asset.path)

const printHits = (catalog: Catalog, hits: readonly Hit[]): void => {
  console.log(`${hits.length} matches in ${catalog.assets.length} assets (${catalog.source})\n`)
  hits.forEach((hit, index) => {
    console.log(`${String(index + 1).padStart(2)}. ${hit.asset.category}/${hit.asset.name}   score ${hit.score.toFixed(1)}, matched ${hit.matched.join(' ')}`)
    console.log(`    ${hit.asset.summary}`)
    console.log(`    use when: ${clip(hit.asset.useWhen, 220)}`)
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
    console.error(`// ${fileOf(catalog, asset)}`)
    process.stdout.write(await catalog.read(asset.path))
    return 0
  },

  async guide({ flags }) {
    const catalog = await loadCatalog({ catalog: flags.get('catalog') })
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
    const problems = [
      ...candidateProblems(name, code),
      ...(categories.includes(candidate.category)
        ? []
        : [`--category must be one of: ${categories.join(', ')}`]),
      ...(candidate.why === '' ? ['--why is missing: one or two sentences on the job it does'] : []),
      ...(taken === undefined
        ? []
        : [`${taken.category}/${taken.name} already exists: name the new one by what differs`]),
      ...(candidate.from === '' || findAsset(catalog.assets, candidate.from) !== undefined
        ? []
        : [`--from ${candidate.from} is not in the catalog`]),
    ]
    const warnings = privacyWarnings(code)
    const { summary, tags } = describe(code, name)
    const closest = search(catalog.assets, [name, summary, ...tags].join(' '), { limit: 3 })
    const title = candidateTitle(candidate)
    const body = candidateBody(candidate, closest)

    if (problems.length > 0) {
      console.log(`Not ready to share:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`)
      return 1
    }
    if (!flags.has('send')) {
      console.log(`Title: ${title}\n\n${body}\n`)
      console.log(
        warnings.length === 0
          ? 'Nothing in the file looks project-specific.'
          : `Check these before sharing, they may belong to the project:\n${warnings.map((w) => `  - ${w}`).join('\n')}`,
      )
      console.log(`\nNothing was sent. Show this to the person, and only with their OK run again with --send.`)
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
