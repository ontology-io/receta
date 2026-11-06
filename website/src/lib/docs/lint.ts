// Keeps the docs Receta-first, so nobody learns a Receta function beside hand-rolled code.
// Every example goes through ESLint with the published plugin. The selectors below add what
// the plugin can't see yet, and each one has a replacement in the published packages, so a
// complaint can always be fixed. `.some` and `.every` stay legal because Remeda has neither,
// and `throw` does because it is how a function asks `retry` for another attempt.
// scripts/check-examples.ts runs it. Start at lintExample.
import receta from '@ontologyio/eslint-plugin-receta'
import * as parser from '@typescript-eslint/parser'
import { type ESLint, Linter, type Rule } from 'eslint'
import * as R from 'remeda'
import type { Example } from './examples'

export type Finding = { readonly line: number; readonly message: string }

const NATIVE_ARRAY_METHODS = [
  'map', 'filter', 'reduce', 'flatMap', 'find', 'findIndex', 'sort', 'forEach', 'flat', 'reverse', 'join',
] as const

/** Remeda, or a namespace such as `Result` or `Array`, is not an array being called on. */
const IS_NOT_A_NAMESPACE = ":not([callee.object.name=/^(?:[A-Z].*|path)$/])"

const nativeMethod = (method: string) => ({
  selector: `CallExpression[callee.type='MemberExpression'][callee.property.name='${method}']${IS_NOT_A_NAMESPACE}`,
  message: `Use R.${method} from Remeda, not the native array method.`,
})

const PREDICATE_TAKERS = "/^(?:filter|find|findIndex|findLast|partition|takeWhile|dropWhile)$/"

const inlinePredicate = (body: string) => ({
  selector: `CallExpression[callee.object.name='R'][callee.property.name=${PREDICATE_TAKERS}] > ArrowFunctionExpression${body}`,
  message: 'Use a Receta predicate such as where, eq, gt or and, not an inline comparison.',
})

const VANILLA_SYNTAX = [
  ...R.map(NATIVE_ARRAY_METHODS, nativeMethod),
  inlinePredicate("[body.type='BinaryExpression'][body.operator=/^(?:===|!==|>|>=|<|<=)$/]"),
  inlinePredicate("[body.type='LogicalExpression']"),
  {
    selector: 'ForStatement, ForInStatement, ForOfStatement[await=false], WhileStatement, DoWhileStatement',
    message: 'Use R.map, R.forEach or R.reduce, or mapAsync with concurrency 1 for async steps, not a loop.',
  },
  {
    selector: "CallExpression[callee.object.name='Promise'][callee.property.name=/^(?:all|allSettled)$/]",
    message: 'Use mapAsync, parallel or promiseAllSettled from Receta, not Promise.all.',
  },
  {
    selector: "CallExpression[callee.property.name='catch']",
    message: 'Use tryCatchAsync from Receta, not .catch.',
  },
  {
    selector: "NewExpression[callee.name='Promise']:has(CallExpression[callee.name='setTimeout'])",
    message: 'Use sleep from Receta, not a Promise around setTimeout.',
  },
  {
    selector: "CallExpression[callee.object.name='Object'][callee.property.name=/^(?:keys|values|entries|fromEntries)$/]",
    message: 'Use R.keys, R.values, R.entries or R.fromEntries from Remeda.',
  },
  {
    selector: "CallExpression[callee.object.name='JSON'][callee.property.name='parse']:not(CallExpression[callee.name=/^tryCatch(?:Async)?$/] *)",
    message: 'Use parseJSON from Receta, which returns a Result.',
  },
]

/**
 * Native sort works in place, so `users.sort(cmp)` on its own line does something. `R.sort`
 * returns a copy, so the same line sorts nothing. A `// =>` claim counts as using the result.
 */
const keepSortResult: Rule.RuleModule = {
  create: (context) => ({
    "ExpressionStatement[expression.callee.object.name='R'][expression.callee.property.name=/^(?:sort|reverse)$/]":
      (node: Rule.Node) => {
        const [next] = context.sourceCode.getCommentsAfter(node)
        if (next?.value.trimStart().startsWith('=>')) return
        context.report({ node, message: 'Keep the result: R.sort and R.reverse return a copy.' })
      },
  }),
}

const CONFIG: Linter.Config = {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: {
    receta: receta as unknown as ESLint.Plugin,
    docs: { rules: { 'keep-sort-result': keepSortResult } },
  },
  rules: {
    'receta/prefer-result-over-try-catch': 'error',
    'receta/prefer-option-over-null': 'error',
    'receta/prefer-pipe-composition': 'error',
    'docs/keep-sort-result': 'error',
    'no-restricted-syntax': ['error', ...VANILLA_SYNTAX],
  },
}

const linter = new Linter({ configType: 'flat' })

/** What a Receta example does by hand. A syntax error is left for the compiler to report. */
export const lintExample = ({ code, isTsx }: Pick<Example, 'code' | 'isTsx'>): readonly Finding[] =>
  R.pipe(
    linter.verify(code, CONFIG, { filename: isTsx ? 'example.tsx' : 'example.ts' }),
    R.filter(({ fatal }) => fatal !== true),
    R.map(({ line, message }) => ({ line, message })),
  )

const USES_RECETA = /from '(?:@ontologyio\/receta|remeda)/

/** Whether code with its names resolved leans on Receta or Remeda, even without an import. */
export const usesReceta = (resolvedSource: string): boolean => USES_RECETA.test(resolvedSource)
