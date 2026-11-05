import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

type RailBase = 'ink' | 'paper' | 'ok'
export type RailPaint = 'err' | 'ok' | 'ok-on-ink' | 'paper' | 'phase'

const BASE_CLASS: Record<RailBase, string> = {
  ink: 'stroke-on-ink-3',
  paper: 'stroke-on-paper',
  ok: 'stroke-paper',
}

const PAINT_STROKE: Record<RailPaint, string> = {
  err: 'stroke-err',
  ok: 'stroke-ok',
  'ok-on-ink': 'stroke-ok-on-ink',
  paper: 'stroke-paper',
  phase: 'stroke-err transition-[stroke] duration-300 in-data-[phase=story]:stroke-ok',
}

const PAINT_FILL: Record<RailPaint, string> = {
  err: 'fill-err',
  ok: 'fill-ok',
  'ok-on-ink': 'fill-ok-on-ink',
  paper: 'fill-paper',
  phase: 'fill-err transition-[fill] duration-300 in-data-[phase=story]:fill-ok',
}

const TAIL_LENGTH = 900

type RailDisplay = 'stage' | 'static' | 'scrub'

const DISPLAY_CLASS: Record<RailDisplay, string> = {
  stage: 'hidden lg:block',
  static: 'hidden lg:block scrub:hidden',
  scrub: 'hidden scrub:block',
}

type RailToken = { readonly x: number; readonly y: number; readonly size: number }

type RailProps = {
  readonly path: string
  readonly height: number
  readonly base: RailBase
  readonly paint: RailPaint
  /** Where the value rests when nothing is scrolling. */
  readonly token: RailToken
  /** Which layouts show this stretch. Scrubbed scenes swap their static rail for a morphing one. */
  readonly display?: RailDisplay
  readonly shouldMorph?: boolean
  /** Carries the track below the stage, for pinned scenes in windows taller than the stage. */
  readonly tailX?: number
  /** Drawn under the value: stations, side tracks, labels. */
  readonly children?: ReactNode
}

/**
 * A stretch of the rail: the track, the painted part behind the value, and the value
 * itself. The scroll stage drives it through its data attributes.
 */
export const Rail = ({
  path,
  height,
  base,
  paint,
  token,
  display = 'stage',
  shouldMorph = false,
  tailX,
  children,
}: RailProps) => (
  <svg
    data-rail
    data-rail-morph={shouldMorph || undefined}
    aria-hidden
    viewBox={`0 0 1440 ${height}`}
    className={cx('absolute top-0 left-0 w-1440 overflow-visible', DISPLAY_CLASS[display])}
  >
    {/* track */}
    <path data-rail-base d={path} className={cx('fill-none stroke-3', BASE_CLASS[base])} strokeLinecap="round" />

    {/* track past the bottom of the stage */}
    {tailX !== undefined && (
      <path d={`M ${tailX} ${height} v ${TAIL_LENGTH}`} className={cx('fill-none stroke-3', BASE_CLASS[base])} />
    )}

    {/* track already travelled */}
    <path
      data-rail-paint
      d={path}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1}
      strokeLinecap="round"
      className={cx('hidden fill-none stroke-3 scrub:block', PAINT_STROKE[paint])}
    />

    {/* stations and side tracks */}
    {children}

    {/* the value */}
    <circle data-token cx={token.x} cy={token.y} r={token.size / 2} className={PAINT_FILL[paint]} />
  </svg>
)

type StationProps = {
  readonly x: number
  readonly y: number
  readonly size?: number
  readonly className?: string
}

/** One named step on the rail. */
export const Station = ({ x, y, size = 24, className }: StationProps) => (
  <circle cx={x} cy={y} r={size / 2 - 1.5} className={cx('stroke-3', className)} />
)
