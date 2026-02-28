import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { isTryCatchStatement, isCatchClauseSimple, generateImportStatement } from '../utils/ast-helpers'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/khaledmaher/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
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
        // Only suggest for simple try-catch blocks
        if (!isCatchClauseSimple(node.handler)) {
          return
        }

        // Check if there's a return statement in try block
        const tryBlock = node.block.body
        const hasReturn = tryBlock.some(stmt => stmt.type === 'ReturnStatement')

        if (!hasReturn) {
          return // Only autofix when there's a clear return value
        }

        context.report({
          node,
          messageId: 'preferResult',
          *fix(fixer) {
            // Extract the try block content
            const tryBlockText = sourceCode.getText(node.block)
            const tryContent = tryBlockText.slice(1, -1).trim() // Remove braces

            // Find the return statement
            const returnMatch = tryContent.match(/return\s+(.+?)(?:;|\n|$)/)
            if (!returnMatch?.[1]) return

            const returnExpression = returnMatch[1].trim()

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
          },
        })
      },
    }
  },
})
