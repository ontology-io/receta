/**
 * ESLint configuration for Receta
 *
 * Uses eslint-plugin-receta from source (Bun can execute TypeScript directly)
 */

// Import from source - Bun handles .ts files natively
const receta = await import('./packages/eslint-plugin-receta/src/index.ts').then(m => m.default)

export default [
  {
    files: ['examples/before-eslint-plugin.ts'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      receta,
    },
    rules: {
      // Enable all Receta rules with warnings
      ...receta.configs.recommended.rules,
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      receta,
    },
    rules: {
      // Strict mode for source code
      ...receta.configs.strict.rules,
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'docs-website/**',
      '*.config.js',
      '*.config.mjs',
      'packages/eslint-plugin-receta/**',
    ],
  },
]
