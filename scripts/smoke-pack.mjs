#!/usr/bin/env node
/**
 * Pack-and-load smoke test for @ontologyio/receta.
 *
 * Packs packages/receta, installs the tarball into throwaway CommonJS and ESM
 * projects, require()s / import()s every exported subpath, and type-checks a
 * node10-resolution TypeScript consumer. Run `nx run receta:build` first.
 *
 * Usage: node scripts/smoke-pack.mjs [--tarball <path>]
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkgDir = join(root, 'packages', 'receta')
const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
const subpaths = Object.keys(pkg.exports).map((key) => `${pkg.name}/${key.slice(2)}`)

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' })

const work = mkdtempSync(join(tmpdir(), 'receta-smoke-'))

const tarballArg = process.argv.indexOf('--tarball')
let tarball
if (tarballArg !== -1) {
  tarball = resolve(process.argv[tarballArg + 1])
} else {
  const packDir = join(work, 'pack')
  mkdirSync(packDir)
  run('npm', ['pack', '--pack-destination', packDir], pkgDir)
  tarball = join(packDir, readdirSync(packDir).find((f) => f.endsWith('.tgz')))
}
console.log(`tarball: ${tarball}`)

const makeProject = (name, extra = {}) => {
  const dir = join(work, name)
  mkdirSync(dir)
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, private: true, ...extra }))
  run('npm', ['install', '--no-audit', '--no-fund', tarball], dir)
  return dir
}

// CommonJS consumer
const cjsDir = makeProject('cjs-consumer', { type: 'commonjs' })
writeFileSync(
  join(cjsDir, 'check.js'),
  `const subpaths = ${JSON.stringify(subpaths)}
for (const s of subpaths) {
  const m = require(s)
  if (Object.keys(m).length === 0) throw new Error('empty exports: ' + s)
}
const { ok, map } = require('${pkg.name}/result')
const r = map(ok(2), (x) => x * 2)
if (r.value !== 4) throw new Error('result.map broken')
console.log('cjs ok: ' + subpaths.length + ' subpaths')
`
)
console.log(run('node', ['check.js'], cjsDir).trim())

// ESM consumer
const esmDir = makeProject('esm-consumer', { type: 'module' })
writeFileSync(
  join(esmDir, 'check.mjs'),
  `const subpaths = ${JSON.stringify(subpaths)}
for (const s of subpaths) {
  const m = await import(s)
  if (Object.keys(m).length === 0) throw new Error('empty exports: ' + s)
}
const { ok, map } = await import('${pkg.name}/result')
if (map(ok(2), (x) => x * 2).value !== 4) throw new Error('result.map broken')
console.log('esm ok: ' + subpaths.length + ' subpaths')
`
)
console.log(run('node', ['check.mjs'], esmDir).trim())

// TypeScript consumer using legacy node10 resolution (no "exports" support)
const tsDir = makeProject('ts-node10-consumer', { type: 'commonjs' })
writeFileSync(
  join(tsDir, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      module: 'commonjs',
      moduleResolution: 'node10',
      target: 'es2022',
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      types: [],
    },
    files: ['index.ts'],
  })
)
writeFileSync(
  join(tsDir, 'index.ts'),
  `import { ok, err, map, type Result } from '${pkg.name}/result'
import { fromNullable, type Option } from '${pkg.name}/option'

const r: Result<number, string> = map(ok(1), (n) => n + 1)
const e: Result<number, string> = err('nope')
const o: Option<string> = fromNullable('x')
export { r, e, o }
`
)
const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc')
run('node', [tsc, '-p', tsDir], tsDir)
console.log('ts node10 ok')
console.log('SMOKE PASSED')
