/**
 * ESLint configuration for @ontologyio/receta
 *
 * Uses eslint-plugin-receta to enforce functional programming patterns
 */

import recetaPlugin from '@ontologyio/eslint-plugin-receta'

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
    plugins: {
      receta: recetaPlugin,
    },
    rules: {
      // Receta functional programming patterns
      'receta/prefer-result-over-try-catch': 'warn',
      'receta/prefer-option-over-null': 'warn',
      'receta/prefer-pipe-composition': 'warn',
    },
  },
  {
    files: [
      'src/**/__tests__/**/*.ts',
      'src/**/*.test.ts',
      'src/option/toNullable/**/*.ts', // toNullable specifically returns nullable
      'src/option/fromNullable/**/*.ts', // fromNullable accepts nullable
      'src/result/tryCatch/**/*.ts', // tryCatch is the abstraction over try-catch
    ],
    rules: {
      // Disable Receta rules in test files and specific utility files
      'receta/prefer-result-over-try-catch': 'off',
      'receta/prefer-option-over-null': 'off',
      'receta/prefer-pipe-composition': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.mjs', '*.config.js'],
  },
]
