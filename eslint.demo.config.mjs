/**
 * Demo ESLint configuration to test eslint-plugin-receta
 *
 * Usage:
 *   npx eslint -c eslint.demo.config.mjs examples/before-eslint-plugin.ts
 *   npx eslint -c eslint.demo.config.mjs --fix examples/before-eslint-plugin.ts
 */

import receta from './packages/eslint-plugin-receta/src/index.ts'

export default [
  {
    files: ['examples/before-eslint-plugin.ts'],
    plugins: {
      receta,
    },
    rules: {
      // Enable all Receta rules to detect violations
      'receta/prefer-result-over-try-catch': 'warn',
      'receta/prefer-option-over-null': 'warn',
      'receta/prefer-pipe-composition': 'warn',
    },
  },
]
