import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESLint, TSESTree } from '@typescript-eslint/utils'
import {
  canChangeReturnType,
  findReturnStatements,
  insertImport,
  isNullableReturnType,
  generateImportStatement,
  resolveBinding,
  type FunctionNode,
} from '../utils/ast-helpers.js'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/ontology-io/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
)

type MessageIds = 'preferOption' | 'useFromNullable' | 'nullableReturn'

const OPTION_MODULE = '@ontologyio/receta/option'

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
      nullableReturn: 'This function can return {{value}}. Return Option<T> instead',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode

    return {
      'FunctionDeclaration, ArrowFunctionExpression, FunctionExpression'(node: FunctionNode) {
        const returnType = node.returnType
        const returnStatements =
          node.body.type === 'BlockStatement'
            ? findReturnStatements(node.body, sourceCode.visitorKeys)
            : []

        if (!returnType) {
          // Without an annotation there is no type to rewrite, so this only reports
          for (const value of findNullableReturnValues(node, returnStatements)) {
            context.report({
              node: value,
              messageId: 'nullableReturn',
              data: { value: sourceCode.getText(value) },
            })
          }
          return
        }

        if (!isNullableReturnType(returnType)) {
          return
        }

        const typeNode = returnType.typeAnnotation
        const baseTypeNode = findSingleNonNullType(typeNode)

        const everyReturn = [node, ...returnStatements]
        const optionBinding = resolveBinding(sourceCode, [node], OPTION_MODULE, 'Option', 'type')
        const wrapBinding = resolveBinding(sourceCode, everyReturn, OPTION_MODULE, 'fromNullable')
        const noneBinding = resolveBinding(sourceCode, everyReturn, OPTION_MODULE, 'none')
        const wrapName = wrapBinding?.name ?? 'fromNullable'

        const returnedValues = returnStatements.flatMap(stmt => stmt.argument ?? [])
        const usesNone = returnedValues.some(isEmptyValue)
        const usesWrap = returnedValues.some(
          value => !isEmptyValue(value) && !isAlreadyWrappedInFromNullable(value, wrapName)
        )

        // The two fixes only make sense together, so they share one decision
        const canFix =
          baseTypeNode !== undefined &&
          optionBinding !== undefined &&
          (!usesWrap || wrapBinding !== undefined) &&
          (!usesNone || noneBinding !== undefined) &&
          canRewriteToOption(node, returnStatements) &&
          canChangeReturnType(node, sourceCode)

        context.report({
          node: typeNode,
          messageId: 'preferOption',
          fix: canFix
            ? function* (fixer) {
                const baseType = sourceCode.getText(baseTypeNode)

                // Replace return type with Option<T>
                yield fixer.replaceText(typeNode, `${optionBinding.name}<${baseType}>`)

                // Option is a type, so the import has to survive verbatimModuleSyntax
                const missingImports = [
                  ...(optionBinding.needsImport ? ['type Option'] : []),
                  ...(usesWrap && wrapBinding?.needsImport ? ['fromNullable'] : []),
                  ...(usesNone && noneBinding?.needsImport ? ['none'] : []),
                ]

                if (missingImports.length > 0) {
                  yield insertImport(
                    fixer,
                    sourceCode,
                    generateImportStatement(missingImports, OPTION_MODULE)
                  )
                }
              }
            : null,
        })

        // Also check return statements and suggest wrapping with fromNullable
        for (const returnStmt of returnStatements) {
          if (returnStmt.argument && !isAlreadyWrappedInFromNullable(returnStmt.argument, wrapName)) {
            context.report({
              node: returnStmt,
              messageId: 'useFromNullable',
              fix: canFix
                ? fixer => {
                    const argument = returnStmt.argument!

                    // fromNullable(null) can't infer T, and none() says the same thing
                    if (isEmptyValue(argument)) {
                      return fixer.replaceText(argument, `${noneBinding?.name ?? 'none'}()`)
                    }

                    const argText = sourceCode.getText(argument)
                    // A comma expression has to stay one argument
                    const wrapped =
                      argument.type === 'SequenceExpression' ? `(${argText})` : argText
                    return fixer.replaceText(argument, `${wrapName}(${wrapped})`)
                  }
                : null,
            })
          }
        }
      },
    }
  },
})

/**
 * Check for a literal null or undefined, which has no value to wrap.
 */
function isEmptyValue(node: TSESTree.Node): boolean {
  return (
    (node.type === 'Literal' && node.raw === 'null') ||
    (node.type === 'Identifier' && node.name === 'undefined')
  )
}

/**
 * Find the null and undefined values an unannotated function can return.
 *
 * Reports nothing unless the same function can also return a real value: a
 * function that only returns null has nothing optional about it. Only the
 * returned value counts, so `return { data: null }` or `let x = null` are fine.
 */
function findNullableReturnValues(
  node: FunctionNode,
  returnStatements: TSESTree.ReturnStatement[]
): TSESTree.Expression[] {
  if (!isStandaloneFunction(node)) {
    return []
  }

  const returned =
    node.body.type === 'BlockStatement'
      ? returnStatements.flatMap(stmt => stmt.argument ?? [])
      : [node.body]

  const values = returned.flatMap(findPossibleValues)

  // null is how a React component renders nothing
  const isComponent = values.some(
    value => value.type === 'JSXElement' || value.type === 'JSXFragment'
  )

  if (isComponent || values.every(isNullish)) {
    return []
  }

  return values.filter(isNullish)
}

/**
 * Check that a function's return shape is its own to decide. An inline callback
 * or a function typed through its variable has to fit a contract set elsewhere,
 * and nullable returns are often part of that contract.
 */
function isStandaloneFunction(node: FunctionNode): boolean {
  if (node.type === 'FunctionDeclaration') return true

  const { parent } = node

  return (
    (parent.type === 'VariableDeclarator' && !parent.id.typeAnnotation) ||
    parent.type === 'MethodDefinition' ||
    parent.type === 'PropertyDefinition' ||
    parent.type === 'ExportDefaultDeclaration'
  )
}

/**
 * List what an expression can evaluate to: `a ? b : null` is `b` or `null`
 */
function findPossibleValues(node: TSESTree.Expression): TSESTree.Expression[] {
  if (node.type === 'ConditionalExpression') {
    return [...findPossibleValues(node.consequent), ...findPossibleValues(node.alternate)]
  }

  if (node.type === 'LogicalExpression') {
    return [...findPossibleValues(node.left), ...findPossibleValues(node.right)]
  }

  return [node]
}

function isNullish(node: TSESTree.Expression): boolean {
  return (
    (node.type === 'Literal' && node.raw === 'null') ||
    (node.type === 'Identifier' && node.name === 'undefined')
  )
}

/**
 * Find T in `T | null | undefined`. A union with several real members has no
 * single T to put in Option<T>.
 */
function findSingleNonNullType(typeNode: TSESTree.TypeNode): TSESTree.TypeNode | undefined {
  if (typeNode.type !== 'TSUnionType') return undefined

  const nonNullTypes = typeNode.types.filter(
    t => t.type !== 'TSNullKeyword' && t.type !== 'TSUndefinedKeyword'
  )

  return nonNullTypes.length === 1 ? nonNullTypes[0] : undefined
}

/**
 * Check that every path out of a function goes through a `return value` the fix
 * can wrap. An expression body, a bare `return` or falling off the end would
 * still hand back a raw value from a function now typed as Option<T>.
 */
function canRewriteToOption(
  node: FunctionNode,
  returnStatements: TSESTree.ReturnStatement[]
): boolean {
  return (
    node.body.type === 'BlockStatement' &&
    alwaysExits(node.body) &&
    returnStatements.every(stmt => stmt.argument !== null)
  )
}

/**
 * Check that control cannot run past the end of a statement. Answers false for
 * anything it cannot prove, such as loops and switches.
 */
function alwaysExits(node: TSESTree.Statement | null): boolean {
  switch (node?.type) {
    case 'ReturnStatement':
    case 'ThrowStatement':
      return true
    case 'BlockStatement':
      return node.body.some(alwaysExits)
    case 'IfStatement':
      return alwaysExits(node.consequent) && alwaysExits(node.alternate)
    case 'TryStatement':
      return (
        alwaysExits(node.finalizer) ||
        (alwaysExits(node.block) && (!node.handler || alwaysExits(node.handler.body)))
      )
    default:
      return false
  }
}

/**
 * Check if expression is already wrapped in fromNullable()
 */
function isAlreadyWrappedInFromNullable(node: TSESTree.Node, wrapName: string): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === wrapName
  )
}
