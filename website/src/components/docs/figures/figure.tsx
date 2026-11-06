import { ArrowDown, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

type FigureProps = {
  readonly children: ReactNode
  /** Words that add to the drawing, shown underneath it. */
  readonly caption?: ReactNode
  /** Words that only repeat the drawing, for readers who can't see it. */
  readonly alt?: ReactNode
}

/**
 * The frame every drawn figure sits in: the same card as a code block. Whichever words it's
 * given are all that's left of the figure in the plain-text docs.
 */
export const Figure = ({ children, caption, alt }: FigureProps) => (
  <figure className="my-6">
    <div className="@container not-prose rounded-xl border bg-fd-card p-5 text-base">{children}</div>
    {caption ? (
      <figcaption className="mt-2.5 text-[0.95em] leading-snug text-fd-muted-foreground [&>p]:my-0">{caption}</figcaption>
    ) : null}
    {alt ? <figcaption className="sr-only">{alt}</figcaption> : null}
  </figure>
)

/** A drawn figure's MDX children are its words. */
export type FigureWordsProps = { readonly children?: ReactNode }

export type Tone = 'plain' | 'ok' | 'err'

const TONE_CLASS: Record<Tone, string> = {
  plain: 'border-fd-border bg-fd-background',
  ok: 'border-ok/40 bg-ok-soft text-ok',
  err: 'border-err/40 bg-err-soft text-err',
}

type BlockProps = {
  readonly tone?: Tone
  readonly className?: string
  readonly children: ReactNode
}

/** One labelled box in a drawing. The machine's voice, so it speaks mono. */
export const Block = ({ tone = 'plain', className, children }: BlockProps) => (
  <div className={cx('rounded-lg border px-3 py-2 font-mono text-sm leading-snug', TONE_CLASS[tone], className)}>
    {children}
  </div>
)

type ArrowProps = {
  readonly direction?: 'right' | 'down'
  readonly className?: string
}

export const Arrow = ({ direction = 'right', className }: ArrowProps) => {
  const Icon = direction === 'right' ? ArrowRight : ArrowDown
  return <Icon aria-hidden className={cx('size-4 shrink-0 text-fd-muted-foreground', className)} />
}
