import * as R from 'remeda'
import { CodeBlock } from '@/components/primitives/code-block'
import { Rail, Station } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { railwayContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const TRACK_Y = 430
const ERR_Y = 610
const STATION_X = [300, 560, 820, 1080] as const
const FORK_INDEX = 1
const FOLLOWER_PATH = 'M 190 430 H 560 V 550 Q 560 610 620 610 H 950'

const SLEEPER_GAP = 26
const SLEEPER_REACH = 11

const sleepers = (from: number, to: number, y: number): string =>
  R.pipe(
    R.range(0, Math.floor((to - from) / SLEEPER_GAP)),
    R.map((index) => `M ${from + index * SLEEPER_GAP} ${y - SLEEPER_REACH} V ${y + SLEEPER_REACH}`),
    R.join(' '),
  )

const OK_SLEEPERS = sleepers(190, 1290, TRACK_Y)
const ERR_SLEEPERS = sleepers(640, 950, ERR_Y)

type RailwayCopy = typeof railwayContent

type TerminalProps = { readonly label: string; readonly className: string }

/** Where a track ends. */
const Terminal = ({ label, className }: TerminalProps) => (
  <p className={cx('absolute px-20 py-13 font-machine text-[1.125rem] font-medium whitespace-nowrap', className)}>{label}</p>
)

type VerticalRailwayProps = { readonly copy: RailwayCopy }

/** The railway on small screens: the Ok track runs down the edge, Err down the right. */
const VerticalRailway = ({ copy }: VerticalRailwayProps) => (
  <div className="relative -ml-48 h-480 lg:hidden">
    {/* the Err track */}
    <svg aria-hidden viewBox="0 0 390 480" className="absolute inset-0 size-full overflow-visible">
      <path d="M 22 90 H 306 Q 342 90 342 126 V 390" className="fill-none stroke-err stroke-3" />
      <circle cx={342} cy={220} r={10} className="fill-err" />
      <circle cx={22} cy={90} r={8.5} className="fill-paper stroke-err stroke-3" />
    </svg>

    {/* stations down the Ok track */}
    <ol className="absolute top-0 left-48 flex flex-col gap-44 font-machine text-[0.9375rem] font-medium">
      {copy.stations.map((station) => (
        <li key={station}>{station}</li>
      ))}
    </ol>

    {/* where each track ends */}
    <p className="absolute top-320 left-48 bg-ok px-14 py-9 font-machine text-[0.9375rem] font-medium text-paper">
      {copy.okTerminal}
    </p>
    <p className="absolute top-390 right-24 bg-err px-14 py-11 font-machine text-[0.8125rem] font-medium text-ink">
      {copy.errTerminal}
    </p>
    <p className="absolute top-444 right-24 font-machine text-[0.8125rem] font-medium text-err-text">{copy.skipped}</p>
  </div>
)

type RailwaySceneProps = {
  readonly copy: RailwayCopy
  readonly edgeCode: readonly CodeLine[]
}

/** The same pipe carrying two values, so both tracks are visible at once. */
export const RailwayScene = ({ copy, edgeCode }: RailwaySceneProps) => (
  <Scene tone="paper" height={SCENE_HEIGHT.railway}>
    {/* far plane: sleepers under the track */}
    <svg aria-hidden viewBox="0 0 1440 900" className="absolute top-0 left-0 hidden w-1440 overflow-visible lg:block lg:parallax-92">
      <path d={OK_SLEEPERS} className="stroke-paper-line stroke-2" />
      <path d={ERR_SLEEPERS} className="stroke-err/30 stroke-2" />
    </svg>

    {/* heading */}
    <div className="flex flex-col gap-10 lg:absolute lg:top-92 lg:left-170">
      <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={[copy.headline]} className="text-display-3" />
    </div>
    <p className="font-human text-body text-on-paper-2 lg:absolute lg:top-118 lg:left-980 lg:w-300">{copy.body}</p>

    {/* tracks, stations and both values */}
    <Rail path={RAIL.railway} height={SCENE_HEIGHT.railway} base="paper" paint="ok" token={{ x: 950, y: TRACK_Y, size: 30 }} tailX={1340}>
      <path d={RAIL.railwayErr} className="fill-none stroke-err stroke-3" strokeLinecap="round" />
      {STATION_X.map((x, index) => (
        <Station key={x} x={x} y={TRACK_Y} className={cx('fill-paper', index === FORK_INDEX ? 'stroke-err' : 'stroke-on-paper')} />
      ))}
      {copy.stations.map((station, index) => (
        <text key={station} x={STATION_X[index]} y={TRACK_Y - 38} textAnchor="middle" className="fill-on-paper font-machine text-[17px] font-medium">
          {station}
        </text>
      ))}
      <path data-follow-path d={FOLLOWER_PATH} className="fill-none stroke-none" />
      <circle data-follow-token cx={790} cy={ERR_Y} r={15} className="fill-err" />
    </Rail>

    {/* where the tracks end */}
    <div className="absolute inset-0 hidden lg:block">
      <Terminal label={copy.okTerminal} className="top-404 left-1160 bg-ok text-paper" />
      <Terminal label={copy.errTerminal} className="top-584 left-950 bg-err text-ink" />
      <p className="absolute top-634 left-626 font-machine text-[0.9375rem] font-medium text-err-text">{copy.skipped}</p>
    </div>

    {/* the railway on small screens */}
    <VerticalRailway copy={copy} />

    {/* the edge */}
    <div className="flex flex-col gap-8 lg:absolute lg:top-716 lg:left-170">
      <Eyebrow className="text-on-paper-3">{copy.edgeLabel}</Eyebrow>
      <CodeBlock lines={edgeCode} tone="paper" className="text-code-5 leading-[1.76]" />
    </div>
    <div className="flex flex-col gap-8 lg:absolute lg:top-726 lg:left-800 lg:w-440">
      <p className="font-human text-[2.125rem] leading-[1.2] italic">{copy.edgeCaption}</p>
      <p className="font-human text-note text-on-paper-2">{copy.edgeBody}</p>
    </div>
  </Scene>
)
