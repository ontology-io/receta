import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'
import {
  canChangeReturnType,
  findEnclosingFunction,
  generateImportStatement,
  insertImport,
  isCatchClauseReturningFailure,
  isCatchClauseTransparent,
  isEntryPointGuard,
  isNameInScope,
  resolveBinding,
} from '../utils/ast-helpers.js'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/ontology-io/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
)

type MessageIds = 'preferResult' | 'addResultImport'

const RESULT_MODULE = '@ontologyio/receta/result'

export default createRule<[], MessageIds>({
  name: 'prefer-result-over-try-catch',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer tryCatch over try-catch blocks for error handling',
    },
    messages: {
      preferResult: 'Use tryCatch() instead of try-catch for explicit error handling',
      addResultImport: 'Add tryCatch import from @ontologyio/receta/result',
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

        const binding = resolveBinding(sourceCode, [node], RESULT_MODULE, 'tryCatch')
        const returned = findRewritableReturn(node, node.handler, sourceCode)

        context.report({
          node,
          messageId: 'preferResult',
          fix:
            binding && returned
              ? function* (fixer) {
                  const returnExpression = sourceCode.getText(returned)

                  // Replace the entire try-catch with the tryCatch call
                  yield fixer.replaceText(
                    node,
                    `const result = ${binding.name}(\n  () => ${returnExpression}\n)\nreturn result`
                  )

                  if (binding.needsImport) {
                    yield insertImport(
                      fixer,
                      sourceCode,
                      generateImportStatement(['tryCatch'], RESULT_MODULE)
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
 * Find the expression to hand to tryCatch, but only when the rewrite
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
    // The result changes type, which only this function may decide
    fn.returnType === undefined &&
    canChangeReturnType(fn, sourceCode) &&
    // An arrow body starting with `{` is a block, and `() => a, b` splits the argument list
    !sourceCode.getText(argument).startsWith('{') &&
    argument.type !== 'SequenceExpression' &&
    sourceCode.getCommentsInside(node).length === 0 &&
    !isNameInScope(sourceCode.getScope(node), 'result')

  return isSafe ? argument : undefined
}
