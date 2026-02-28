import type { TSESTree } from '@typescript-eslint/utils'

/**
 * Check if a node is a try-catch statement
 */
export function isTryCatchStatement(node: TSESTree.Node): node is TSESTree.TryStatement {
  return node.type === 'TryStatement'
}

/**
 * Check if a catch clause is a simple error re-throw or logging
 */
export function isCatchClauseSimple(catchClause: TSESTree.CatchClause | null): boolean {
  if (!catchClause?.body.body.length) return true

  const statements = catchClause.body.body

  // Only throw statement
  if (statements.length === 1 && statements[0]?.type === 'ThrowStatement') {
    return true
  }

  // Only console.error/log
  if (statements.every(stmt =>
    stmt.type === 'ExpressionStatement' &&
    stmt.expression.type === 'CallExpression' &&
    stmt.expression.callee.type === 'MemberExpression' &&
    stmt.expression.callee.object.type === 'Identifier' &&
    stmt.expression.callee.object.name === 'console'
  )) {
    return true
  }

  return false
}

/**
 * Check if a function return type is nullable (T | null | undefined)
 */
export function isNullableReturnType(
  returnType: TSESTree.TSTypeAnnotation | undefined
): boolean {
  if (!returnType) return false

  const typeAnnotation = returnType.typeAnnotation

  if (typeAnnotation.type === 'TSUnionType') {
    return typeAnnotation.types.some(t =>
      t.type === 'TSNullKeyword' ||
      t.type === 'TSUndefinedKeyword'
    )
  }

  return false
}

/**
 * Check if a node is a method chain (e.g., arr.filter().map())
 */
export function isMethodChain(node: TSESTree.Node): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'CallExpression'
  )
}

/**
 * Extract the array methods from a chain (e.g., ['filter', 'map', 'reduce'])
 */
export function extractChainedMethods(node: TSESTree.CallExpression): string[] {
  const methods: string[] = []
  let current: TSESTree.Node = node

  while (
    current.type === 'CallExpression' &&
    current.callee.type === 'MemberExpression'
  ) {
    if (current.callee.property.type === 'Identifier') {
      methods.unshift(current.callee.property.name)
    }
    current = current.callee.object
  }

  return methods
}

/**
 * Check if methods are chainable array methods that should use pipe
 */
export function isChainableArrayMethod(method: string): boolean {
  const chainableMethods = [
    'map', 'filter', 'reduce', 'find', 'findIndex',
    'some', 'every', 'flatMap', 'flat', 'sort',
    'slice', 'concat', 'reverse'
  ]
  return chainableMethods.includes(method)
}

/**
 * Generate import statement for missing Receta/Remeda utilities
 */
export function generateImportStatement(
  utilities: string[],
  from: 'receta/result' | 'receta/option' | 'receta/async' | 'remeda'
): string {
  const uniqueUtilities = [...new Set(utilities)].sort()

  if (from === 'remeda') {
    return `import * as R from 'remeda'`
  }

  return `import { ${uniqueUtilities.join(', ')} } from '${from}'`
}
