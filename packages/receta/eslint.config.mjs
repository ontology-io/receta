/**
 * ESLint configuration for @ontologyio/receta
 *
 * Basic TypeScript-aware configuration
 */

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.mjs', '*.config.js'],
  },
]
