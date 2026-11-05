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

const jsx = {
  parserOptions: {
    ecmaVersion: 2022 as const,
    sourceType: 'module' as const,
    ecmaFeatures: { jsx: true },
  },
}

ruleTester.run('prefer-option-over-null', rule, {
  valid: [
    {
      name: 'Already using Option<T>',
      code: `
        import { Option, fromNullable } from '@ontologyio/receta/option'
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
    {
      name: 'Unannotated: null outside a return position',
      code: `
        function build(input = null) {
          let cached = null
          if (input === null) cached = load()
          save({ owner: null })
          return cached
        }
      `,
    },
    {
      name: 'Unannotated: null nested inside a returned value',
      code: `
        function toResponse(user) {
          if (!user) return { data: null, error: 'missing' }
          return { data: user, error: null }
        }
      `,
    },
    {
      name: 'Unannotated: only ever returns null, so nothing is optional',
      code: `
        function placeholder() {
          return null
        }
      `,
    },
    {
      name: 'Unannotated: bare return is left to consistent-return',
      code: `
        function first(items) {
          if (!items.length) return
          return items[0]
        }
      `,
    },
    {
      name: 'Unannotated: a nested function does not make the outer one nullable',
      code: `
        function outer(items) {
          const pick = () => null
          return items.map(pick)
        }
      `,
    },
    {
      name: 'Unannotated: inline callback, its shape belongs to the API it is passed to',
      code: `
        const names = users.map(user => (user.active ? user.name : null))
        const value = useMemo(() => {
          if (!ready) return null
          return compute()
        }, [ready])
      `,
    },
    {
      name: 'Unannotated: function typed through its variable',
      code: `
        const handler: Handler = (req) => {
          if (!req.user) return null
          return req.user.id
        }
      `,
    },
    {
      name: 'Unannotated: React component returning null to render nothing',
      code: `
        function Profile({ user }) {
          if (!user) return null
          return <div>{user.name}</div>
        }
        const Badge = ({ count }) => (count > 0 ? <span>{count}</span> : null)
      `,
      languageOptions: jsx,
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
      output: `import { fromNullable, type Option } from '@ontologyio/receta/option'

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
      output: `import { fromNullable, type Option } from '@ontologyio/receta/option'

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
      output: `import { fromNullable, type Option } from '@ontologyio/receta/option'

        function maybeValue(): Option<string> {
          return fromNullable(someValue)
        }
      `,
    },

    // Regression: walking every key of a node reached `parent` and overflowed the stack.
    {
      name: 'Block body with a nullable return type does not crash',
      code: `type Line = { sku: string; qty: number }
export function getOrder(raw: string): Line[] | null {
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}
`,
      errors: [
        { messageId: 'preferOption', line: 2 },
        { messageId: 'useFromNullable', line: 4 },
        { messageId: 'useFromNullable', line: 6 },
      ],
      output: `import { fromNullable, type Option } from '@ontologyio/receta/option'
type Line = { sku: string; qty: number }
export function getOrder(raw: string): Option<Line[]> {
  try {
    return fromNullable(JSON.parse(raw))
  } catch (e) {
    return fromNullable(null)
  }
}
`,
    },
    {
      name: 'Finds returns nested in control flow but not in inner functions',
      code: `
        function pick(items: Item[], mode: Mode): Item | null {
          const score = (item: Item) => {
            return item.score
          }
          switch (mode) {
            case 'best':
              return best(items, score)
            default:
              if (items.length) {
                return items[0]
              }
              return null
          }
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable', line: 8 },
        { messageId: 'useFromNullable', line: 11 },
        { messageId: 'useFromNullable', line: 13 },
      ],
      // Nothing proves the switch exits on every path, so this is reported without a fix.
      output: null,
    },

    // Regression: an unannotated function returning null was invisible.
    {
      name: 'Unannotated function that returns null',
      code: `export function getOrder(raw: string) {
  try {
    const data2 = JSON.parse(raw)
    if (!data2) return null
    return data2.lines.filter((l: { qty: number }) => l.qty > 0)
  } catch (e) {
    return null
  }
}
`,
      errors: [
        { messageId: 'nullableReturn', data: { value: 'null' }, line: 4 },
        { messageId: 'nullableReturn', data: { value: 'null' }, line: 7 },
      ],
      output: null,
    },
    {
      name: 'Unannotated: explicit return undefined',
      code: `
        function findPort(config) {
          if (!config.server) return undefined
          return config.server.port
        }
      `,
      errors: [{ messageId: 'nullableReturn', data: { value: 'undefined' }, line: 3 }],
      output: null,
    },
    {
      name: 'Unannotated: null in a conditional or logical return',
      code: `
        function a(user) {
          return user.active ? user.name : null
        }
        function b(user) {
          return user.name ?? null
        }
      `,
      errors: [
        { messageId: 'nullableReturn', line: 3 },
        { messageId: 'nullableReturn', line: 6 },
      ],
      output: null,
    },
    {
      name: 'Unannotated: arrow with an expression body',
      code: `const findUser = (id) => users[id] ?? null`,
      errors: [{ messageId: 'nullableReturn' }],
      output: null,
    },
    {
      name: 'Unannotated: async function and class method',
      code: `
        async function load(id) {
          if (!id) return null
          return fetchUser(id)
        }
        class Repo {
          find(id) {
            if (!id) return null
            return this.rows[id]
          }
        }
      `,
      errors: [
        { messageId: 'nullableReturn', line: 3 },
        { messageId: 'nullableReturn', line: 8 },
      ],
      output: null,
    },

    // Reported, but the rewrite would not be sound, so no fix is offered.
    {
      name: 'No fix: union with several non-null members',
      code: `
        function parse(raw: string): number | string | null {
          return read(raw)
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable' },
      ],
      output: null,
    },
    {
      name: 'No fix: expression body would keep returning the raw value',
      code: `const getConfig = (key: string): Config | null => config[key] ?? null`,
      errors: [{ messageId: 'preferOption' }],
      output: null,
    },
    {
      name: 'No fix: a bare return would not produce an Option',
      code: `
        function first(items: string[]): string | undefined {
          if (!items.length) return
          return items[0]
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable', line: 4 },
      ],
      output: null,
    },
    {
      name: 'No fix: falling off the end would not produce an Option',
      code: `
        function find(items: Item[]): Item | undefined {
          for (const item of items) {
            if (item.ok) return item
          }
        }
      `,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable' },
      ],
      output: null,
    },
    {
      name: 'Imports only what is missing from receta/option',
      code: `import { Option } from '@ontologyio/receta/option'
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}
`,
      errors: [
        { messageId: 'preferOption' },
        { messageId: 'useFromNullable' },
      ],
      output: `import { fromNullable } from '@ontologyio/receta/option'
import { Option } from '@ontologyio/receta/option'
function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}
`,
    },
  ],
})
