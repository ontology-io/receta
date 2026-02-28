/**
 * ESLint configuration for @ontologyio/eslint-plugin-receta
 *
 * Basic TypeScript-aware configuration for the ESLint plugin
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
