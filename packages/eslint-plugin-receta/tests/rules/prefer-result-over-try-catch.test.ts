import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../../src/rules/prefer-result-over-try-catch'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
})

ruleTester.run('prefer-result-over-try-catch', rule, {
  valid: [
    {
      name: 'Already using Result.tryCatch',
      code: `
        import { Result } from 'receta/result'
        function parseJSON(str: string) {
          return Result.tryCatch(() => JSON.parse(str))
        }
      `,
    },
    {
      name: 'Complex catch clause with logic',
      code: `
        function complexHandler() {
          try {
            return doSomething()
          } catch (e) {
            logger.error(e)
            cleanup()
            throw new CustomError(e)
          }
        }
      `,
    },
    {
      name: 'Try-catch without return',
      code: `
        function noReturn() {
          try {
            doSomething()
          } catch (e) {
            console.error(e)
          }
        }
      `,
    },
  ],
  invalid: [
    {
      name: 'Simple try-catch with return',
      code: `
        function parseJSON(str: string) {
          try {
            return JSON.parse(str)
          } catch (e) {
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: `import { Result } from 'receta/result'

        function parseJSON(str: string) {
          const result = Result.tryCatch(
  () => JSON.parse(str)
)
return result
        }
      `,
    },
    {
      name: 'Try-catch with console.error',
      code: `
        function fetchData() {
          try {
            return fetch('/api/data')
          } catch (e) {
            console.error(e)
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: `import { Result } from 'receta/result'

        function fetchData() {
          const result = Result.tryCatch(
  () => fetch('/api/data')
)
return result
        }
      `,
    },
  ],
})
