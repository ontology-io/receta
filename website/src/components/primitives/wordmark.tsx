import { cx } from '@/lib/cx'

type WordmarkProps = {
  readonly text: string
  readonly stopClassName: string
  readonly className?: string
}

/** The name with its full stop: the value, at rest. */
export const Wordmark = ({ text, stopClassName, className }: WordmarkProps) => (
  <span className={cx('flex flex-row items-end gap-3 font-human text-[1.9375rem] leading-none tracking-tight', className)}>
    {text}
    <span aria-hidden className={cx('mb-6 size-8 rounded-full', stopClassName)} />
  </span>
)
