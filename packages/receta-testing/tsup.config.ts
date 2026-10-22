import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'matchers/index': 'src/matchers/index.ts',
    'laws/index': 'src/laws/index.ts',
    'arbitraries/index': 'src/arbitraries/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  target: 'es2022',
  external: [/^@ontologyio\/receta/, 'vitest', 'fast-check'],
  esbuildOptions(options) {
    options.sourcesContent = true
  },
})
