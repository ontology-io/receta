// Checks every code example in the docs against the published package, the way a reader
// would use it, in two steps.
//
// Compile: examples are often fragments, so a name nobody declared is resolved like a
// reader would: an import from earlier on the page, then the module the page teaches, then
// any Receta module. Anything still unknown is an imaginary helper and becomes `any`. Only
// ECMAScript itself is typed, so browser and Node globals are imaginary too. A wrong import,
// a missing export or a misused API fails, and `fetchUser` doesn't.
//
// Run: an example with no imaginary helpers really runs, and each `// => Ok(10)` claim in
// it is compared with what came back. A claim that isn't a value, like `// => 6 (doubled)`,
// can't be checked and is counted.
//
// A fence marked `nocheck` is skipped and counted. Pass parts of page paths to see only
// those pages' problems. Run `bun run check:examples`. Start at check.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { mapAsync } from '@ontologyio/receta/async'
import { isOk } from '@ontologyio/receta/result'
import { $, Glob } from 'bun'
import * as R from 'remeda'
import ts from 'typescript'
import { withClaims } from '../src/lib/docs/claims'
import {
  type Example,
  isRealProblem,
  isUndeclaredName,
  optOutCount,
  pageExamples,
  pageModule,
} from '../src/lib/docs/examples'

const WEBSITE = join(import.meta.dir, '..')
const CONTENT = join(WEBSITE, 'content/docs')

// The READMEs are the first examples most people see, on GitHub and on npm.
const READMES = ['../../../README.md', '../../../packages/receta/README.md']
const VIRTUAL_DIR = join(WEBSITE, '.examples')
// Each run gets its own folder, so two checks can run side by side.
const RUN_DIR = join(VIRTUAL_DIR, `run-${process.pid}`)

// Long enough for a retry with a short delay, short enough to skip a real wait.
const RUN_TIMEOUT_SECONDS = 4
const RUNS_AT_ONCE = 8

const HARNESS = `import { deepEquals } from 'bun'
import { ok as __ok, err as __err } from '@ontologyio/receta/result'
import { some as __some, none as __none } from '@ontologyio/receta/option'
import { valid as __valid, invalid as __invalid } from '@ontologyio/receta/validation'
Object.assign(globalThis, { __ok, __err, __some, __none, __valid, __invalid })
const show = (value) => { try { return Bun.inspect(value, { depth: 6 }) } catch { return String(value) } }
globalThis.__claim = async (line, readActual, readExpected) => {
  let expected
  try { expected = readExpected() } catch { console.log(JSON.stringify({ kind: 'unverifiable', line })); return }
  let actual
  try { actual = await readActual() } catch (error) {
    console.log(JSON.stringify({ kind: 'failed', line, expected: show(expected), actual: 'threw ' + show(error?.message ?? error) }))
    return
  }
  const passed = Bun.deepEquals(actual, expected)
  console.log(JSON.stringify({ kind: passed ? 'passed' : 'failed', line, expected: show(expected), actual: show(actual) }))
}
`

const MODULES = [
  'result', 'option', 'async', 'validation', 'predicate', 'collection', 'object', 'string',
  'number', 'memo', 'lens', 'compare', 'function',
] as const

const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2023.d.ts'],
  jsx: ts.JsxEmit.Preserve,
  types: [],
  strict: true,
  // A callback's parameter is often typed by an imaginary helper, so it can't be inferred.
  noImplicitAny: false,
  skipLibCheck: true,
  noEmit: true,
  allowJs: false,
}

type Export = { readonly module: string; readonly isValue: boolean }
type Exports = ReadonlyMap<string, readonly Export[]>
type VirtualFile = { readonly path: string; readonly example: Example; readonly source: string }
type Problem = { readonly at: string; readonly code: string; readonly message: string }
type RunLine = {
  readonly kind: 'passed' | 'failed' | 'unverifiable'
  readonly line: number
  readonly expected?: string
  readonly actual?: string
}
type RunTotals = { readonly passed: number; readonly unverifiable: number; readonly ran: number }

const fileName = ({ page, line, isTsx }: Example): string =>
  join(VIRTUAL_DIR, `${page.replaceAll('/', '__')}-${line}.${isTsx ? 'tsx' : 'ts'}`)

const compile = (files: readonly VirtualFile[], oldProgram?: ts.Program): ts.Program => {
  const bySource = new Map(R.map(files, (file) => [file.path, file.source] as const))
  const host = ts.createCompilerHost(COMPILER_OPTIONS)
  const { fileExists, readFile: read, getSourceFile } = host
  host.fileExists = (path) => bySource.has(path) || fileExists(path)
  host.readFile = (path) => bySource.get(path) ?? read(path)
  host.getSourceFile = (path, languageVersion) => {
    const source = bySource.get(path)
    return source === undefined
      ? getSourceFile(path, languageVersion)
      : ts.createSourceFile(path, source, languageVersion, true)
  }
  return ts.createProgram(R.map(files, ({ path }) => path), COMPILER_OPTIONS, host, oldProgram)
}

const readExports = (): Exports => {
  const entry = (name: string): string => `${VIRTUAL_DIR}/exports-${name}.ts`
  const files = R.map(MODULES, (name) => ({
    path: entry(name),
    source: `export * from '@ontologyio/receta/${name}'`,
    example: { page: '', line: 0, code: '', isTsx: false },
  }))
  const program = compile(files)
  const checker = program.getTypeChecker()
  const found = new Map<string, Export[]>()
  for (const name of MODULES) {
    const sourceFile = program.getSourceFile(entry(name))
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile)
    for (const symbol of moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []) {
      const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
      const entries = found.get(symbol.getName()) ?? []
      found.set(symbol.getName(), [
        ...entries,
        { module: name, isValue: (resolved.flags & ts.SymbolFlags.Value) !== 0 },
      ])
    }
  }
  return found
}

const isTypePosition = (node: ts.Node): boolean =>
  ts.isTypeReferenceNode(node.parent) || ts.isExpressionWithTypeArguments(node.parent)

const nodeAt = (sourceFile: ts.SourceFile, position: number): ts.Node => {
  const visit = (node: ts.Node): ts.Node =>
    ts.forEachChild(node, (child) =>
      child.getStart(sourceFile) <= position && position < child.getEnd() ? visit(child) : undefined,
    ) ?? node
  return visit(sourceFile)
}

type Unknown = { readonly name: string; readonly isType: boolean; readonly typeArguments: number }

const unknownNames = (program: ts.Program, file: VirtualFile): readonly Unknown[] => {
  const sourceFile = program.getSourceFile(file.path)
  if (!sourceFile) return []
  return R.pipe(
    program.getSemanticDiagnostics(sourceFile),
    R.filter(({ code }) => isUndeclaredName(code)),
    R.map(({ start = 0 }) => {
      const node = nodeAt(sourceFile, start)
      const parent = node.parent
      return {
        name: node.getText(sourceFile),
        isType: isTypePosition(node),
        typeArguments: ts.isTypeReferenceNode(parent) ? (parent.typeArguments?.length ?? 0) : 0,
      }
    }),
    R.uniqueBy(({ name, isType }) => `${name}:${isType}`),
  )
}

const importsIn = (code: string): readonly string[] =>
  [...code.matchAll(/^import\s[^;\n]*?from\s+['"][^'"]+['"];?$/gm)].map(([line]) => line)

const importedNames = (line: string): readonly string[] => {
  const named = /\{([^}]*)\}/.exec(line)?.[1] ?? ''
  const names = R.map(named.split(','), (part) =>
    (part.replace(/^\s*type\s+/, '').split(/\s+as\s+/).at(-1) ?? '').trim(),
  )
  const namespace = /\*\s+as\s+(\w+)/.exec(line)?.[1] ?? ''
  return R.filter([...names, namespace], Boolean)
}

const declarationFor = (
  { name, isType, typeArguments }: Unknown,
  page: string,
  earlierImports: readonly string[],
  exports: Exports,
): string => {
  if (name === 'R') return `import * as R from 'remeda'`
  if (name === 'pipe') return `import { pipe } from 'remeda'`
  const earlier = R.find(earlierImports, (line) => importedNames(line).includes(name))
  if (earlier) return earlier
  const candidates = exports.get(name) ?? []
  const preferred =
    R.find(candidates, ({ module }) => module === pageModule(page)) ?? candidates[0]
  if (preferred) return `import { ${preferred.isValue ? '' : 'type '}${name} } from '@ontologyio/receta/${preferred.module}'`
  if (!isType) return `declare const ${name}: any`
  const parameters = R.times(typeArguments, (index) => `T${index} = any`)
  return `type ${name}${parameters.length > 0 ? `<${R.join(parameters, ', ')}>` : ''} = any`
}

const withDeclarations = (
  file: VirtualFile,
  names: readonly Unknown[],
  earlierImports: readonly string[],
  exports: Exports,
): VirtualFile => {
  const declarations = R.pipe(
    names,
    R.map((name) => declarationFor(name, file.example.page, earlierImports, exports)),
    R.unique(),
    R.join('\n'),
  )
  return { ...file, source: `${file.source}\n${declarations}\nexport {}\n` }
}

const earlierImportsFor = (example: Example, all: readonly Example[]): readonly string[] =>
  R.pipe(
    all,
    R.filter(({ page, line }) => page === example.page && line < example.line),
    R.flatMap(({ code }) => importsIn(code)),
  )

const problemsIn = (program: ts.Program, file: VirtualFile): readonly Problem[] => {
  const sourceFile = program.getSourceFile(file.path)
  if (!sourceFile) return []
  const { example } = file
  const lastLine = example.code.split('\n').length
  return R.pipe(
    [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)],
    R.map((diagnostic) => {
      const { line } = sourceFile.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
      return {
        line,
        code: diagnostic.code,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
      }
    }),
    R.filter(({ code, message, line }) => isRealProblem(code, message) && line < lastLine),
    R.map(({ line, code, message }) => ({
      at: `${relative(WEBSITE, join(CONTENT, example.page))}:${example.line + line}`,
      code: `TS${code}`,
      message,
    })),
  )
}

/** Runnable means no imaginary helpers, no compile problems and no name declared twice. */
const isRunnable = (program: ts.Program, file: VirtualFile): boolean => {
  const sourceFile = program.getSourceFile(file.path)
  if (!sourceFile || file.source.includes('declare const ')) return false
  const diagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ]
  return diagnostics.length === 0
}

const runOne = async (file: VirtualFile): Promise<{ lines: readonly RunLine[]; ran: boolean }> => {
  const { code, claims } = withClaims(file.source)
  if (claims === 0) return { lines: [], ran: false }
  const path = join(RUN_DIR, `${file.path.split('/').at(-1)}`)
  await writeFile(path, `import './harness.ts'\n${code}\n`)
  const { stdout, exitCode } =
    await $`timeout ${RUN_TIMEOUT_SECONDS} bun run ${path}`.nothrow().quiet()
  const lines = R.pipe(
    stdout.toString().split('\n'),
    R.filter((line) => line.startsWith('{"kind"')),
    R.map((line) => JSON.parse(line) as RunLine),
  )
  return { lines, ran: exitCode !== 124 }
}

const claimProblems = ({ example }: VirtualFile, lines: readonly RunLine[]): readonly Problem[] =>
  R.pipe(
    lines,
    R.filter(({ kind }) => kind === 'failed'),
    R.map(({ line, expected, actual }) => ({
      at: `${relative(WEBSITE, join(CONTENT, example.page))}:${example.line + line}`,
      code: 'CLAIM',
      message: `says ${expected}, got ${actual}`,
    })),
  )

const runExamples = async (
  files: readonly VirtualFile[],
): Promise<{ readonly problems: readonly Problem[]; readonly totals: RunTotals }> => {
  await rm(RUN_DIR, { recursive: true, force: true })
  await mkdir(RUN_DIR, { recursive: true })
  await writeFile(join(RUN_DIR, 'harness.ts'), HARNESS)
  const outcome = await mapAsync(
    files,
    async (file) => ({ file, ...(await runOne(file)) }),
    { concurrency: RUNS_AT_ONCE },
  )
  const runs = isOk(outcome) ? outcome.value : []
  const allLines = R.flatMap(runs, ({ lines }) => lines)
  return {
    problems: R.flatMap(runs, ({ file, lines }) => claimProblems(file, lines)),
    totals: {
      ran: R.pipe(runs, R.filter(({ ran }) => ran), R.length()),
      passed: R.pipe(allLines, R.filter(({ kind }) => kind === 'passed'), R.length()),
      unverifiable: R.pipe(allLines, R.filter(({ kind }) => kind === 'unverifiable'), R.length()),
    },
  }
}

const report = (problems: readonly Problem[], summary: string): void => {
  const filters = R.filter(process.argv.slice(2), (argument) => !argument.startsWith('--'))
  const shown =
    filters.length > 0
      ? R.filter(problems, ({ at }) => filters.some((filter) => at.includes(filter)))
      : problems
  if (!process.argv.includes('--summary')) {
    for (const { at, code, message } of shown) console.log(`${at}  ${code}  ${message.slice(0, 200)}`)
  }
  console.log(`\n${summary}`)
}

const check = async (): Promise<void> => {
  const guides = await Array.fromAsync(new Glob('**/*.mdx').scan({ cwd: CONTENT }))
  const pagePaths = [...guides, ...READMES]
  const pages = await Promise.all(
    R.map(pagePaths, async (page) => ({ page, text: await readFile(join(CONTENT, page), 'utf8') })),
  )
  const examples = R.flatMap(pages, ({ page, text }) => pageExamples(page, text))
  const optedOut = R.sumBy(pages, ({ text }) => optOutCount(text))
  const exports = readExports()
  const files = R.map(examples, (example) => ({
    example,
    path: fileName(example),
    source: `${example.code}\nexport {}\n`,
  }))
  const firstPass = compile(files)
  const completed = R.map(files, (file) =>
    withDeclarations(
      { ...file, source: file.example.code },
      unknownNames(firstPass, file),
      earlierImportsFor(file.example, examples),
      exports,
    ),
  )
  const secondPass = compile(completed, firstPass)
  const compileProblems = R.flatMap(completed, (file) => problemsIn(secondPass, file))
  const runnable = R.filter(completed, (file) => isRunnable(secondPass, file))
  const { problems: failedClaims, totals } = process.argv.includes('--no-run')
    ? { problems: [], totals: { ran: 0, passed: 0, unverifiable: 0 } }
    : await runExamples(runnable)
  await rm(RUN_DIR, { recursive: true, force: true })
  const problems = [...compileProblems, ...failedClaims]
  report(
    problems,
    `${examples.length} examples compiled, ${optedOut} opted out, ${compileProblems.length} compile problems. ` +
      `${totals.ran} ran: ${totals.passed} claims held, ${failedClaims.length} failed, ${totals.unverifiable} not checkable.`,
  )
  process.exitCode = problems.length > 0 ? 1 : 0
}

await check()
