// ESLint configuration for Receta monorepo
// Enforces Receta/Remeda-first patterns across the codebase

import receta from './packages/eslint-plugin-receta/src/index.ts'

export default [
  {
    // Apply to all TypeScript files
    files: ['src/**/*.ts', 'tests/**/*.ts', 'examples/**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      receta,
    },
    rules: {
      // Receta/Remeda-first enforcement
      ...receta.configs.strict.rules,

      // Project-specific overrides
      // (none yet, but you can add them here)
    },
  },
  {
    // Ignore build artifacts and dependencies
    ignores: [
      'node_modules/**',
      'dist/**',
      'docs-website/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
]
