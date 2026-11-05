import type { CSSProperties } from 'react'
import { CodeBlock, CodeTokens } from '@/components/primitives/code-block'
import { EvidenceMarker } from '@/components/primitives/evidence-marker'
import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { crimeContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { cx } from '@/lib/cx'
import type { CrimeLine } from '@/lib/motion/crime-lines'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'
import { stagePosition } from '@/lib/stage'

const CODE_TOP = 270
const CODE_LINE_HEIGHT = 38
const CHARACTER_WIDTH = 14.4

/** Evidence markers sit at the end of the line they point at. */
const MARKER_LINES = [
  { label: '1', line: 2, column: 33 },
  { label: '2', line: 3, column: 27 },
  { label: '3', line: 5, column: 15 },
] as const

type Marker = (typeof MARKER_LINES)[number]

const markerStyle = ({ line, column }: Marker, order: number): CSSProperties =>
  ({
    ...stagePosition(64 + column * CHARACTER_WIDTH + 16, CODE_TOP + line * CODE_LINE_HEIGHT + 2),
    '--order': order,
  }) as CSSProperties

const lineStyle = ({ dx, dy, turn }: CrimeLine): CSSProperties =>
  ({ '--dx': dx, '--dy': dy, '--turn': turn }) as CSSProperties

type FallingCodeProps = { readonly lines: readonly CrimeLine[] }

/** The crime scene code, line by line, so each line can leave on its own. */
const FallingCode = ({ lines }: FallingCodeProps) => (
  <pre className="absolute top-270 left-64 hidden font-machine text-code-3 leading-[1.583] whitespace-pre lg:block scrub:leave">
    <code>
      {lines.map((line, index) => (
        <span
          key={index}
          style={lineStyle(line)}
          className={cx(
            'block origin-left scrub:fall-line',
            line.isKept
              ? 'not-in-data-[phase=crime]:*:text-on-ink!'
              : 'not-in-data-[phase=crime]:*:text-err!',
          )}
        >
          <CodeTokens line={line.tokens} tone="evidence" />
        </span>
      ))}
    </code>
  </pre>
)

type CrimeSceneProps = {
  readonly copy: typeof crimeContent
  readonly lines: readonly CrimeLine[]
  readonly narrowLines: readonly CodeLine[]
}

/** Three facts the code hides, and a rail that shows the control flow it really has. */
export const CrimeScene = ({ copy, lines, narrowLines }: CrimeSceneProps) => (
  <Scene
    tone="ink"
    height={SCENE_HEIGHT.crime}
    mobileTokenClassName="bg-err"
    className="scrub:absolute scrub:inset-0 scrub:bg-transparent"
  >
    {/* the tangled rail, when nothing is scrubbing it */}
    <Rail
      path={RAIL.crime}
      height={SCENE_HEIGHT.crime}
      base="ink"
      paint="err"
      token={{ x: 1295, y: 505, size: 24 }}
      display="static"
    />

    {/* the exits the signature doesn't mention */}
    <svg aria-hidden viewBox="0 0 1440 900" className="absolute top-0 left-0 hidden w-1440 overflow-visible lg:block scrub:fade-on-fall">
      <path d="M 1196 208 C 1240 192 1330 140 1384 165" className="fill-none stroke-err stroke-3" />
      <path d="M 1129 328 C 1090 290 960 225 900 270" className="fill-none stroke-err stroke-3" />
      <circle cx={1384} cy={165} r={8} className="fill-err" />
      <circle cx={900} cy={270} r={8} className="fill-err" />
      <text x={1340} y={140} className="fill-err font-machine text-[15px] font-medium">
        {copy.exits.hidden}
      </text>
      <text x={862} y={246} className="fill-err font-machine text-[15px] font-medium">
        {copy.exits.hidden}
      </text>
      <text x={1200} y={760} className="fill-on-ink-3 font-machine text-[15px]">
        {copy.exits.visible}
      </text>
    </svg>

    {/* heading */}
    <div className="flex flex-col gap-10 lg:absolute lg:top-96 lg:left-64 lg:w-700 scrub:fade-on-fall">
      <Eyebrow className="text-on-ink-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={[copy.headline]} className="text-display-6 text-on-ink" />
    </div>

    {/* the code, wrapped for small screens */}
    <CodeBlock lines={narrowLines} tone="evidence" className="text-code-3 leading-[1.75] lg:hidden" />

    {/* the code on the stage */}
    <FallingCode lines={lines} />

    {/* markers on the code */}
    <div className="absolute inset-0 hidden lg:block scrub:fade-on-fall">
      {MARKER_LINES.map((marker, order) => (
        <EvidenceMarker
          key={marker.label}
          label={marker.label}
          style={markerStyle(marker, order)}
          className="absolute scrub:stamp-in"
        />
      ))}
    </div>

    {/* what each marker means */}
    <div className="flex flex-col gap-14 lg:absolute lg:top-650 lg:left-64 lg:flex-row lg:gap-24 scrub:fade-on-fall">
      {copy.notes.map((note) => (
        <div key={note.marker} className="flex flex-row gap-12 lg:w-220 lg:flex-col">
          <EvidenceMarker label={note.marker} />
          <p className="font-human text-note text-on-ink-2">{note.text}</p>
        </div>
      ))}
    </div>

    {/* what the exits add up to */}
    <p className="hidden font-human text-[1.75rem] leading-[1.2] text-on-ink italic lg:absolute lg:top-750 lg:left-860 lg:block lg:w-290 scrub:fade-on-fall">
      {copy.caption}
    </p>
  </Scene>
)
