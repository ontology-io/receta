import type { ReactNode } from 'react'
import * as R from 'remeda'
import { cx } from '@/lib/cx'

type TextProps = { readonly children: ReactNode; readonly className?: string }

/** The small mono line above a heading. */
export const Eyebrow = ({ children, className }: TextProps) => (
  <p className={cx('label', className)}>{children}</p>
)

/** Spaces lines apart for readers and for wrapping, with none after the last one. */
export const spacedLines = (lines: readonly string[]): readonly string[] =>
  R.map(lines, (line, index) => (index === 0 ? line : ` ${line}`))

type HeadlineProps = {
  readonly lines: readonly string[]
  readonly className?: string
  /** Rendered after the last line, for a full stop or a screen reader's one. */
  readonly ending?: ReactNode
}

/** A heading whose line breaks are fixed on the stage and free on small screens. */
export const Headline = ({ lines, className, ending }: HeadlineProps) => (
  <h2 className={cx('font-human', className)}>
    {spacedLines(lines).map((line) => (
      <span key={line} className="lg:block">
        {line}
      </span>
    ))}
    {ending}
  </h2>
)
