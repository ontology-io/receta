// Checks every asset against the contract in AUTHORING.md, so an agent can trust what an
// asset's comment says without reading its body.
//
// Shape: one exported function named like its file, a summary, a "Use when:" paragraph,
// @tags, an @example, and imports from remeda and @ontologyio/receta/* only.
// Lint: the body and the example are Receta-first, with the rules the docs use.
// Types: the asset and its example compile under the repository's strict settings.
// Claims: the example runs, and each `// => value` in it is compared with what came back.
// An asset needs at least two claims, so the comment shows more than the happy path.
//
// Run `bun scripts/check.ts`, or pass parts of paths to check only those: `text`,
// `parse/parsePort`. Start at check.
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import * as R from 'remeda'
import ts from 'typescript'
import { withClaims } from '../../../website/src/lib/docs/claims'
import { lintExample } from '../../../website/src/lib/docs/lint'
import { type Asset, ROOT, readAssets } from './assets'

const OUT = join(ROOT, '.examples')
const TYPES_DIR = join(OUT, 'types')
const RUN_DIR = join(OUT, `run-${process.pid}`)
const MIN_CLAIMS = 2
const RUN_TIMEOUT_MS = 5000
const RUNS_AT_ONCE = 8

// Examples get no secrets, only a PATH to find bun.
const EXAMPLE_ENVIRONMENT = { PATH: process.env['PATH'] ?? '' }

const HARNESS = `import { ok as __ok, err as __err } from '@ontologyio/receta/result'
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

type Problem = { readonly at: string; readonly message: string }
type RunLine = {
  readonly kind: 'passed' | 'failed' | 'unverifiable'
  readonly line: number
  readonly expected?: string
  readonly actual?: string
}
type Report = { readonly asset: Asset; readonly problems: readonly Problem[]; readonly claims: number }

/** The source line of the example's first line, so a problem points into the asset file. */
const exampleStart = ({ source }: Asset): number => {
  const tag = source.indexOf('@example')
  const fence = source.indexOf('```', tag)
  return tag < 0 || fence < 0 ? 1 : source.slice(0, fence).split('\n').length + 1
}

const exampleAt = (asset: Asset, line: number): string => `${asset.path}:${exampleStart(asset) + line - 1}`

/** An example names the asset and `R` without importing them; anything else it imports. */
const prelude = (asset: Asset, from: string): string => {
  const specifier = relative(from, join(ROOT, asset.path)).replace(/\.ts$/, '')
  const local = specifier.startsWith('.') ? specifier : `./${specifier}`
  const importsR = /import \* as R from 'remeda'/.test(asset.doc.example)
  const usesR = /\bR\./.test(asset.doc.example)
  return R.join(
    [
      `import { ${asset.name} } from '${local}'`,
      usesR && !importsR ? `import * as R from 'remeda'` : '',
    ],
    '\n',
  )
}

const exampleFile = (dir: string, asset: Asset): string => join(dir, `${asset.category}__${asset.name}.ts`)

/** Imports must come first, so the prelude's imports go above the example's own. */
const exampleSource = (asset: Asset, dir: string): string =>
  `${prelude(asset, dir)}\n${asset.doc.example}\nexport {}\n`

const PRELUDE_LINES = 2

const compilerOptions = (): ts.CompilerOptions => {
  const configPath = join(ROOT, 'tsconfig.json')
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    },
  })
  return { ...parsed?.options, noEmit: true }
}

const diagnosticProblem = (diagnostic: ts.Diagnostic, at: (line: number) => string): Problem => {
  const { line } = diagnostic.file && diagnostic.start !== undefined
    ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
    : { line: 0 }
  return { at: at(line + 1), message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ') }
}

const typeProblems = (assets: readonly Asset[]): ReadonlyMap<string, readonly Problem[]> => {
  const exampleFiles = R.map(assets, (asset) => exampleFile(TYPES_DIR, asset))
  const program = ts.createProgram(
    [...R.map(assets, (asset) => join(ROOT, asset.path)), ...exampleFiles],
    compilerOptions(),
  )
  const diagnosticsFor = (path: string): readonly ts.Diagnostic[] => {
    const file = program.getSourceFile(path)
    return file ? [...program.getSyntacticDiagnostics(file), ...program.getSemanticDiagnostics(file)] : []
  }
  return new Map(
    R.map(assets, (asset) => [
      asset.path,
      [
        ...R.map(diagnosticsFor(join(ROOT, asset.path)), (diagnostic) =>
          diagnosticProblem(diagnostic, (line) => `${asset.path}:${line}`),
        ),
        ...R.map(diagnosticsFor(exampleFile(TYPES_DIR, asset)), (diagnostic) =>
          diagnosticProblem(diagnostic, (line) => exampleAt(asset, line - PRELUDE_LINES)),
        ),
      ],
    ]),
  )
}

const lintProblems = (asset: Asset): readonly Problem[] => [
  ...R.map(lintExample({ code: asset.source, isTsx: false }), ({ line, message }) => ({
    at: `${asset.path}:${line}`,
    message,
  })),
  ...R.map(lintExample({ code: asset.doc.example, isTsx: false }), ({ line, message }) => ({
    at: exampleAt(asset, line),
    message: `example: ${message}`,
  })),
]

const parseRunLines = (stdout: string): readonly RunLine[] =>
  R.pipe(
    stdout.split('\n'),
    R.filter((line) => line.startsWith('{"kind"')),
    R.map((line) => JSON.parse(line) as RunLine),
  )

const runExample = async (asset: Asset): Promise<{ readonly problems: readonly Problem[]; readonly claims: number }> => {
  const { code: claimed, claims } = withClaims(asset.doc.example)
  // `await task() // => Ok(1)` is a claim too: the harness awaits whatever the claim reads.
  const code = claimed.replaceAll('() => (await ', 'async () => (await ')
  if (claims < MIN_CLAIMS) {
    const message = `example has ${claims} checked \`// =>\` claim(s), it needs ${MIN_CLAIMS}`
    return { problems: [{ at: exampleAt(asset, 1), message }], claims }
  }
  const path = exampleFile(RUN_DIR, asset)
  await writeFile(path, `import './harness.ts'\n${prelude(asset, RUN_DIR)}\n${code}\nexport {}\n`)
  const child = Bun.spawn(['bun', 'run', path], {
    env: EXAMPLE_ENVIRONMENT,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: RUN_TIMEOUT_MS,
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])
  const lines = parseRunLines(stdout)
  const toLine = (line: number): string => exampleAt(asset, line + 1)
  const failed = R.pipe(
    lines,
    R.filter(({ kind }) => kind !== 'passed'),
    R.map(({ kind, line, expected, actual }) => ({
      at: toLine(line),
      message: kind === 'failed' ? `says ${expected}, got ${actual}` : 'claim is not a value the check can compare',
    })),
  )
  const crash = exitCode === 0
    ? []
    : [{
        at: exampleAt(asset, 1),
        message: child.signalCode
          ? `example ran past ${RUN_TIMEOUT_MS}ms`
          : (stderr.match(/^.*(?:error|Error).*$/m)?.[0] ?? `example exited with ${exitCode}`).trim(),
      }]
  const missing = lines.length < claims && exitCode === 0
    ? [{ at: exampleAt(asset, 1), message: `${claims - lines.length} claim(s) never ran` }]
    : []
  return { problems: [...failed, ...crash, ...missing], claims }
}

const shapeProblems = (asset: Asset): readonly Problem[] =>
  R.map(asset.problems, (message) => ({ at: asset.path, message }))

const prepare = async (assets: readonly Asset[]): Promise<void> => {
  await mkdir(TYPES_DIR, { recursive: true })
  await mkdir(RUN_DIR, { recursive: true })
  await writeFile(join(RUN_DIR, 'harness.ts'), HARNESS)
  await mapAsyncOrThrow(assets, (asset) => writeFile(exampleFile(TYPES_DIR, asset), exampleSource(asset, TYPES_DIR)), {
    concurrency: 32,
  })
}

const print = (reports: readonly Report[]): void => {
  R.forEach(reports, ({ asset, problems }) => {
    const mark = problems.length === 0 ? '✓' : '✗'
    console.log(`${mark} ${asset.category}/${asset.name}`)
    R.forEach(problems, ({ at, message }) => console.log(`    ${at}  ${message}`))
  })
  const failing = R.filter(reports, ({ problems }) => problems.length > 0)
  const claims = R.sumBy(reports, R.prop('claims'))
  console.log(
    `\n${reports.length} assets, ${claims} claims checked, ${failing.length} with problems`,
  )
}

const check = async (filters: readonly string[]): Promise<number> => {
  const assets = await readAssets(filters)
  if (assets.length === 0) {
    console.log(`No assets match ${R.join(filters, ', ') || 'src/*/*.ts'}`)
    return filters.length === 0 ? 0 : 1
  }
  await prepare(assets)
  const types = typeProblems(assets)
  const runs = await mapAsyncOrThrow(assets, runExample, { concurrency: RUNS_AT_ONCE })
  await rm(RUN_DIR, { recursive: true, force: true })
  const reports = R.map(R.zip(assets, runs), ([asset, run]) => ({
    asset,
    claims: run.claims,
    problems: [...shapeProblems(asset), ...(types.get(asset.path) ?? []), ...lintProblems(asset), ...run.problems],
  }))
  print(reports)
  return reports.some(({ problems }) => problems.length > 0) ? 1 : 0
}

process.exit(await check(process.argv.slice(2)))

