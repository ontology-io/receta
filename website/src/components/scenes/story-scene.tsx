import type { CSSProperties } from 'react'
import { CodeBlock, CodeTokens } from '@/components/primitives/code-block'
import { Rail, Station } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { storyContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const CODE_TOP = 296
const LINE_HEIGHT = 52
const PIPE_STAGES = [4, 5, 6] as const

const stationY = (line: number): number => CODE_TOP + line * LINE_HEIGHT + LINE_HEIGHT / 2

const orderStyle = (order: number): CSSProperties => ({ '--order': order }) as CSSProperties

type StorySceneProps = {
  readonly copy: typeof storyContent
  readonly lines: readonly CodeLine[]
  readonly narrowLines: readonly CodeLine[]
}

/** The same job, honest: every line of the pipe is a station on the rail. */
export const StoryScene = ({ copy, lines, narrowLines }: StorySceneProps) => (
  <Scene
    tone="paper"
    height={SCENE_HEIGHT.story}
    className="scrub:absolute scrub:inset-0 scrub:bg-transparent"
  >
    {/* far plane: a quiet disc behind the claims */}
    <div aria-hidden className="absolute inset-0 hidden lg:block lg:parallax-40 scrub:arrive">
      <div className="absolute top-470 left-1040 size-640 rounded-full bg-paper-2" />
    </div>

    {/* one station per pipe stage */}
    <svg aria-hidden viewBox="0 0 1440 900" className="absolute top-0 left-0 hidden w-1440 overflow-visible lg:block scrub:arrive">
      {PIPE_STAGES.map((line) => (
        <g key={line}>
          <path d={`M 116 ${stationY(line)} H 216`} className="stroke-paper-line stroke-2" />
          <Station x={104} y={stationY(line)} size={20} className="fill-paper stroke-on-paper" />
        </g>
      ))}
    </svg>

    {/* the rail, when nothing is scrubbing it */}
    <Rail
      path={RAIL.story}
      height={SCENE_HEIGHT.story}
      base="paper"
      paint="ok"
      token={{ x: 104, y: stationY(5), size: 30 }}
      display="static"
    />

    {/* heading */}
    <div className="flex flex-col gap-10 lg:absolute lg:top-132 lg:left-160 lg:w-1200 scrub:arrive">
      <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={[copy.headline]} className="text-display-5" />
    </div>

    {/* the code, wrapped for small screens */}
    <CodeBlock lines={narrowLines} tone="paper" className="text-code-2 leading-[1.85] lg:hidden" />

    {/* the code on the stage, one line at a time */}
    <pre className="absolute top-296 left-160 hidden font-machine text-code-2 leading-[1.926] whitespace-pre lg:block">
      <code>
        {lines.map((line, order) => (
          <span key={order} style={orderStyle(order)} className="block scrub:story-line">
            <CodeTokens line={line} tone="paper" />
          </span>
        ))}
      </code>
    </pre>

    {/* what changed */}
    <div className="flex flex-col gap-16 lg:absolute lg:top-302 lg:left-1010 lg:w-366 lg:gap-30 scrub:arrive">
      {copy.claims.map((claim) => (
        <div key={claim.label} className="flex flex-col gap-4 lg:gap-8">
          <p className="label font-semibold text-ok">{claim.label}</p>
          <p className="font-human text-body text-on-paper-2">{claim.text}</p>
        </div>
      ))}
    </div>

    {/* the point */}
    <p className="hidden font-human text-aside text-on-paper italic lg:absolute lg:top-748 lg:left-160 lg:block scrub:arrive">
      {copy.caption}
    </p>
  </Scene>
)
