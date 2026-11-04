// Finds what an example says it produces, written as `// => Ok(10)`, and rewrites the
// example so running it checks those claims. Start at withClaims.
import ts from 'typescript'

const CLAIM = /^[ \t]*;?[ \t]*(?:\r?\n[ \t]*)?\/\/\s*=>\s*(.+?)\s*$/m
const COMMENT_LINE = /^[ \t]*\/\/ ?(.*)$/

/** The docs print values the way a reader thinks of them, not how they are constructed. */
const toConstructors = (expected: string): string =>
  expected
    .replace(/\bOk\(/g, '__ok(')
    .replace(/\bErr\(/g, '__err(')
    .replace(/\bSome\(/g, '__some(')
    .replace(/\bNone\b(\(\))?/g, '__none()')
    .replace(/\bValid\(/g, '__valid(')
    .replace(/\bInvalid\(/g, '__invalid(')

/** The comment lines right after a claim's first line, which may continue it. */
const continuationLines = (rest: string): readonly string[] => {
  const lines = rest.split('\n').slice(1)
  const end = lines.findIndex((line) => !COMMENT_LINE.test(line))
  return (end < 0 ? lines : lines.slice(0, end)).map((line) => COMMENT_LINE.exec(line)?.[1] ?? '')
}

/** A claim in words, like `// => [...all errors]`, can't run, and must not stop the rest. */
const isExpression = (expected: string): boolean => {
  const { diagnostics = [] } = ts.transpileModule(`(${toConstructors(expected)});`, {
    reportDiagnostics: true,
  })
  return diagnostics.length === 0
}

/** Reads a claim, following it over more comment lines when it spans several. */
const claimAfter = (source: string, from: number, to: number): string | undefined => {
  const trivia = source.slice(from, to)
  const match = CLAIM.exec(trivia)
  if (!match || match.index !== 0) return undefined
  const first = match[1] ?? ''
  const rest = continuationLines(trivia.slice(match[0].length))
  const attempts = rest.map((_, count) => [first, ...rest.slice(0, count + 1)].join('\n'))
  return [first, ...attempts].find(isExpression)
}

/** `console.log(value)` claims something about the value, not about what log returns. */
const claimedExpression = (expression: ts.Expression, file: ts.SourceFile): string => {
  const isLog =
    ts.isCallExpression(expression) &&
    expression.expression.getText(file) === 'console.log' &&
    expression.arguments.length === 1
  return isLog ? (expression.arguments[0]?.getText(file) ?? '') : expression.getText(file)
}

type Edit = { readonly start: number; readonly end: number; readonly text: string }

const claimCall = (line: number, actual: string, expected: string): string =>
  `await __claim(${line}, () => (${actual}), () => (${toConstructors(expected)}));`

const editFor = (statement: ts.Statement, file: ts.SourceFile, expected: string): Edit | undefined => {
  const line = file.getLineAndCharacterOfPosition(statement.getStart(file)).line
  if (ts.isExpressionStatement(statement)) {
    const actual = claimedExpression(statement.expression, file)
    const text = claimCall(line, actual, expected)
    return { start: statement.getStart(file), end: statement.getEnd(), text }
  }
  const [declaration] = ts.isVariableStatement(statement) ? statement.declarationList.declarations : []
  if (!declaration || !ts.isIdentifier(declaration.name)) return undefined
  const text = `\n${claimCall(line, declaration.name.text, expected)}`
  return { start: statement.getEnd(), end: statement.getEnd(), text }
}

const applyEdits = (source: string, edits: readonly Edit[]): string =>
  [...edits]
    .sort((first, second) => second.start - first.start)
    .reduce((code, { start, end, text }) => code.slice(0, start) + text + code.slice(end), source)

/** Rewrites an example so every claim it makes is checked. Returns how many there were. */
export const withClaims = (source: string): { readonly code: string; readonly claims: number } => {
  const file = ts.createSourceFile('example.ts', source, ts.ScriptTarget.ES2022, true)
  const edits = file.statements.flatMap((statement, index) => {
    const next = file.statements[index + 1]
    const expected = claimAfter(source, statement.getEnd(), next ? next.getStart(file) : source.length)
    const edit = expected === undefined ? undefined : editFor(statement, file, expected)
    return edit ? [edit] : []
  })
  return { code: applyEdits(source, edits), claims: edits.length }
}
