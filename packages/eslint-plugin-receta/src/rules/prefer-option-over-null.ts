import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { isNullableReturnType, generateImportStatement } from '../utils/ast-helpers.js'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/khaledmaher/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
)

type MessageIds = 'preferOption' | 'useFromNullable'

export default createRule<[], MessageIds>({
  name: 'prefer-option-over-null',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Option<T> over T | null | undefined for nullable values',
    },
    messages: {
      preferOption: 'Use Option<T> instead of T | null | undefined',
      useFromNullable: 'Wrap nullable returns with fromNullable()',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode

    return {
      'FunctionDeclaration, ArrowFunctionExpression, FunctionExpression'(
        node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
      ) {
        const returnType = node.returnType

        if (!returnType || !isNullableReturnType(returnType)) {
          return
        }

        context.report({
          node: returnType.typeAnnotation ?? returnType,
          messageId: 'preferOption',
          *fix(fixer) {
            if (!returnType?.typeAnnotation) return

            const typeNode = returnType.typeAnnotation

            // Extract the non-null type from union
            if (typeNode.type !== 'TSUnionType') return

            const nonNullTypes = typeNode.types.filter(
              t => t.type !== 'TSNullKeyword' && t.type !== 'TSUndefinedKeyword'
            )

            if (nonNullTypes.length !== 1) return // Complex union, skip

            const baseType = sourceCode.getText(nonNullTypes[0]!)

            // Replace return type with Option<T>
            yield fixer.replaceText(typeNode, `Option<${baseType}>`)

            // Check if Option is imported
            const hasOptionImport = sourceCode.ast.body.some(
              stmt =>
                stmt.type === 'ImportDeclaration' &&
                stmt.source.value === 'receta/option' &&
                stmt.specifiers.some(
                  spec =>
                    spec.type === 'ImportSpecifier' &&
                    spec.imported.type === 'Identifier' &&
                    spec.imported.name === 'Option'
                )
            )

            if (!hasOptionImport) {
              const importStatement = generateImportStatement(
                ['Option', 'fromNullable'],
                'receta/option'
              )
              yield fixer.insertTextBeforeRange([0, 0], `${importStatement}\n`)
            }
          },
        })

        // Also check return statements and suggest wrapping with fromNullable
        const returnStatements = findReturnStatements(node)

        for (const returnStmt of returnStatements) {
          if (
            returnStmt.argument &&
            !isAlreadyWrappedInFromNullable(returnStmt.argument)
          ) {
            context.report({
              node: returnStmt,
              messageId: 'useFromNullable',
              fix(fixer) {
                const argText = sourceCode.getText(returnStmt.argument!)
                return fixer.replaceText(
                  returnStmt.argument!,
                  `fromNullable(${argText})`
                )
              },
            })
          }
        }
      },
    }
  },
})

/**
 * Find all return statements in a function
 */
function findReturnStatements(
  node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
): TSESTree.ReturnStatement[] {
  const returns: TSESTree.ReturnStatement[] = []

  function visit(n: TSESTree.Node) {
    if (n.type === 'ReturnStatement') {
      returns.push(n)
      return // Don't traverse into nested functions
    }

    // Don't traverse into nested functions
    if (
      n.type === 'FunctionDeclaration' ||
      n.type === 'FunctionExpression' ||
      n.type === 'ArrowFunctionExpression'
    ) {
      return
    }

    // Traverse children (simplified, would need proper AST traversal in production)
    for (const key in n) {
      const value = (n as any)[key]
      if (value && typeof value === 'object' && 'type' in value) {
        visit(value)
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object' && 'type' in item) {
            visit(item)
          }
        })
      }
    }
  }

  if (node.body.type === 'BlockStatement') {
    node.body.body.forEach(visit)
  }

  return returns
}

/**
 * Check if expression is already wrapped in fromNullable()
 */
function isAlreadyWrappedInFromNullable(node: TSESTree.Node): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'fromNullable'
  )
}
