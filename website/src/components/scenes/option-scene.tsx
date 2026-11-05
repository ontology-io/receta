import { CodeBlock } from '@/components/primitives/code-block'
import { Rail, Station } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { optionContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const NONE_X = 960
const SOME_X = 1340
const ROW_Y = [250, 480, 710] as const
const LAST_ROW = 2
const SHAPE_RADIUS = 44

type OptionRow = (typeof optionContent)['rows'][number]

type LaneLabelProps = { readonly x: number; readonly y: number; readonly text: string; readonly anchor: 'middle' | 'end' }

/** A label that cuts through the rail behind it, like a stop name on a transit map. */
const LaneLabel = ({ x, y, text, anchor }: LaneLabelProps) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    paintOrder="stroke"
    className="fill-on-paper-2 stroke-paper stroke-8 font-machine text-[15px]"
  >
    {text}
  </text>
)

type LaneRowProps = { readonly row: OptionRow; readonly y: number; readonly isUnwrap: boolean }

/** One stage of the pipe, seen on both lanes. */
const LaneRow = ({ row, y, isUnwrap }: LaneRowProps) => (
  <g>
    {/* platform across the lanes */}
    <path d={`M 1006 ${y} H 1294`} className="stroke-paper-line stroke-2" />
    <text x={1150} y={y - 14} textAnchor="middle" className="fill-on-paper font-machine text-[16px] font-medium">
      {row.code}
    </text>

    {/* Some keeps its disc */}
    <circle cx={SOME_X} cy={y} r={SHAPE_RADIUS} className="fill-on-paper" />

    {/* None keeps its ring, until unwrapOr fills it */}
    <circle cx={NONE_X} cy={y} r={SHAPE_RADIUS - 4.5} className="fill-paper stroke-on-paper stroke-9" />
    {isUnwrap && <circle cx={NONE_X} cy={y} r={SHAPE_RADIUS} className="fill-on-paper [opacity:var(--reveal,1)]" />}

    {/* what each lane holds */}
    <LaneLabel x={NONE_X} y={y + 70} text={row.none} anchor="middle" />
    <LaneLabel x={1404} y={y + 70} text={row.some} anchor="end" />
  </g>
)

type LaneShapeProps = { readonly label: string; readonly isHollow: boolean }

/** One lane's value on small screens. */
const LaneShape = ({ label, isHollow }: LaneShapeProps) => (
  <div className="flex flex-col items-center gap-6">
    <span className={cx('size-44 rounded-full border-5 border-on-paper', !isHollow && 'bg-on-paper')} />
    <span className="font-machine text-[0.75rem] text-on-paper-2">{label}</span>
  </div>
)

type OptionSceneProps = {
  readonly copy: typeof optionContent
  readonly code: readonly CodeLine[]
}

/** The same pipe with a value and without one. Absence stays visible until the edge. */
export const OptionScene = ({ copy, code }: OptionSceneProps) => (
  <Scene block="option" tone="paper" height={SCENE_HEIGHT.option}>
    {/* far plane: the ring of None */}
    <div aria-hidden className="absolute inset-0 hidden lg:block lg:parallax-40">
      <div className="absolute -top-40 left-690 size-1000 rounded-full border-50 border-paper-2" />
    </div>

    {/* both lanes */}
    <Rail path={RAIL.option} height={SCENE_HEIGHT.option} base="paper" paint="ok" token={{ x: SOME_X, y: 360, size: 30 }}>
      <path d={RAIL.optionNone} className="fill-none stroke-on-paper stroke-3" strokeLinecap="round" />
      <Station x={SOME_X} y={110} size={22} className="fill-paper stroke-on-paper" />
      <text x={1090} y={90} className="fill-on-paper-3 font-machine text-[15px]">
        {copy.forkLabel}
      </text>
      {copy.rows.map((row, index) => (
        <LaneRow key={row.code} row={row} y={ROW_Y[index] ?? 0} isUnwrap={index === LAST_ROW} />
      ))}
    </Rail>

    {/* heading */}
    <div className="flex flex-col gap-10 lg:absolute lg:top-172 lg:left-64 lg:w-760">
      <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={[copy.headline]} className="text-display-4" />
    </div>
    <p className="font-human text-lede text-on-paper-2 lg:absolute lg:top-328 lg:left-64 lg:w-600">{copy.body}</p>

    {/* the lanes on small screens */}
    <ol className="flex flex-col gap-24 lg:hidden">
      {copy.rows.map((row, index) => (
        <li key={row.code} className="flex flex-col gap-10">
          <p className="font-machine text-[0.8125rem] font-medium">{row.code}</p>
          <div className="flex flex-row justify-between">
            <LaneShape label={row.none} isHollow={index !== LAST_ROW} />
            <LaneShape label={row.some} isHollow={false} />
          </div>
        </li>
      ))}
    </ol>

    {/* the code, with the type at each stage */}
    <div className="flex flex-row lg:absolute lg:top-510 lg:left-64 lg:gap-24">
      <CodeBlock lines={code} tone="paper" className="text-code-4 leading-[2]" />
      <ul className="hidden lg:mt-76 lg:flex lg:flex-col lg:gap-9">
        {copy.typeHints.map((hint) => (
          <li key={hint} className="w-fit bg-paper-2 px-8 py-3 font-machine text-[0.875rem] text-ok">
            {hint}
          </li>
        ))}
      </ul>
    </div>
  </Scene>
)
