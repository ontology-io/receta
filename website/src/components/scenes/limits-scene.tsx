import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { limitsContent } from '@/content/home.content'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const ROW_Y = [340, 478, 616] as const

type LimitsSceneProps = { readonly copy: typeof limitsContent }

/** The crime scene's hidden red exits again, this time declared. */
export const LimitsScene = ({ copy }: LimitsSceneProps) => (
  <Scene block="limits" tone="paper" height={SCENE_HEIGHT.limits}>
    {/* the rail, with each limit as a declared exit */}
    <Rail path={RAIL.limits} height={SCENE_HEIGHT.limits} base="paper" paint="ok" token={{ x: 104, y: 250, size: 30 }}>
      {ROW_Y.map((y) => (
        <g key={y}>
          <path
            d={`M 104 ${y - 30} Q 104 ${y} 134 ${y} H 196`}
            pathLength={1}
            className="fill-none stroke-err stroke-3 draw-path"
          />
          <circle cx={204} cy={y} r={9} className="fill-err [opacity:var(--reveal,1)]" />
        </g>
      ))}
    </Rail>

    {/* heading */}
    <div className="flex flex-col gap-8 lg:absolute lg:top-92 lg:left-160">
      <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={copy.headline} className="text-display-5" />
    </div>

    {/* the declared errors */}
    <ul className="flex flex-col gap-24 lg:absolute lg:top-318 lg:left-236 lg:w-1140 lg:gap-70">
      {copy.errors.map((error) => (
        <li key={error.code} className="flex flex-col gap-6 lg:reveal-in">
          <p className="font-machine text-[0.8125rem] font-medium text-err-text lg:text-code-5">{error.code}</p>
          <p className="font-human text-[1.3125rem] leading-[1.24] lg:text-[1.8125rem]">{error.text}</p>
        </li>
      ))}
    </ul>
  </Scene>
)
