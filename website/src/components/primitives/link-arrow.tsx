import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { cx } from '@/lib/cx'

type LinkArrowProps = {
  readonly href: string
  readonly label: string
  readonly direction: 'down' | 'out'
  readonly className?: string
}

/** A serif italic link with its arrow. */
export const LinkArrow = ({ href, label, direction, className }: LinkArrowProps) => (
  <a href={href} className={cx('flex w-fit flex-row items-center gap-8 font-human text-body italic', className)}>
    {label}
    {direction === 'down' ? <ArrowDown className="size-18" /> : <ArrowUpRight className="size-16" />}
  </a>
)
