// Checks the docs examples against the library as it is in this checkout, instead of the
// copy installed from npm. Run `bun run check:examples:workspace`.
//
// The reference pages are generated from the JSDoc in packages/receta. On a branch that
// fixes a function, they describe the fix, and the published package doesn't have it yet,
// so `check:examples` fails on every such example until the next release. This builds the
// workspace package, puts that build where the website's copy of Receta is installed, runs
// the same check, and puts the published copy back.
//
// Arguments are passed on to check-examples.ts, so parts of page paths still narrow it.
//
// It imports nothing from Receta, because it replaces the folder Receta is installed in.
import { existsSync, renameSync, rmSync } from 'node:fs'
import { cp, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { $ } from 'bun'

const WEBSITE = join(import.meta.dir, '..')
const WORKSPACE_PACKAGE = join(WEBSITE, '../packages/receta')
const INSTALLED = join(WEBSITE, 'node_modules/@ontologyio/receta')
// Next to the installed copy, so setting it aside and putting it back are renames.
const PUBLISHED = join(WEBSITE, 'node_modules/@ontologyio/.receta-published')

const INTERRUPTED = 130

function putPublishedBack(): void {
  if (!existsSync(PUBLISHED)) return

  rmSync(INSTALLED, { recursive: true, force: true })
  renameSync(PUBLISHED, INSTALLED)
}

async function installWorkspaceBuild(): Promise<void> {
  renameSync(INSTALLED, PUBLISHED)
  await mkdir(INSTALLED, { recursive: true })
  await cp(join(WORKSPACE_PACKAGE, 'package.json'), join(INSTALLED, 'package.json'))
  await cp(join(WORKSPACE_PACKAGE, 'dist'), join(INSTALLED, 'dist'), { recursive: true })
}

// A run that was killed before it could clean up leaves the published copy set aside.
putPublishedBack()

if (!existsSync(INSTALLED)) {
  console.error('Receta is not installed in website/node_modules. Run `bun install` in website/ first.')
  process.exit(1)
}

// Ctrl-C skips `finally`, and the next command here would then run on the workspace build.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    putPublishedBack()
    process.exit(INTERRUPTED)
  })
}

console.log('Building packages/receta…')
await $`bunx tsup`.cwd(WORKSPACE_PACKAGE).quiet()

try {
  await installWorkspaceBuild()
  console.log('Checking the examples against the workspace build of Receta.\n')

  await $`bun scripts/generate-reference.ts`.cwd(WEBSITE)
  const check = await $`bun scripts/check-examples.ts ${process.argv.slice(2)}`.cwd(WEBSITE).nothrow()
  process.exitCode = check.exitCode
} finally {
  putPublishedBack()
}
