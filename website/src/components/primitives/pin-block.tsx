import type { CSSProperties, ReactNode } from 'react'
import { cx } from '@/lib/cx'

type PinBlockProps = {
  readonly block: string
  /** Extra scroll distance while the scene holds still, in viewport heights. */
  readonly pin: number
  readonly height: number
  readonly id?: string
  /** Starting values for the attributes this block's timeline writes. */
  readonly attributes?: Readonly<Record<string, string>>
  readonly className?: string
  readonly children: ReactNode
}

/**
 * Holds a scene still while scrolling drives it. Without motion, or below the stage
 * layout, it adds nothing and the scene scrolls like any other.
 */
export const PinBlock = ({ block, pin, height, id, attributes, className, children }: PinBlockProps) => (
  <div
    id={id}
    data-block={block}
    {...attributes}
    style={{ '--pin': pin, '--stage-height': height } as CSSProperties}
    className={cx('scrub:pin-height', className)}
  >
    {/* the part that stays on screen */}
    <div data-pin-stage className="scrub:pin-stage scrub:sticky scrub:top-0 scrub:overflow-clip">
      {children}
    </div>
  </div>
)
