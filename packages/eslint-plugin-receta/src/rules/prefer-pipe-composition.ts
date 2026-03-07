import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import {
  isMethodChain,
  extractChainedMethods,
  isChainableArrayMethod,
  generateImportStatement,
} from '../utils/ast-helpers.js'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/ontology-io/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
)

type MessageIds = 'preferPipe'

export default createRule<[], MessageIds>({
  name: 'prefer-pipe-composition',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer R.pipe over method chaining for array transformations',
    },
    messages: {
      preferPipe: 'Use R.pipe() instead of method chaining for better composition',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isMethodChain(node)) return

        const methods = extractChainedMethods(node)

        // Only suggest if we have at least 2 chainable methods
        const chainableCount = methods.filter(isChainableArrayMethod).length
        if (chainableCount < 2) return

        // Only report on the outermost call in the chain (not nested calls)
        // Check if this node is part of a larger chain
        if (
          node.parent?.type === 'MemberExpression' &&
          node.parent.parent?.type === 'CallExpression'
        ) {
          return
        }

        context.report({
          node,
          messageId: 'preferPipe',
          *fix(fixer) {
            // Extract the base array (the object being called on)
            let current: TSESTree.Node = node
            const callExpressions: TSESTree.CallExpression[] = []

            while (
              current.type === 'CallExpression' &&
              current.callee.type === 'MemberExpression'
            ) {
              callExpressions.unshift(current)
              current = current.callee.object
            }

            const baseArray = sourceCode.getText(current)

            // Build pipe transformations
            const pipeSteps: string[] = []

            for (const call of callExpressions) {
              if (call.callee.type !== 'MemberExpression') continue

              const method = (call.callee.property as TSESTree.Identifier).name
              const args = call.arguments.map(arg => sourceCode.getText(arg))

              pipeSteps.push(`R.${method}(${args.join(', ')})`)
            }

            // Generate pipe expression
            const pipeCode = `R.pipe(\n  ${baseArray},\n  ${pipeSteps.join(',\n  ')}\n)`

            yield fixer.replaceText(node, pipeCode)

            // Check if Remeda is imported
            const hasRemedaImport = sourceCode.ast.body.some(
              stmt =>
                stmt.type === 'ImportDeclaration' &&
                stmt.source.value === 'remeda'
            )

            if (!hasRemedaImport) {
              const importStatement = generateImportStatement([], 'remeda')
              yield fixer.insertTextBeforeRange([0, 0], `${importStatement}\n`)
            }
          },
        })
      },
    }
  },
})
