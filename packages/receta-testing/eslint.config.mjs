/**
 * ESLint configuration for @ontologyio/receta-testing
 *
 * Basic TypeScript-aware configuration for testing utilities
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
