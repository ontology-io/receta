import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { ReactElement } from 'react'
import { cx } from '@/lib/cx'

type ArrowDirection = 'down' | 'out' | 'right'

const ARROW: Record<ArrowDirection, ReactElement> = {
  down: <ArrowDown className="size-18" />,
  out: <ArrowUpRight className="size-16" />,
  right: <ArrowRight className="size-20" />,
}

type LinkArrowProps = {
  readonly href: string
  readonly label: string
  readonly direction: ArrowDirection
  readonly className?: string
}

/** A serif italic link with its arrow. */
export const LinkArrow = ({ href, label, direction, className }: LinkArrowProps) => (
  <a href={href} className={cx('flex w-fit flex-row items-center gap-8 font-human text-body italic', className)}>
    {label}
    {ARROW[direction]}
  </a>
)
