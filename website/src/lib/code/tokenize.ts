// Turns source lines into coloured tokens. Runs at build time, so the page ships
// plain spans and no highlighter. Start at tokenizeLines.
import * as R from 'remeda'

export type TokenKind =
  | 'plain'
  | 'space'
  | 'keyword'
  | 'string'
  | 'number'
  | 'type'
  | 'call'
  | 'punctuation'
  | 'err'
  | 'evidence'

export type Token = { readonly text: string; readonly kind: TokenKind }
export type CodeLine = readonly Token[]

/** Words a sample wants picked out, with the kind that overrides their normal colour. */
export type Emphasis = Readonly<Record<string, TokenKind>>

const KEYWORDS: ReadonlySet<string> = new Set([
  'async',
  'await',
  'catch',
  'const',
  'export',
  'from',
  'function',
  'if',
  'import',
  'let',
  'return',
  'throw',
  'try',
  'type',
])

const TOKEN_PATTERN = /'[^']*'|`[^`]*`|[A-Za-z_$][\w$]*|\d+|\s+|[^\sA-Za-z_$\d'`]+/g

/**
 * Tokenizes source lines. Joining a line's token text gives back the exact source
 * line, so the rendered code stays selectable and copyable.
 */
export const tokenizeLines = (
  lines: readonly string[],
  emphasis: Emphasis = {},
): readonly CodeLine[] => R.map(lines, (line) => tokenizeLine(line, emphasis))

const tokenizeLine = (line: string, emphasis: Emphasis): CodeLine =>
  R.map([...line.matchAll(TOKEN_PATTERN)], (match) => {
    const text = match[0]
    const nextCharacter = line[match.index + text.length]
    return { text, kind: emphasis[text] ?? kindOf(text, nextCharacter) }
  })

const kindOf = (text: string, nextCharacter: string | undefined): TokenKind => {
  if (/^\s/.test(text)) return 'space'
  if (/^['`]/.test(text)) return 'string'
  if (/^\d/.test(text)) return 'number'
  if (KEYWORDS.has(text)) return 'keyword'
  if (/^[A-Z]/.test(text)) return 'type'
  if (/^[A-Za-z_$]/.test(text)) return nextCharacter === '(' ? 'call' : 'plain'
  return 'punctuation'
}
