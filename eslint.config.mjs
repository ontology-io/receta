/**
 * ESLint configuration for Receta
 *
 * Basic TypeScript ESLint configuration
 */

export default [
  {
    files: ['src/**/*.ts', 'examples/**/*.ts'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'output/**',
      'scripts/**',
      '*.config.js',
      '*.config.mjs',
      '.nx/**',
    ],
  },
]
