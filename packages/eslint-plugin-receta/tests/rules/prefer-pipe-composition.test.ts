import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../../src/rules/prefer-pipe-composition'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
})

ruleTester.run('prefer-pipe-composition', rule, {
  valid: [
    {
      name: 'Already using R.pipe',
      code: `
        import * as R from 'remeda'
        const result = R.pipe(
          arr,
          R.filter(x => x > 0),
          R.map(x => x * 2)
        )
      `,
    },
    {
      name: 'Single method call',
      code: `const result = arr.map(x => x * 2)`,
    },
    {
      name: 'Non-array method',
      code: `const result = str.toUpperCase().trim()`,
    },
  ],
  invalid: [
    {
      name: 'Filter and map chain',
      code: `
        const result = arr
          .filter(x => x > 0)
          .map(x => x * 2)
      `,
      errors: [{ messageId: 'preferPipe' }],
      output: `import * as R from 'remeda'

        const result = R.pipe(
  arr,
  R.filter(x => x > 0),
  R.map(x => x * 2)
)
      `,
    },
    {
      name: 'Multiple chained methods',
      code: `
        const users = data
          .filter(u => u.active)
          .map(u => u.name)
          .sort()
      `,
      errors: [{ messageId: 'preferPipe' }],
      output: `import * as R from 'remeda'

        const users = R.pipe(
  data,
  R.filter(u => u.active),
  R.map(u => u.name),
  R.sort()
)
      `,
    },
  ],
})
