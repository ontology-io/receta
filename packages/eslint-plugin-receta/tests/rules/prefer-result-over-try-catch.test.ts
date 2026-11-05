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
      name: 'Already using tryCatch',
      code: `
        import { tryCatch } from '@ontologyio/receta/result'
        function parseJSON(str: string) {
          return tryCatch(() => JSON.parse(str))
        }
      `,
    },
    {
      name: 'try/finally has no catch to replace',
      code: `
        function withLock() {
          try {
            return work()
          } finally {
            release()
          }
        }
      `,
    },
    {
      name: 'Catch already turns the failure into a Result',
      code: `
        async function fetchUser(id: string) {
          try {
            return ok(await load(id))
          } catch (error) {
            return err({ type: 'network_error', cause: error })
          }
        }
      `,
    },
    {
      name: 'Catch returns err on only some of its paths',
      code: `
        async function attempt() {
          try {
            return ok(await run())
          } catch (error) {
            if (isFatal(error)) {
              return err(error)
            }
            await sleep(100)
          }
        }
      `,
    },
    {
      name: 'Catch returns err through a namespace import',
      code: `
        function parse(raw: string) {
          try {
            return Result.ok(JSON.parse(raw))
          } catch (error) {
            return Result.err(error)
          }
        }
      `,
    },
    {
      name: 'Catch already turns the failure into an Option',
      code: `
        function parseUrl(raw: string) {
          try {
            return some(new URL(raw))
          } catch {
            return none()
          }
        }
      `,
    },
    {
      name: 'Catch already turns the failure into a Validation',
      code: `
        function check(raw: string) {
          try {
            return valid(run(raw))
          } catch (error) {
            return invalid(error)
          }
        }
      `,
    },
    {
      name: 'Entry point: module scope rethrow',
      code: `
        try {
          await start()
        } catch (e) {
          console.error(e)
          throw e
        }
      `,
    },
    {
      name: 'Entry point: module scope process.exit',
      code: `
        try {
          await start()
        } catch (e) {
          console.error(e)
          process.exit(1)
        }
      `,
    },
    {
      name: 'Entry point: main function',
      code: `
        async function main() {
          try {
            await start()
          } catch (e) {
            console.error(e)
            process.exit(1)
          }
        }
      `,
    },
    {
      name: 'Entry point: main arrow function',
      code: `
        const main = async () => {
          try {
            await start()
          } catch (e) {
            throw e
          }
        }
      `,
    },
    {
      name: 'Entry point: top-level IIFE',
      code: `
        ;(async () => {
          try {
            await start()
          } catch (e) {
            console.error(e)
            process.exit(1)
          }
        })()
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
      output: `import { tryCatch } from '@ontologyio/receta/result'

        function parseJSON(str: string) {
          const result = tryCatch(
  () => JSON.parse(str)
)
return result
        }
      `,
    },
    {
      name: 'Empty catch',
      code: `
        function read() {
          try {
            return load()
          } catch {}
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: `import { tryCatch } from '@ontologyio/receta/result'

        function read() {
          const result = tryCatch(
  () => load()
)
return result
        }
      `,
    },
    {
      name: 'Return expression spanning several lines is kept whole',
      code: `
        function load() {
          try {
            return parse(
              input,
              options
            )
          } catch (e) {
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: `import { tryCatch } from '@ontologyio/receta/result'

        function load() {
          const result = tryCatch(
  () => parse(
              input,
              options
            )
)
return result
        }
      `,
    },

    // Regression: reporting used to depend on whether an autofix was possible.
    {
      name: 'Catch that returns a fallback',
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
      errors: [{ messageId: 'preferResult', line: 2 }],
      output: null,
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
      errors: [{ messageId: 'preferResult' }],
      output: null,
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
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'An err() returned by a nested function does not count',
      code: `
        function load() {
          try {
            read()
          } catch (error) {
            schedule(() => {
              return err(error)
            })
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'Module scope try that recovers instead of ending the program',
      code: `
        let config = {}
        try {
          config = JSON.parse(raw)
        } catch (e) {
          config = defaults
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'main that recovers is not an entry point guard',
      code: `
        function main() {
          try {
            start()
          } catch (e) {
            logger.error(e)
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'Rethrow in an ordinary function is not an entry point guard',
      code: `
        function load() {
          try {
            const raw = read()
            return parse(raw)
          } catch (e) {
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },

    // Reported, but the rewrite would lose or break something, so no fix is offered.
    {
      name: 'No fix: catch logs, and the rewrite would delete the logging',
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
      output: null,
    },
    {
      name: 'No fix: catch wraps the error, and the rewrite would delete the wrapper',
      code: `
        function load() {
          try {
            return read()
          } catch (e) {
            throw new LoadError(e)
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix: finally block would be dropped',
      code: `
        function load() {
          try {
            return read()
          } catch (e) {
            throw e
          } finally {
            release()
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix: code after the try would become unreachable',
      code: `
        function load() {
          try {
            return read()
          } catch {}
          return fallback()
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix: async function needs tryCatchAsync, not a sync wrapper',
      code: `
        async function load() {
          try {
            return await read()
          } catch (e) {
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix: object literal would become an arrow function block',
      code: `
        function load() {
          try {
            return { value: read() }
          } catch (e) {
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix: the generated result binding would collide',
      code: `
        function load(result) {
          try {
            return result.value
          } catch (e) {
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix: comments would be lost',
      code: `
        function load() {
          try {
            return read()
          } catch (e) {
            // the caller decides what to do with this
            throw e
          }
        }
      `,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix when the expression only starts like an object',
      code: `function load(s: string) {
  try {
    return { a: parse(s) } as Config
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix when the function declares its return type',
      code: `function load(s: string): number {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix in a class method, which may implement an interface',
      code: `class Loader {
  load(s: string) {
    try {
    return parse(s)
  } catch (e) {
    throw e
  }
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix when a type on the variable sets the return type',
      code: `const load: Parser = (s) => {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix in a callback, whose caller expects the old value',
      code: `items.map((s) => {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
})
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix when another module already owns the name tryCatch',
      code: `import { tryCatch } from '@ontologyio/receta/function'
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix when a local declaration owns the name tryCatch',
      code: `const tryCatch = 1
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'Uses the local name of an aliased import',
      code: `import { tryCatch as attempt } from '@ontologyio/receta/result'
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: `import { tryCatch as attempt } from '@ontologyio/receta/result'
function load(s: string) {
  const result = attempt(
  () => parse(s)
)
return result
}
`,
    },
    {
      name: 'Keeps a shebang first',
      code: `#!/usr/bin/env node
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: `#!/usr/bin/env node
import { tryCatch } from '@ontologyio/receta/result'
function load(s: string) {
  const result = tryCatch(
  () => parse(s)
)
return result
}
`,
    },
    {
      name: 'Keeps directives first, so they stay directives',
      code: `'use client'
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: `'use client'
import { tryCatch } from '@ontologyio/receta/result'
function load(s: string) {
  const result = tryCatch(
  () => parse(s)
)
return result
}
`,
    },
    {
      name: 'No fix when a parameter shadows the imported tryCatch',
      code: `import { tryCatch } from '@ontologyio/receta/result'
function load(s: string, tryCatch: number) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix when tryCatch is only imported as a type',
      code: `import type { tryCatch } from '@ontologyio/receta/result'
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'No fix in a recursive function, which would see the new return type',
      code: `function load(s: string) {
  try {
    return load(s.slice(1))
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: null,
    },
    {
      name: 'Keeps code on the directive line valid',
      code: `'use strict'; function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: `'use strict';
import { tryCatch } from '@ontologyio/receta/result'
 function load(s: string) {
  const result = tryCatch(
  () => parse(s)
)
return result
}
`,
    },
    {
      name: 'Keeps a triple-slash reference first',
      code: `/// <reference lib="dom" />
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: `/// <reference lib="dom" />
import { tryCatch } from '@ontologyio/receta/result'
function load(s: string) {
  const result = tryCatch(
  () => parse(s)
)
return result
}
`,
    },
    {
      name: 'Keeps a file pragma first, and a doc comment with its function',
      code: `// @ts-nocheck
/** Loads it. */
function load(s: string) {
  try {
    return parse(s)
  } catch (e) {
    throw e
  }
}
`,
      errors: [{ messageId: 'preferResult' }],
      output: `// @ts-nocheck
import { tryCatch } from '@ontologyio/receta/result'
/** Loads it. */
function load(s: string) {
  const result = tryCatch(
  () => parse(s)
)
return result
}
`,
    },
  ],
})
