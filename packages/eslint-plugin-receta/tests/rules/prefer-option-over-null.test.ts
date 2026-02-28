import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../../src/rules/prefer-option-over-null'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
})

ruleTester.run('prefer-option-over-null', rule, {
  valid: [
    {
      name: 'Already using Option<T>',
      code: `
        import { Option, fromNullable } from 'receta/option'
        function findUser(id: string): Option<User> {
          return fromNullable(users.find(u => u.id === id))
        }
      `,
    },
    {
      name: 'Non-nullable return type',
      code: `
        function getUser(id: string): User {
          return users[id]
        }
      `,
    },
    {
      name: 'No return type annotation',
      code: `
        function findUser(id: string) {
          return users.find(u => u.id === id)
        }
      `,
    },
  ],
  invalid: [
    {
      name: 'Function returning T | undefined',
      code: `
        function findUser(id: string): User | undefined {
          return users.find(u => u.id === id)
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable' },
      ],
      output: `import { Option, fromNullable } from 'receta/option'

        function findUser(id: string): Option<User> {
          return fromNullable(users.find(u => u.id === id))
        }
      `,
    },
    {
      name: 'Arrow function returning T | null',
      code: `
        const getConfig = (key: string): Config | null => {
          return config[key] || null
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable' },
      ],
      output: `import { Option, fromNullable } from 'receta/option'

        const getConfig = (key: string): Option<Config> => {
          return fromNullable(config[key] || null)
        }
      `,
    },
    {
      name: 'Function returning T | null | undefined',
      code: `
        function maybeValue(): string | null | undefined {
          return someValue
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable' },
      ],
      output: `import { Option, fromNullable } from 'receta/option'

        function maybeValue(): Option<string> {
          return fromNullable(someValue)
        }
      `,
    },
  ],
})
