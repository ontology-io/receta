import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'

type EvidenceMarkerProps = {
  readonly label: string
  readonly style?: CSSProperties
  readonly className?: string
}

/** A numbered tent card: a fact the code hides. */
export const EvidenceMarker = ({ label, style, className }: EvidenceMarkerProps) => (
  <span
    style={style}
    className={cx(
      'flex size-28 shrink-0 flex-row items-center justify-center rounded-[3px] bg-warn font-machine text-[0.9375rem] font-semibold text-ink lg:size-34 lg:text-[1.0625rem]',
      className,
    )}
  >
    {label}
  </span>
)
