// Reads an asset file the way the check and the catalog both need it: the one exported
// function, the comment above it, and the Receta and Remeda functions it is built from.
// AUTHORING.md says what an asset must look like. Start at readAssets.
import { readFile } from 'node:fs/promises'
import { basename, dirname, join, relative } from 'node:path'
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import { Glob } from 'bun'
import * as R from 'remeda'
import ts from 'typescript'

export const ROOT = join(import.meta.dir, '..')
export const SRC = join(ROOT, 'src')

export const CATEGORIES = [
  'async', 'cache', 'collection', 'control', 'filter', 'number', 'object', 'parse', 'result',
  'sort', 'state', 'text', 'validate',
] as const

export type Category = (typeof CATEGORIES)[number]

export type AssetDoc = {
  readonly summary: string
  readonly useWhen: string
  readonly flow: string
  readonly example: string
  readonly tags: readonly string[]
  readonly see: readonly string[]
}

export type AssetInput = { readonly name: string; readonly type: string }

export type Asset = {
  readonly name: string
  readonly category: string
  /** Relative to the package root, like `src/text/uniqueSlug.ts`. */
  readonly path: string
  readonly source: string
  readonly doc: AssetDoc
  readonly signatures: readonly string[]
  /** The parameters of the first signature, the data-first one when there are overloads. */
  readonly inputs: readonly AssetInput[]
  /** The return type of that signature, as written. */
  readonly output: string
  /** Like `result/ok` for Receta and `R.pipe` for Remeda. */
  readonly composes: readonly string[]
  /** What breaks the contract in AUTHORING.md, before anything runs. */
  readonly problems: readonly string[]
}

const ALLOWED_IMPORT = /^(?:remeda|@ontologyio\/receta\/[a-z]+)$/
const RECETA_IMPORT = /^@ontologyio\/receta\/([a-z]+)$/
const FENCE = /^```/
/** Diagrams follow the visual-communicator limit, so they fit any terminal and editor. */
const MAX_FLOW_WIDTH = 80
const MAX_SUMMARY_LENGTH = 140

/** The comment text without its `/**`, `*\/` and the leading ` * ` of each line. */
const commentLines = (raw: string): readonly string[] =>
  R.pipe(
    raw.replace(/^\/\*\*/, '').replace(/\*\/$/, '').split('\n'),
    R.map((line) => line.replace(/^\s*\* ?/, '').replace(/\s+$/, '')),
    R.dropWhile((line) => line === ''),
  )

/** Index of each line that starts a tag such as `@example`, outside code fences. */
const tagStarts = (lines: readonly string[]): readonly number[] =>
  R.pipe(
    lines,
    R.reduce(
      (state, line, index) => {
        const inFence = FENCE.test(line) ? !state.inFence : state.inFence
        const isTag = !state.inFence && line.startsWith('@')
        return { inFence, starts: isTag ? [...state.starts, index] : state.starts }
      },
      { inFence: false, starts: [] as readonly number[] },
    ),
    R.prop('starts'),
  )

const fenced = (lines: readonly string[], language: RegExp): string => {
  const open = R.findIndex(lines, (line) => FENCE.test(line) && language.test(line.slice(3)))
  if (open < 0) return ''
  const rest = lines.slice(open + 1)
  const close = R.findIndex(rest, (line) => FENCE.test(line))
  return R.join(close < 0 ? rest : rest.slice(0, close), '\n')
}

const paragraphs = (lines: readonly string[]): readonly string[] =>
  R.pipe(
    R.join(lines, '\n').split(/\n\s*\n/),
    R.map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim()),
    R.filter(R.isTruthy),
  )

const tagBlock = (lines: readonly string[], starts: readonly number[], tag: string): readonly string[][] =>
  R.pipe(
    starts,
    R.map((start, index) => lines.slice(start, starts[index + 1] ?? lines.length)),
    R.filter(([first = '']) => first === `@${tag}` || first.startsWith(`@${tag} `)),
  )

export const parseDoc = (raw: string): AssetDoc => {
  const lines = commentLines(raw)
  const starts = tagStarts(lines)
  const description = lines.slice(0, starts[0] ?? lines.length)
  const prose = paragraphs(R.join(description, '\n').replace(/```[\s\S]*?```/g, '').split('\n'))
  const [exampleBlock = []] = tagBlock(lines, starts, 'example')
  return {
    summary: prose[0] ?? '',
    useWhen: (R.find(prose, (paragraph) => paragraph.startsWith('Use when:')) ?? '')
      .replace(/^Use when:\s*/, ''),
    flow: fenced(description, /^text\b/),
    example: fenced(exampleBlock, /^(?:ts|typescript)\b/),
    tags: R.pipe(
      tagBlock(lines, starts, 'tags'),
      R.flatMap((block) => R.join(block, ' ').replace(/^@tags\s*/, '').split(',')),
      R.map((tag) => tag.trim()),
      R.filter(R.isTruthy),
    ),
    see: R.pipe(
      tagBlock(lines, starts, 'see'),
      R.map((block) => R.join(block, ' ').replace(/^@see\s*/, '').trim()),
    ),
  }
}

const isExported = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)

type ExportedValue = { readonly name: string; readonly node: ts.Statement }

const exportedValues = (file: ts.SourceFile): readonly ExportedValue[] =>
  R.pipe(
    file.statements,
    R.filter(isExported),
    R.flatMap((statement): ExportedValue[] => {
      if (ts.isFunctionDeclaration(statement) && statement.name)
        return [{ name: statement.name.text, node: statement }]
      if (ts.isVariableStatement(statement))
        return R.pipe(
          statement.declarationList.declarations,
          R.filter((declaration) => ts.isIdentifier(declaration.name)),
          R.map((declaration) => ({ name: declaration.name.getText(file), node: statement })),
        )
      if (ts.isClassDeclaration(statement) && statement.name)
        return [{ name: statement.name.text, node: statement }]
      return []
    }),
  )

const leadingDoc = (file: ts.SourceFile, node: ts.Node): string => {
  const ranges = ts.getLeadingCommentRanges(file.text, node.getFullStart()) ?? []
  const last = R.last(R.filter(ranges, ({ pos }) => file.text.startsWith('/**', pos)))
  return last ? file.text.slice(last.pos, last.end) : ''
}

/** Overloads when there are some, otherwise the declaration without its body. */
const signaturesOf = (file: ts.SourceFile, nodes: readonly ts.Statement[]): readonly string[] => {
  const functions = R.filter(nodes, ts.isFunctionDeclaration)
  const overloads = R.filter(functions, (node) => node.body === undefined)
  const shown = overloads.length > 0 ? overloads : functions
  const text = (node: ts.Statement): string => {
    const body = ts.isFunctionDeclaration(node) ? node.body : undefined
    const end = body ? body.getStart(file) : node.getEnd()
    return file.text.slice(node.getStart(file), end).replace(/\s+/g, ' ').replace(/\s*;?\s*$/, '')
  }
  return R.map(shown.length > 0 ? shown : nodes, text)
}

const typeText = (file: ts.SourceFile, node: ts.TypeNode | undefined): string =>
  node ? node.getText(file).replace(/\s+/g, ' ') : 'unknown'

/**
 * What goes in and what comes out, from the first signature: with overloads that is the
 * data-first one, which names the data. The marketplace indexes these beside the summary.
 */
const ioOf = (
  file: ts.SourceFile,
  nodes: readonly ts.Statement[],
): { readonly inputs: readonly AssetInput[]; readonly output: string } => {
  const first = R.first(R.filter(nodes, ts.isFunctionDeclaration))
  return first === undefined
    ? { inputs: [], output: 'unknown' }
    : {
        inputs: R.map([...first.parameters], (parameter) => ({
          name: parameter.name.getText(file),
          type: typeText(file, parameter.type),
        })),
        output: typeText(file, first.type),
      }
}

type Import = { readonly module: string; readonly names: readonly string[]; readonly typeOnly: boolean }

const importsOf = (file: ts.SourceFile): readonly Import[] =>
  R.pipe(
    // A NodeArray carries extra fields that keep Remeda from narrowing it, so copy it first.
    [...file.statements],
    R.filter(ts.isImportDeclaration),
    R.map((declaration) => {
      const clause = declaration.importClause
      const bindings = clause?.namedBindings
      const named = bindings && ts.isNamedImports(bindings) ? bindings.elements : []
      return {
        module: (declaration.moduleSpecifier as ts.StringLiteral).text,
        typeOnly: clause?.isTypeOnly === true,
        names: R.pipe(
          named,
          R.filter((element) => !element.isTypeOnly),
          R.map((element) => (element.propertyName ?? element.name).text),
        ),
      }
    }),
  )

const remedaCalls = (file: ts.SourceFile): readonly string[] => {
  const code = ts.createPrinter({ removeComments: true }).printFile(file)
  return R.pipe(
    [...code.matchAll(/\bR\.([A-Za-z]+)/g)],
    R.map(([, name]) => `R.${name}`),
    // purry only makes the data-last form, so it says nothing about what the asset does.
    R.filter((name) => name !== 'R.purry'),
    R.unique(),
  )
}

const composesOf = (file: ts.SourceFile): readonly string[] => [
  ...R.pipe(
    importsOf(file),
    R.filter(({ module, typeOnly }) => !typeOnly && RECETA_IMPORT.test(module)),
    R.flatMap(({ module, names }) => R.map(names, (name) => `${module.replace(RECETA_IMPORT, '$1')}/${name}`)),
  ),
  ...remedaCalls(file),
]

const problemsOf = (
  name: string,
  file: ts.SourceFile,
  values: readonly ExportedValue[],
  doc: AssetDoc,
  raw: string,
): readonly string[] => {
  const otherExports = R.pipe(values, R.map(R.prop('name')), R.unique(), R.filter((value) => value !== name))
  const badImports = R.filter(importsOf(file), ({ module }) => !ALLOWED_IMPORT.test(module))
  const wideFlow = R.filter(doc.flow.split('\n'), (line) => line.length > MAX_FLOW_WIDTH)
  const checks: ReadonlyArray<readonly [boolean, string]> = [
    [values.length === 0 || !values.some((value) => value.name === name), `exports no value named ${name}, the file's name`],
    [otherExports.length > 0, `exports ${R.join(otherExports, ', ')} besides ${name}: one function per file`],
    [raw === '', `has no /** comment */ right above ${name}`],
    [raw !== '' && doc.summary === '', 'has no one-line summary at the top of its comment'],
    [doc.summary.length > MAX_SUMMARY_LENGTH, `summary is ${doc.summary.length} characters, keep it under ${MAX_SUMMARY_LENGTH}`],
    [raw !== '' && doc.useWhen === '', 'has no "Use when:" paragraph'],
    [raw !== '' && doc.example === '', 'has no @example with a ```ts fence'],
    [raw !== '' && doc.tags.length === 0, 'has no @tags line'],
    [badImports.length > 0, `imports ${R.join(R.map(badImports, R.prop('module')), ', ')}: only remeda and @ontologyio/receta/* keep an asset copyable`],
    [!composesOf(file).some((entry) => !entry.startsWith('R.')), 'uses no Receta function: an asset composes Receta'],
    [wideFlow.length > 0, `flow diagram has lines over ${MAX_FLOW_WIDTH} columns`],
  ]
  return R.pipe(checks, R.filter(([failed]) => failed), R.map(([, message]) => message))
}

export const readAsset = async (absolutePath: string): Promise<Asset> => {
  const source = await readFile(absolutePath, 'utf8')
  const name = basename(absolutePath, '.ts')
  const file = ts.createSourceFile(absolutePath, source, ts.ScriptTarget.ES2022, true)
  const values = exportedValues(file)
  const own = R.filter(values, (value) => value.name === name)
  const raw = R.pipe(own, R.first(), (first) => (first ? leadingDoc(file, first.node) : ''))
  const doc = parseDoc(raw)
  return {
    name,
    category: basename(dirname(absolutePath)),
    path: relative(ROOT, absolutePath),
    source,
    doc,
    signatures: signaturesOf(file, R.map(own, R.prop('node'))),
    ...ioOf(file, R.map(own, R.prop('node'))),
    composes: composesOf(file),
    problems: problemsOf(name, file, values, doc, raw),
  }
}

/**
 * `text` is a category and `maskEmail` an asset name, matched whole, so `text` doesn't also
 * pick up `withErrorContext`. A filter with a slash is part of a path: `parse/parsePort`.
 */
const matchesFilter = (path: string, filter: string): boolean => {
  if (filter.includes('/')) return path.includes(filter)
  const [, category = '', name = ''] = path.replace(/\.ts$/, '').split('/')
  return filter === category || filter === name
}

const IS_ASSET = /^src\/[a-z]+\/[a-z][A-Za-z0-9]*\.ts$/

/** Every asset under src, or those whose path contains one of the filters. */
export const readAssets = async (filters: readonly string[] = []): Promise<readonly Asset[]> => {
  const paths = R.pipe(
    await Array.fromAsync(new Glob('src/*/*.ts').scan({ cwd: ROOT })),
    R.filter((path) => IS_ASSET.test(path) && !path.endsWith('/index.ts')),
    R.filter((path) => filters.length === 0 || filters.some((filter) => matchesFilter(path, filter))),
    R.sortBy(R.identity()),
  )
  return mapAsyncOrThrow(paths, (path) => readAsset(join(ROOT, path)), { concurrency: 16 })
}
