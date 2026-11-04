import type { CodeLine, TokenKind } from '@/lib/code/tokenize'
import { cx } from '@/lib/cx'

export type CodeTone = 'ink' | 'paper' | 'evidence'

const TOKEN_CLASS: Record<CodeTone, Record<TokenKind, string>> = {
  ink: {
    plain: 'text-on-ink',
    space: '',
    keyword: 'text-code-keyword-ink italic',
    string: 'text-code-string-ink',
    number: 'text-code-string-ink',
    type: 'text-code-type-ink',
    call: 'font-medium text-on-ink',
    punctuation: 'text-on-ink-3',
    err: 'text-err',
    evidence: 'text-warn',
  },
  paper: {
    plain: 'text-on-paper',
    space: '',
    keyword: 'text-on-paper-3 italic',
    string: 'text-code-string-paper',
    number: 'text-code-string-paper',
    type: 'text-ok',
    call: 'font-medium text-on-paper',
    punctuation: 'text-on-paper-3',
    err: 'text-err-text',
    evidence: 'text-warn',
  },
  evidence: {
    plain: 'text-on-ink-3',
    space: '',
    keyword: 'text-on-ink-3',
    string: 'text-on-ink-3',
    number: 'text-on-ink-3',
    type: 'text-on-ink-3',
    call: 'text-on-ink-3',
    punctuation: 'text-on-ink-3',
    err: 'text-err',
    evidence: 'text-warn',
  },
}

type CodeTokensProps = { readonly line: CodeLine; readonly tone: CodeTone }

/** One line of code as coloured spans. */
export const CodeTokens = ({ line, tone }: CodeTokensProps) =>
  line.map((token, index) => (
    <span key={`${index}-${token.text}`} className={TOKEN_CLASS[tone][token.kind]}>
      {token.text}
    </span>
  ))

type CodeBlockProps = {
  readonly lines: readonly CodeLine[]
  readonly tone: CodeTone
  readonly className?: string
}

/** Real, selectable code. Size and line height come from the caller. */
export const CodeBlock = ({ lines, tone, className }: CodeBlockProps) => (
  <pre className={cx('max-w-full overflow-x-auto font-machine whitespace-pre lg:overflow-visible', className)}>
    <code>
      {lines.map((line, index) => (
        <span key={index} className="block min-h-[1lh]">
          <CodeTokens line={line} tone={tone} />
        </span>
      ))}
    </code>
  </pre>
)
