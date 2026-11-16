// The pure part of the receta-assets tools: the catalog's types, the search, and what makes
// a file a candidate. No Node or Worker APIs, so the CLI next to it (assets.ts) and the
// marketplace Worker (packages/receta-market) share one copy of each rule.
//
// Like the CLI, it uses no Receta or Remeda: it is copied into a plugin folder with no
// node_modules, and runs under Bun, Node 22.6+ and Workers.

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
  /** The parameters of the data-first signature. Catalogs built before 2026-11-16 lack it. */
  readonly inputs?: readonly { readonly name: string; readonly type: string }[]
  /** That signature's return type, as written. */
  readonly output?: string
  readonly hasDiagram: boolean
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
const MARKER = '<!-- receta-asset-candidate v1 -->'
const NO_RESPONSE = '_No response_'

// ─── Search ──────────────────────────────────────────────────────────────────────────────
//
// BM25 over the fields an agent would describe a job with, weighted by how much each one
// says about the asset. Words are stemmed, and a word also matches the words it starts or
// that start it ("cach" finds "cache"), which covers most of the gap to embeddings for a
// vocabulary this size. The agent judges meaning from the top results.

// Words that say nothing about the job. "read" and "such" once put an asset first by
// matching filler in its "use when" line.
const STOPWORDS = new Set([
  'a', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'code', 'do', 'each', 'for', 'from',
  'function', 'get', 'given', 'helper', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'like', 'make', 'me', 'my', 'need', 'of', 'on', 'one', 'or', 'read', 'so', 'some', 'something',
  'such', 'take', 'that', 'the', 'then', 'thing', 'this', 'to', 'use', 'using', 'util',
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

export const importsOf = (code: string): readonly string[] =>
  [...code.matchAll(/^\s*(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm)].map(
    (match) => match[1] ?? match[2] ?? '',
  )

/** Equal apart from line endings and the blank lines around the file. */
export const sameCode = (a: string, b: string): boolean =>
  a.replace(/\r\n/g, '\n').trim() === b.replace(/\r\n/g, '\n').trim()

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
  [/(?:\/(?:Users|home|Volumes|private|var|opt|srv|mnt|tmp)\/|[A-Z]:\\)[^\s'"`]+/g, 'an absolute path'],
  [/\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*['"][^'"]+['"]/gi, 'a credential'],
  [/\b[A-Za-z0-9_-]{32,}\b/g, 'a long key-like string'],
]

/** Text that may belong to the project the function came from. Each one needs a look. */
export const privacyWarnings = (code: string): readonly string[] =>
  PRIVATE_PATTERNS.flatMap(([pattern, what]) =>
    [...code.matchAll(pattern)].map((match) => `${what}: ${match[0].slice(0, 60)}`),
  )

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
