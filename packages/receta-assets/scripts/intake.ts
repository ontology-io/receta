// Brings an asset candidate into the catalog so a reviewer can decide on it. Candidates are
// issues on ontology-io/receta: agents in other projects open them with the receta-skills
// `assets` skill, and people with the "Asset candidate" issue form.
//
//   bun scripts/intake.ts 123              read issue #123 with gh
//   bun scripts/intake.ts --file body.md   read an issue body saved to a file
//
// It writes the file to src/<category>/<name>.ts, runs the full check on it, and lists the
// closest assets already in the catalog. It sends nothing: accepting is a commit that says
// "Closes #123", declining is deleting the file and closing the issue with the reason.
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { oneOf } from '@ontologyio/receta/predicate'
import { err, isErr, map, mapErr, ok, parseJSON, type Result, tryCatchAsync } from '@ontologyio/receta/result'
import * as R from 'remeda'
import {
  type Candidate,
  findAsset,
  loadCatalog,
  parseCandidate,
  REPO,
  search,
} from '../../../plugins/receta-skills/skills/assets/scripts/assets'
import { CATEGORIES, ROOT, readAsset } from './assets'

type Source = { readonly body: string; readonly issue: string }

const isCategory = oneOf<string>(CATEGORIES)

const fail = (message: string): number => {
  console.error(message)
  return 1
}

const readIssue = async (reference: string, repo: string): Promise<Result<Source, string>> => {
  const child = Bun.spawn(['gh', 'issue', 'view', reference, '--repo', repo, '--json', 'body,number'], {
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const output = await new Response(child.stdout).text()
  const errors = await new Response(child.stderr).text()
  if ((await child.exited) !== 0) return err(`gh issue view ${reference}: ${errors.trim()}`)
  return R.pipe(
    parseJSON<{ readonly body: string; readonly number: number }>(output),
    map((issue) => ({ body: issue.body, issue: `#${issue.number}` })),
    mapErr(() => `gh answered something other than an issue: ${output.slice(0, 200)}`),
  )
}

const readSource = async (args: readonly string[]): Promise<Result<Source, string>> => {
  const fileAt = R.findIndex(args, (arg) => arg === '--file')
  const file = args[fileAt + 1]
  if (fileAt >= 0 && file !== undefined) {
    return R.pipe(
      await tryCatchAsync(() => readFile(file, 'utf8')),
      map((body) => ({ body, issue: '' })),
      mapErr(() => `Can't read ${file}`),
    )
  }
  const reference = R.find(args, (arg) => !arg.startsWith('--'))
  return reference === undefined
    ? err('Usage: bun scripts/intake.ts <issue number or URL> | --file <body.md>')
    : readIssue(reference, process.env['RECETA_ASSETS_REPO'] ?? REPO)
}

/** A candidate the catalog can take: a known category and a name no asset uses yet. */
const admissible = async (candidate: Candidate): Promise<Result<Candidate, string>> => {
  const catalog = await loadCatalog({ catalog: ROOT })
  const taken = findAsset(catalog.assets, candidate.name)
  if (!isCategory(candidate.category)) {
    return err(`Unknown category "${candidate.category}". Pick one of: ${R.join(CATEGORIES, ', ')}`)
  }
  if (taken !== undefined) {
    return err(`${taken.category}/${taken.name} already exists. Ask for a name that says what differs.`)
  }
  return existsSync(join(ROOT, 'src', candidate.category, `${candidate.name}.ts`))
    ? err(`src/${candidate.category}/${candidate.name}.ts exists but isn't in the catalog: run bun scripts/catalog.ts`)
    : ok(candidate)
}

const runCheck = async (name: string): Promise<number> =>
  Bun.spawn(['bun', 'scripts/check.ts', name], { cwd: ROOT, stdout: 'inherit', stderr: 'inherit' }).exited

const closestTo = async (path: string, name: string): Promise<readonly string[]> => {
  const [catalog, asset] = [await loadCatalog({ catalog: ROOT }), await readAsset(path)]
  return R.pipe(
    search(catalog.assets, R.join([name, asset.doc.summary, ...asset.doc.tags], ' '), { limit: 5 }),
    R.map((hit) => `  ${hit.asset.category}/${hit.asset.name}: ${hit.asset.summary}`),
  )
}

const nextSteps = (candidate: Candidate, path: string, issue: string, passed: boolean): string => {
  const index = `src/${candidate.category}/index.ts`
  const closes = issue === '' ? '' : ` -m "Closes ${issue}"`
  return R.join(
    [
      passed ? 'The check passed.' : 'The check found problems. Fix them, or ask the author to.',
      '',
      'Accept:',
      '  bun scripts/catalog.ts',
      `  git add ${path} ${index} catalog.json CATALOG.md`,
      `  git commit -m "feat(assets): add ${candidate.category}/${candidate.name}"${closes}`,
      '',
      'Decline:',
      `  rm ${path}`,
      `  then close ${issue || 'the issue'} with the reason: a near-duplicate, too specific to one project, …`,
    ],
    '\n',
  )
}

const intake = async (args: readonly string[]): Promise<number> => {
  const source = await readSource(args)
  if (isErr(source)) return fail(source.error)
  const parsed = parseCandidate(source.value.body)
  if (!parsed.ok) return fail(`Not a candidate: ${parsed.problem}`)
  const candidate = await admissible(parsed.candidate)
  if (isErr(candidate)) return fail(candidate.error)

  const { category, name, why, from, code } = candidate.value
  const absolute = join(ROOT, 'src', category, `${name}.ts`)
  const path = relative(ROOT, absolute)
  await writeFile(absolute, code)
  console.log(`${source.value.issue || 'Candidate'} → ${path}`)
  console.log(`Why: ${why || '(not given)'}`)
  if (from !== '') console.log(`Adapted from: ${from}`)
  console.log('')

  const passed = (await runCheck(name)) === 0
  console.log(`\nClosest assets already in the catalog:\n${R.join(await closestTo(absolute, name), '\n')}\n`)
  console.log(nextSteps(candidate.value, path, source.value.issue, passed))
  return passed ? 0 : 1
}

process.exit(await intake(process.argv.slice(2)))
