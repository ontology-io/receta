import type { CSSProperties, ReactNode } from 'react'
import { cx } from '@/lib/cx'

export type Tone = 'ink' | 'paper' | 'paper-2' | 'ok'

const TONE_CLASS: Record<Tone, string> = {
  ink: 'bg-ink text-on-ink',
  paper: 'bg-paper text-on-paper',
  'paper-2': 'bg-paper-2 text-on-paper',
  ok: 'bg-ok text-paper',
}

const MOBILE_RAIL_CLASS: Record<Tone, string> = {
  ink: 'bg-on-ink-3',
  paper: 'bg-on-paper',
  'paper-2': 'bg-on-paper',
  ok: 'bg-paper',
}

const MOBILE_TOKEN_CLASS: Record<Tone, string> = {
  ink: 'bg-ok-on-ink',
  paper: 'bg-ok',
  'paper-2': 'bg-ok',
  ok: 'bg-paper',
}

type SceneProps = {
  /** Scene height in design pixels on the stage layout. */
  readonly height: number
  readonly tone: Tone
  readonly id?: string
  /** Marks the scene as a block the scroll stage drives. Pinned scenes leave this to PinBlock. */
  readonly block?: string
  readonly isAnchoredAtTop?: boolean
  readonly hasMobileRail?: boolean
  /** Overrides the colour of the value on small screens, for scenes before the story. */
  readonly mobileTokenClassName?: string
  readonly className?: string
  readonly children: ReactNode
}

/**
 * One full-bleed scene. On the stage layout its children position themselves in a
 * 1440-wide stage. Below that they flow in a single column beside the rail.
 */
export const Scene = ({
  height,
  tone,
  id,
  block,
  isAnchoredAtTop = false,
  hasMobileRail = true,
  mobileTokenClassName,
  className,
  children,
}: SceneProps) => (
  <section
    id={id}
    data-block={block}
    data-tone={tone}
    data-anchor-top={isAnchoredAtTop || undefined}
    style={{ '--stage-height': height } as CSSProperties}
    className={cx('relative isolate overflow-clip lg:stage-height', TONE_CLASS[tone], className)}
  >
    {/* rail and value on small screens: pure CSS, no scroll code */}
    {hasMobileRail && (
      <div aria-hidden className="absolute inset-y-0 left-12 w-20 lg:hidden">
        <div className={cx('absolute inset-y-0 left-8 w-3', MOBILE_RAIL_CLASS[tone])} />
        <div
          className={cx(
            'sticky top-[61svh] size-20 rounded-full',
            mobileTokenClassName ?? MOBILE_TOKEN_CLASS[tone],
          )}
        />
      </div>
    )}

    {/* stage */}
    <div
      className={cx(
        'relative flex flex-col gap-40 py-64 pr-24 lg:mx-auto lg:block lg:h-full lg:w-1440 lg:p-0',
        hasMobileRail ? 'pl-48' : 'pl-24',
      )}
    >
      {children}
    </div>
  </section>
)
