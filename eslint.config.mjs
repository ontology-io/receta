/**
 * ESLint configuration for Receta
 *
 * Note: Using simplified config without plugin for now
 * Plugin can be used after building or publishing to npm
 */

export default [
  {
    files: ['src/**/*.ts', 'examples/**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      // Basic TypeScript rules
      // Plugin rules will be added after building
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'docs-website/**',
      '*.config.js',
      '*.config.mjs',
      'packages/**',
    ],
  },
]
