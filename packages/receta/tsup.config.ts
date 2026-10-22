import { defineConfig } from 'tsup'

const modules = [
  'result',
  'option',
  'async',
  'predicate',
  'validation',
  'collection',
  'object',
  'string',
  'number',
  'memo',
  'lens',
  'compare',
  'function',
]

export default defineConfig({
  entry: Object.fromEntries(modules.map((name) => [`${name}/index`, `src/${name}/index.ts`])),
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  external: ['remeda'],
  esbuildOptions(options) {
    // Embed original sources so published .map files resolve without src/
    options.sourcesContent = true
  },
})
