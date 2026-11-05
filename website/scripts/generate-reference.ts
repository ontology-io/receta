// Writes one reference page per module from the library source, so signatures, summaries
// and examples can't drift from the code. Pages land in content/docs/reference and are
// never edited by hand. Runs before every build. Pass module names to write only those.
// Start at generateReference.
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as R from 'remeda'
import ts from 'typescript'
import { commentExamples, type ExportDoc, exportSection } from '../src/lib/docs/reference'

const LIBRARY_SOURCE = join(import.meta.dir, '../../packages/receta/src')
const OUT_DIR = join(import.meta.dir, '../content/docs/reference')

/** Module name, title, and whether it has guides to link to. */
const MODULES = [
  ['result', 'Result', true],
  ['option', 'Option', true],
  ['async', 'Async', true],
  ['validation', 'Validation', true],
  ['predicate', 'Predicate', true],
  ['collection', 'Collection', true],
  ['object', 'Object', true],
  ['string', 'String', false],
  ['number', 'Number', false],
  ['memo', 'Memo', true],
  ['lens', 'Lens', true],
  ['compare', 'Compare', true],
  ['function', 'Function', true],
] as const

type Module = (typeof MODULES)[number]

const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
}

const PRINT_FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature

const generateReference = async (only: readonly string[]): Promise<void> => {
  const entryFile = ([name]: Module): string => join(LIBRARY_SOURCE, name, 'index.ts')
  const program = ts.createProgram(R.map(MODULES, entryFile), COMPILER_OPTIONS)
  const checker = program.getTypeChecker()
  const wanted = R.filter(MODULES, ([name]) => only.length === 0 || only.includes(name))
  await mkdir(OUT_DIR, { recursive: true })
  for (const module of wanted) {
    const docs = moduleExports(program, checker, entryFile(module))
    await writeFile(join(OUT_DIR, `${module[0]}.mdx`), modulePage(module, docs))
  }
  await writeFile(join(OUT_DIR, 'meta.json'), navigation())
}

const navigation = (): string =>
  JSON.stringify({ title: 'Reference', pages: R.map(MODULES, ([name]) => name) }, null, 2)

const moduleExports = (
  program: ts.Program,
  checker: ts.TypeChecker,
  file: string,
): readonly ExportDoc[] => {
  const sourceFile = program.getSourceFile(file)
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile)
  if (!moduleSymbol) throw new Error(`No exports found in ${file}`)
  return R.pipe(
    checker.getExportsOfModule(moduleSymbol),
    R.map((symbol) => exportDoc(checker, symbol)),
    R.sortBy(({ name }) => name.toLowerCase()),
  )
}

const resolveAlias = (checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol =>
  symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol

const exportDoc = (checker: ts.TypeChecker, exported: ts.Symbol): ExportDoc => {
  const symbol = resolveAlias(checker, exported)
  const name = exported.getName()
  const isValue = (symbol.flags & ts.SymbolFlags.Value) !== 0
  const declaration = symbol.declarations?.[0]
  const type = declaration && isValue ? checker.getTypeOfSymbolAtLocation(symbol, declaration) : null
  const callSignatures = type ? type.getCallSignatures() : []
  const tags = symbol.getJsDocTags(checker)
  const shared = {
    name,
    summary: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    examples: R.unique(R.flatMap(symbol.declarations ?? [], declarationExamples)),
    seeAlso: R.map(R.unique(tagTexts(tags, 'see')), seeAlsoName),
  }
  if (callSignatures.length > 0) return functionDoc(checker, shared, name, callSignatures)
  if (type) {
    const printed = `const ${name}: ${checker.typeToString(type, undefined, PRINT_FLAGS)}`
    return { ...shared, kind: 'value', signatures: [printed], returnsFunction: [false], returnTypes: [] }
  }
  return { ...shared, kind: 'type', signatures: [typeText(symbol)], returnsFunction: [false], returnTypes: [] }
}

type SharedDoc = Pick<ExportDoc, 'name' | 'summary' | 'examples' | 'seeAlso'>

const functionDoc = (
  checker: ts.TypeChecker,
  shared: SharedDoc,
  name: string,
  signatures: readonly ts.Signature[],
): ExportDoc => ({
  ...shared,
  kind: 'function',
  signatures: R.map(
    signatures,
    (signature) => `function ${name}${checker.signatureToString(signature, undefined, ts.TypeFormatFlags.NoTruncation)}`,
  ),
  returnsFunction: R.map(
    signatures,
    (signature) => checker.getReturnTypeOfSignature(signature).getCallSignatures().length > 0,
  ),
  returnTypes: R.map(signatures, (signature) =>
    checker.typeToString(checker.getReturnTypeOfSignature(signature), undefined, PRINT_FLAGS),
  ),
})

/** The doc comment directly above a declaration, read as raw text. */
const declarationExamples = (declaration: ts.Declaration): readonly string[] => {
  const file = declaration.getSourceFile().text
  const statement = ts.isVariableDeclaration(declaration) ? declaration.parent.parent : declaration
  const comments = ts.getLeadingCommentRanges(file, statement.getFullStart()) ?? []
  const docComment = R.last(R.filter(comments, ({ pos }) => file.startsWith('/**', pos)))
  return docComment ? commentExamples(file.slice(docComment.pos, docComment.end)) : []
}

const tagTexts = (tags: readonly ts.JSDocTagInfo[], tagName: string): readonly string[] =>
  R.pipe(
    tags,
    R.filter(({ name }) => name === tagName),
    R.map(({ text }) => ts.displayPartsToString(text)),
  )

/** "@see map - for the other shape" names `map`. */
const seeAlsoName = (see: string): string => `\`${see.split(/\s+-\s+|\s/)[0] ?? see}\``

const typeText = (symbol: ts.Symbol): string =>
  R.pipe(
    symbol.declarations ?? [],
    R.map((declaration) => stripDocComment(declaration.getText())),
    R.join('\n\n'),
  )

const stripDocComment = (text: string): string =>
  text.replace(/\/\*\*[\s\S]*?\*\/\s*/g, '').replace(/^export\s+/, '')

const section = (title: string, docs: readonly ExportDoc[]): string =>
  docs.length > 0 ? `## ${title}\n\n${R.join(R.map(docs, exportSection), '\n\n')}` : ''

const modulePage = ([name, title, hasGuide]: Module, docs: readonly ExportDoc[]): string => {
  const guide = hasGuide ? ` New here? Start with the [${title} guide](/docs/${name}).` : ''
  const intro = `Everything exported from \`@ontologyio/receta/${name}\`.${guide}`
  const byKind = (kind: ExportDoc['kind']): readonly ExportDoc[] =>
    R.filter(docs, (doc) => doc.kind === kind)
  return R.pipe(
    [
      `---\ntitle: ${title}\ndescription: ${docs.length} exports from @ontologyio/receta/${name}.\n---`,
      '{/* Generated by scripts/generate-reference.ts. Edit the JSDoc in the source instead. */}',
      intro,
      section('Functions', byKind('function')),
      section('Values', byKind('value')),
      section('Types', byKind('type')),
    ],
    R.filter(Boolean),
    R.join('\n\n'),
    (page) => `${page}\n`,
  )
}

await generateReference(process.argv.slice(2))
