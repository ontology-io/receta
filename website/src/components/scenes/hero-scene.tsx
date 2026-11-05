import type { CSSProperties, ReactNode } from 'react'
import { CodeBlock } from '@/components/primitives/code-block'
import { LinkArrow } from '@/components/primitives/link-arrow'
import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, spacedLines } from '@/components/primitives/text'
import type { heroContent } from '@/content/home.content'
import type { CodeLine } from '@/lib/code/tokenize'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'
import { stagePosition, stageSize } from '@/lib/stage'

type HeroSceneProps = {
  readonly copy: typeof heroContent
  readonly pipe: readonly CodeLine[]
  readonly install: ReactNode
}

type Ghost = (typeof heroContent)['ghosts'][number]

const ghostStyle = ({ x, y, size, rotate }: Ghost): CSSProperties => ({
  ...stagePosition(x, y),
  fontSize: stageSize(size),
  rotate: `${rotate}deg`,
})

/** The promise. Its full stop is the value that rides the rail down the page. */
export const HeroScene = ({ copy, pipe, install }: HeroSceneProps) => (
  <Scene id="top" block="hero" tone="ink" height={SCENE_HEIGHT.hero} isAnchoredAtTop hasMobileRail={false}>
    {/* far plane: the mess this page replaces */}
    <div aria-hidden className="absolute inset-0 hidden lg:block lg:parallax-30">
      {copy.ghosts.map((ghost) => (
        <span
          key={`${ghost.text}-${ghost.x}`}
          style={ghostStyle(ghost)}
          className="absolute font-machine whitespace-nowrap text-ink-3"
        >
          {ghost.text}
        </span>
      ))}
    </div>

    {/* middle plane: the shape of Option */}
    <div aria-hidden className="absolute inset-0 hidden lg:block lg:parallax-60">
      <div className="absolute top-430 left-960 size-760 rounded-full border-30 border-ink-2" />
      <div className="absolute top-812 left-1016 size-64 rounded-full bg-ink-3" />
    </div>

    {/* the rail, starting at the full stop */}
    <Rail path={RAIL.hero} height={SCENE_HEIGHT.hero} base="ink" paint="err" token={{ x: 710, y: 485, size: 24 }} />

    {/* the pitch */}
    <div className="relative flex flex-col pt-32 lg:absolute lg:top-124 lg:left-64 lg:w-900 lg:pt-0">
      <Eyebrow className="text-on-ink-2">{copy.eyebrow}</Eyebrow>

      <h1 className="mt-16 font-human text-display-2 lg:mt-10">
        {spacedLines(copy.headline).map((line) => (
          <span key={line} className="lg:block">
            {line}
          </span>
        ))}
        <span className="sr-only">{copy.fullStop}</span>
        <span aria-hidden className="ml-[-0.12em] inline-block size-14 rounded-full bg-err lg:hidden" />
      </h1>

      <p className="mt-28 max-w-640 font-human text-lede text-on-ink-2 lg:mt-30">{copy.lede}</p>

      {/* actions */}
      <div className="mt-36 flex flex-col gap-20 lg:mt-56 lg:flex-row lg:items-center lg:gap-32">
        {install}
        <LinkArrow href={copy.whyHref} label={copy.whyLabel} direction="down" className="text-on-ink" />
      </div>
    </div>

    {/* scroll cue */}
    <Eyebrow className="hidden text-on-ink-3 lg:absolute lg:top-826 lg:left-64 lg:block">{copy.scrollCue}</Eyebrow>

    {/* the page, as a pipe */}
    <div className="hidden lg:absolute lg:top-124 lg:left-1070 lg:flex lg:flex-col lg:gap-14">
      <Eyebrow className="text-on-ink-3">{copy.pipeLabel}</Eyebrow>
      <CodeBlock lines={pipe} tone="ink" className="text-[1.125rem] leading-[1.78]" />
      <p className="mt-10 font-machine text-[0.875rem] text-on-ink-3">{copy.facts}</p>
    </div>
  </Scene>
)
