import preferResultOverTryCatch from './rules/prefer-result-over-try-catch.js'
import preferOptionOverNull from './rules/prefer-option-over-null.js'
import preferPipeComposition from './rules/prefer-pipe-composition.js'

const plugin = {
  meta: {
    name: 'eslint-plugin-receta',
    version: '0.1.0',
  },
  rules: {
    'prefer-result-over-try-catch': preferResultOverTryCatch,
    'prefer-option-over-null': preferOptionOverNull,
    'prefer-pipe-composition': preferPipeComposition,
  },
  configs: {
    recommended: {
      plugins: ['receta'],
      rules: {
        'receta/prefer-result-over-try-catch': 'warn',
        'receta/prefer-option-over-null': 'warn',
        'receta/prefer-pipe-composition': 'warn',
      },
    },
    strict: {
      plugins: ['receta'],
      rules: {
        'receta/prefer-result-over-try-catch': 'error',
        'receta/prefer-option-over-null': 'error',
        'receta/prefer-pipe-composition': 'error',
      },
    },
  },
}

export default plugin
