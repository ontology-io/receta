import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'
import {
  findEnclosingFunction,
  generateImportStatement,
  isCatchClauseReturningFailure,
  isCatchClauseTransparent,
  isEntryPointGuard,
} from '../utils/ast-helpers.js'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/ontology-io/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
)

type MessageIds = 'preferResult' | 'addResultImport'

export default createRule<[], MessageIds>({
  name: 'prefer-result-over-try-catch',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Result.tryCatch over try-catch blocks for error handling',
    },
    messages: {
      preferResult: 'Use Result.tryCatch() instead of try-catch for explicit error handling',
      addResultImport: 'Add Result import from receta/result',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode

    return {
      TryStatement(node: TSESTree.TryStatement) {
        // try/finally catches nothing, so there is no error handling to replace
        if (!node.handler) {
          return
        }

        // The failure is already a value, or nothing above could receive one
        if (
          isCatchClauseReturningFailure(node.handler, sourceCode.visitorKeys) ||
          isEntryPointGuard(node)
        ) {
          return
        }

        const returned = findRewritableReturn(node, node.handler, sourceCode)

        context.report({
          node,
          messageId: 'preferResult',
          fix: returned
            ? function* (fixer) {
                const returnExpression = sourceCode.getText(returned)

                // Generate Result.tryCatch wrapper
                const resultCode = `const result = Result.tryCatch(\n  () => ${returnExpression}\n)\nreturn result`

                // Replace the entire try-catch with Result pattern
                yield fixer.replaceText(node, resultCode)

                // Check if Result is imported
                const hasResultImport = sourceCode.ast.body.some(
                  stmt =>
                    stmt.type === 'ImportDeclaration' &&
                    stmt.source.value === 'receta/result' &&
                    stmt.specifiers.some(
                      spec =>
                        spec.type === 'ImportSpecifier' &&
                        spec.imported.type === 'Identifier' &&
                        spec.imported.name === 'Result'
                    )
                )

                if (!hasResultImport) {
                  // Add import at the top
                  const importStatement = generateImportStatement(
                    ['Result'],
                    'receta/result'
                  )
                  yield fixer.insertTextBeforeRange(
                    [0, 0],
                    `${importStatement}\n`
                  )
                }
              }
            : null,
        })
      },
    }
  },
})

/**
 * Find the expression to hand to Result.tryCatch, but only when the rewrite
 * keeps everything the try statement does. The fix replaces the whole statement
 * with one sync arrow function, so anything else in it would be lost or broken.
 */
function findRewritableReturn(
  node: TSESTree.TryStatement,
  handler: TSESTree.CatchClause,
  sourceCode: Readonly<TSESLint.SourceCode>
): TSESTree.Expression | undefined {
  const [statement, ...otherStatements] = node.block.body

  if (statement?.type !== 'ReturnStatement' || otherStatements.length > 0) {
    return undefined
  }

  const argument = statement.argument
  const fn = findEnclosingFunction(node)

  // The rewrite ends in `return result`, so nothing may run after the try
  const isLastInFunction = fn?.body.type === 'BlockStatement' && fn.body.body.at(-1) === node

  const isSafe =
    argument !== null &&
    isLastInFunction &&
    !fn.async &&
    !fn.generator &&
    node.finalizer === null &&
    isCatchClauseTransparent(handler) &&
    // `() => { value: 1 }` is a block and `() => a, b` splits the argument list
    argument.type !== 'ObjectExpression' &&
    argument.type !== 'SequenceExpression' &&
    sourceCode.getCommentsInside(node).length === 0 &&
    !isNameInScope(sourceCode.getScope(node), 'result')

  return isSafe ? argument : undefined
}

function isNameInScope(scope: TSESLint.Scope.Scope, name: string): boolean {
  for (let current: TSESLint.Scope.Scope | null = scope; current; current = current.upper) {
    if (current.set.has(name)) return true
  }

  return false
}
