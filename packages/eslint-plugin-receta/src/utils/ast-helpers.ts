import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression

const FAILURE_CONSTRUCTORS = ['err', 'none', 'invalid']

/**
 * Check if a node is a try-catch statement
 */
export function isTryCatchStatement(node: TSESTree.Node): node is TSESTree.TryStatement {
  return node.type === 'TryStatement'
}

/**
 * Check if a node is a function of any kind
 */
export function isFunctionNode(node: TSESTree.Node): node is FunctionNode {
  return (
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  )
}

/**
 * Find the nearest function around a node, if there is one
 */
export function findEnclosingFunction(node: TSESTree.Node): FunctionNode | undefined {
  let current = node.parent

  while (current) {
    if (isFunctionNode(current)) return current
    current = current.parent
  }

  return undefined
}

/**
 * Check if a catch clause adds nothing to the error: it is empty, or it only
 * rethrows what it caught. Result.tryCatch keeps that same error, so replacing
 * such a clause loses no code. Logging or wrapping the error would be lost.
 */
export function isCatchClauseTransparent(catchClause: TSESTree.CatchClause): boolean {
  const statements = catchClause.body.body
  if (statements.length === 0) return true

  const [first] = statements

  return (
    statements.length === 1 &&
    first?.type === 'ThrowStatement' &&
    first.argument.type === 'Identifier' &&
    catchClause.param?.type === 'Identifier' &&
    first.argument.name === catchClause.param.name
  )
}

/**
 * Find the return statements in a block, leaving out those of nested functions.
 *
 * Walks the parser's visitor keys because they name child nodes only. Walking
 * every key of a node reaches `parent` and never terminates.
 */
export function findReturnStatements(
  block: TSESTree.BlockStatement,
  visitorKeys: TSESLint.SourceCode.VisitorKeys
): TSESTree.ReturnStatement[] {
  const returns: TSESTree.ReturnStatement[] = []

  function visit(n: TSESTree.Node) {
    if (n.type === 'ReturnStatement') {
      returns.push(n)
      return
    }

    if (isFunctionNode(n)) {
      return
    }

    for (const key of visitorKeys[n.type] ?? []) {
      const child = (n as unknown as Record<string, unknown>)[key]
      const children: unknown[] = Array.isArray(child) ? child : [child]

      children.filter(isNode).forEach(visit)
    }
  }

  block.body.forEach(visit)

  return returns
}

function isNode(value: unknown): value is TSESTree.Node {
  return typeof value === 'object' && value !== null && 'type' in value
}

/**
 * Check if a catch clause already turns the failure into a Receta value on at
 * least one path: `return err(...)`, `return none()` or `return invalid(...)`.
 * The exception stops there, which is what the rule asks for.
 */
export function isCatchClauseReturningFailure(
  catchClause: TSESTree.CatchClause,
  visitorKeys: TSESLint.SourceCode.VisitorKeys
): boolean {
  return findReturnStatements(catchClause.body, visitorKeys).some(({ argument }) => {
    if (argument?.type !== 'CallExpression') return false

    const { callee } = argument
    const name = callee.type === 'MemberExpression' ? callee.property : callee

    return name.type === 'Identifier' && FAILURE_CONSTRUCTORS.includes(name.name)
  })
}

/**
 * Check if a try statement guards a program entry point: its catch ends the
 * program, and nothing above it could receive a Result instead. That covers
 * module scope, a function named main and a top-level IIFE.
 */
export function isEntryPointGuard(node: TSESTree.TryStatement): boolean {
  return (
    node.handler !== null &&
    isEndingTheProgram(node.handler) &&
    isEntryPoint(findEnclosingFunction(node))
  )
}

function isEndingTheProgram(catchClause: TSESTree.CatchClause): boolean {
  const last = catchClause.body.body.at(-1)

  if (last?.type === 'ThrowStatement') return true
  if (last?.type !== 'ExpressionStatement') return false

  const { expression } = last

  return (
    expression.type === 'CallExpression' &&
    expression.callee.type === 'MemberExpression' &&
    expression.callee.object.type === 'Identifier' &&
    expression.callee.object.name === 'process' &&
    expression.callee.property.type === 'Identifier' &&
    expression.callee.property.name === 'exit'
  )
}

function isEntryPoint(fn: FunctionNode | undefined): boolean {
  if (!fn) return true

  const { parent } = fn
  const assignedName =
    parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier'
      ? parent.id.name
      : undefined

  if ((fn.id?.name ?? assignedName) === 'main') return true

  // (async () => { ... })() at the top of a file
  return (
    parent.type === 'CallExpression' &&
    parent.callee === fn &&
    parent.parent.type === 'ExpressionStatement' &&
    parent.parent.parent.type === 'Program'
  )
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
