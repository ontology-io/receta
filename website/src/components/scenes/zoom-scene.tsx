import type { CSSProperties } from 'react'
import { CodeBlock } from '@/components/primitives/code-block'
import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { zoomContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'
import { REST_CAMERA, ZOOM_BOXES } from '@/lib/motion/timelines'

const CODE_SIZE = 88
const CHARACTER_WIDTH = CODE_SIZE * 0.6
const LINE_HEIGHT = CODE_SIZE * 1.6
const SOURCE_WIDTH = 72 * CHARACTER_WIDTH
const SOURCE_HEIGHT = 14 * LINE_HEIGHT

const CAMERA_REST = {
  '--rest-x': REST_CAMERA.x,
  '--rest-y': REST_CAMERA.y,
  '--rest-scale': REST_CAMERA.scale,
} as CSSProperties

/** Level boxes light up at their stop and hide when the camera is too close to frame them. */
const LEVEL_BOX_CLASS = [
  'in-data-[level=0]:stroke-ok-on-ink',
  'in-data-[level=1]:stroke-ok-on-ink',
  'in-data-[level=0]:opacity-0 in-data-[level=2]:stroke-ok-on-ink',
  'in-data-[level=0]:opacity-0 in-data-[level=1]:opacity-0 in-data-[level=3]:stroke-ok-on-ink',
  'in-data-[level=0]:opacity-0 in-data-[level=1]:opacity-0 in-data-[level=2]:opacity-0 in-data-[level=4]:stroke-ok-on-ink',
] as const

const ROW_ACTIVE_CLASS = [
  'lg:in-data-[level=0]:text-on-ink',
  'lg:in-data-[level=1]:text-on-ink',
  'lg:in-data-[level=2]:text-on-ink',
  'lg:in-data-[level=3]:text-on-ink',
  'lg:in-data-[level=4]:text-on-ink',
] as const

const DETAIL_ACTIVE_CLASS = [
  'lg:in-data-[level=0]:opacity-100',
  'lg:in-data-[level=1]:opacity-100',
  'lg:in-data-[level=2]:opacity-100',
  'lg:in-data-[level=3]:opacity-100',
  'lg:in-data-[level=4]:opacity-100',
] as const

type LevelBoxProps = { readonly box: (typeof ZOOM_BOXES)[number]; readonly level: number }

/** The frame around one level of the code. */
const LevelBox = ({ box, level }: LevelBoxProps) => {
  const padX = CODE_SIZE * (0.2 + level * 0.12)
  const padY = CODE_SIZE * (level * 0.06 - 0.05)
  return (
    <rect
      x={box.column * CHARACTER_WIDTH - padX}
      y={box.line * LINE_HEIGHT - padY}
      width={box.width * CHARACTER_WIDTH + padX * 2}
      height={box.height * LINE_HEIGHT + padY * 2}
      vectorEffect="non-scaling-stroke"
      className={cx('fill-none stroke-[#5a4f44] stroke-2 transition-[stroke,opacity] duration-200', LEVEL_BOX_CLASS[level])}
    />
  )
}

type ZoomSceneProps = {
  readonly copy: typeof zoomContent
  readonly source: readonly CodeLine[]
  readonly narrowSource: readonly CodeLine[]
}

/** One real module seen at five zooms: from a single name out to the whole file. */
export const ZoomScene = ({ copy, source, narrowSource }: ZoomSceneProps) => (
  <Scene tone="ink" height={SCENE_HEIGHT.zoom}>
    {/* the rail */}
    <Rail path={RAIL.zoom} height={SCENE_HEIGHT.zoom} base="ink" paint="ok-on-ink" token={{ x: 104, y: 430, size: 30 }} tailX={104} />

    {/* the camera on the code */}
    <div aria-hidden style={CAMERA_REST} className="absolute top-110 left-140 hidden h-640 w-760 overflow-clip lg:block">
      <div className="absolute top-0 left-0 w-max camera">
        <CodeBlock lines={source} tone="ink" className="text-[5.5rem] leading-[1.6]" />
        <svg viewBox={`0 0 ${SOURCE_WIDTH} ${SOURCE_HEIGHT}`} className="absolute top-0 left-0 w-3802 overflow-visible">
          {ZOOM_BOXES.map((box, level) => (
            <LevelBox key={level} box={box} level={level} />
          ))}
        </svg>
      </div>

      {/* soft edges on the crop */}
      <div className="absolute inset-x-0 top-0 h-120 bg-linear-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-120 bg-linear-to-t from-ink to-transparent" />
      <div className="absolute inset-y-0 right-0 w-110 bg-linear-to-l from-ink to-transparent" />
    </div>

    {/* the code on small screens */}
    <CodeBlock lines={narrowSource} tone="ink" className="order-2 overflow-x-auto text-code-6 leading-[1.7] lg:hidden" />

    {/* heading */}
    <div className="flex flex-col gap-8 lg:absolute lg:top-110 lg:left-950">
      <Eyebrow className="text-on-ink-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={copy.headline} className="text-display-5 text-on-ink" />
    </div>

    {/* the five levels */}
    <ol className="relative order-3 flex flex-col gap-18 lg:absolute lg:top-326 lg:left-950 lg:w-426 lg:gap-12">
      {copy.levels.map((level, index) => (
        <li key={level.name} className="flex flex-col gap-6">
          {/* level name */}
          <p
            className={cx(
              'flex flex-row items-baseline gap-14 font-human text-[1.625rem] transition-colors duration-200 lg:text-on-ink-3',
              ROW_ACTIVE_CLASS[index],
            )}
          >
            <span className="font-machine text-[0.9375rem]">{index + 1}</span>
            {level.name}
          </p>

          {/* the question and how it fails */}
          <div
            className={cx(
              'flex flex-col gap-6 transition-opacity duration-200 lg:absolute lg:top-full lg:left-0 lg:mt-24 lg:w-full lg:opacity-0',
              DETAIL_ACTIVE_CLASS[index],
            )}
          >
            <p className="font-human text-body text-on-ink">{level.question}</p>
            <p className="label text-err">{copy.failsLabel}</p>
            <p className="font-human text-note text-on-ink-2 italic">{level.fails}</p>
          </div>
        </li>
      ))}
    </ol>

    {/* the quick test */}
    <p className="order-4 font-human text-[1.5rem] leading-[1.3] text-on-ink-2 italic lg:absolute lg:top-786 lg:left-160 lg:w-720">
      {copy.quickTest}
    </p>
  </Scene>
)
