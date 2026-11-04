import type { CSSProperties } from 'react'
import * as R from 'remeda'
import { Rail, Station } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { pipeContent } from '@/content/home.content'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'
import { stagePosition, stageSize } from '@/lib/stage'

/** Each call's box in the nesting, outermost first. */
const NEST_BOXES = [
  { x: 64, y: 340, width: 560, height: 430, fill: 'bg-ink-2' },
  { x: 112, y: 388, width: 464, height: 334, fill: 'bg-ink-3' },
  { x: 160, y: 436, width: 368, height: 238, fill: 'bg-ink-4' },
  { x: 208, y: 484, width: 272, height: 142, fill: 'bg-ink-5' },
] as const

type Box = (typeof NEST_BOXES)[number]

const STATION_Y = [215, 325, 435, 545, 655] as const
const LABEL_X = 816
const TARGET_BOX = { width: 200, height: 68 } as const
const LABEL_SCALE = 22 / 42

/** Where each pipe step starts in the nesting: raw at the core, save on the outside. */
const STEP_ORIGINS = [
  { x: 322, y: 536 },
  { x: 226, y: 496 },
  { x: 178, y: 448 },
  { x: 130, y: 400 },
  { x: 82, y: 352 },
] as const

/** Each box travels with the call it belongs to, so the outermost box is the last step. */
const FLYING_BOXES = R.map(NEST_BOXES, (box, index) => ({ box, step: NEST_BOXES.length - index }))

const stepStyle = (step: number): CSSProperties => {
  const origin = STEP_ORIGINS[step] ?? { x: 0, y: 0 }
  const y = (STATION_Y[step] ?? 0) - 28
  return {
    '--t': `var(--unfold-${step}, 1)`,
    '--dx': origin.x - LABEL_X,
    '--dy': origin.y - y,
    '--sx': LABEL_SCALE,
    ...stagePosition(LABEL_X, y),
  } as CSSProperties
}

const flyingBoxStyle = (box: Box, step: number): CSSProperties => {
  const x = LABEL_X - 16
  const y = (STATION_Y[step] ?? 0) - 34
  return {
    '--t': `var(--unfold-${step}, 1)`,
    '--dx': box.x - x,
    '--dy': box.y - y,
    '--sx': box.width / TARGET_BOX.width,
    '--sy': box.height / TARGET_BOX.height,
    ...stagePosition(x, y),
    width: stageSize(TARGET_BOX.width),
    height: stageSize(TARGET_BOX.height),
  } as CSSProperties
}

const boxStyle = ({ x, y, width, height }: Box): CSSProperties => ({
  ...stagePosition(x, y),
  width: stageSize(width),
  height: stageSize(height),
})

type PipeSceneProps = { readonly copy: typeof pipeContent }

/** Nested calls read inside out. The same calls on a rail read top to bottom. */
export const PipeScene = ({ copy }: PipeSceneProps) => (
  <Scene tone="ink" height={SCENE_HEIGHT.pipe}>
    {/* the rail with a station per step */}
    <Rail path={RAIL.pipe} height={SCENE_HEIGHT.pipe} base="ink" paint="ok-on-ink" token={{ x: 720, y: 380, size: 30 }} tailX={720}>
      {STATION_Y.map((y) => (
        <Station key={y} x={720} y={y} className="fill-ink stroke-on-ink" />
      ))}
    </Rail>

    {/* heading */}
    <div className="flex flex-col gap-8 lg:absolute lg:top-92 lg:left-64">
      <p className="font-machine text-[0.9375rem] text-on-ink-3">{copy.eyebrow}</p>
      <Headline lines={copy.headline} className="text-display-4 text-on-ink" />
    </div>

    {/* the nesting, on the stage */}
    <div className="absolute inset-0 hidden lg:block lg:parallax-85 scrub:nest-fade">
      {NEST_BOXES.map((box, index) => (
        <div key={box.x} style={boxStyle(box)} className={cx('absolute border border-ink-line', box.fill)}>
          <p className="m-14 font-machine text-[1.375rem] text-on-ink">{copy.nested[index]}</p>
        </div>
      ))}
      <p className="absolute top-536 left-322 font-machine text-[1.875rem] font-medium text-code-string-ink">
        {copy.nestedCore}
      </p>
    </div>
    <Eyebrow className="hidden text-on-ink-3 lg:absolute lg:top-800 lg:left-64 lg:block">{copy.nestedLabel}</Eyebrow>

    {/* the nesting on small screens, as the one line it really is */}
    <p className="font-machine text-[0.8125rem] text-on-ink-2 lg:hidden">
      {copy.nested.join('')}
      {copy.nestedCore}
      {copy.closingParens}
    </p>

    {/* each call's box travelling to its station */}
    <div aria-hidden className="absolute inset-0 hidden scrub:block">
      {FLYING_BOXES.map(({ box, step }) => (
        <div key={step} style={flyingBoxStyle(box, step)} className={cx('absolute fly fly-box border border-ink-line', box.fill)} />
      ))}
    </div>

    {/* the flat pipe */}
    <p className="font-machine text-code-1 lg:absolute lg:top-100 lg:left-770">{copy.open}</p>
    <ol className="flex flex-col gap-10 pl-24 lg:static lg:pl-0">
      {copy.steps.map((step, index) => (
        <li
          key={step}
          style={stepStyle(index)}
          className={cx(
            'font-machine text-code-1 font-medium lg:absolute lg:fly lg:fly-label',
            index === 0 ? 'text-code-string-ink' : 'text-on-ink',
          )}
        >
          {step}
        </li>
      ))}
    </ol>
    <p className="font-machine text-code-1 lg:absolute lg:top-715 lg:left-770">{copy.close}</p>
    <p className="label font-semibold text-ok-on-ink lg:absolute lg:top-800 lg:left-770">{copy.flatLabel}</p>

    {/* why it matters */}
    <p className="font-human text-[1.6875rem] leading-[1.26] text-on-ink-2 italic lg:absolute lg:top-400 lg:left-1090 lg:w-290">
      {copy.aside}
    </p>
  </Scene>
)
