import type { ReactNode } from 'react'
import { LinkArrow } from '@/components/primitives/link-arrow'
import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Wordmark } from '@/components/primitives/wordmark'
import type { okContent } from '@/content/home.content'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

type OkSceneProps = {
  readonly copy: typeof okContent
  readonly install: ReactNode
}

/** The pipe returns. The value lands as the last full stop, and the page ends on green. */
export const OkScene = ({ copy, install }: OkSceneProps) => (
  <Scene tone="ok" height={SCENE_HEIGHT.ok}>
    {/* the last stretch of rail */}
    <Rail path={RAIL.ok} height={SCENE_HEIGHT.ok} base="ok" paint="paper" token={{ x: 1315, y: 327, size: 24 }}>
      <text x={1147} y={162} className="fill-ok-mist font-machine text-[18px] font-medium">
        {copy.result}
      </text>
    </Rail>

    {/* the last sentence */}
    <h2 className="font-human text-display-1 lg:absolute lg:top-236 lg:left-64 lg:whitespace-nowrap">
      {copy.headline}
      <span className="sr-only">{copy.fullStop}</span>
      <span aria-hidden className="ml-4 inline-block size-14 rounded-full bg-paper lg:hidden" />
    </h2>

    {/* the return value on small screens */}
    <p className="font-machine text-[0.9375rem] font-medium text-ok-mist lg:hidden">{copy.result}</p>

    {/* the invitation */}
    <p className="font-human text-[1.4375rem] leading-[1.3] text-paper/90 lg:absolute lg:top-424 lg:left-64 lg:text-[1.875rem]">{copy.lede}</p>

    {/* actions */}
    <div className="flex flex-col gap-24 lg:absolute lg:top-510 lg:left-64 lg:flex-row lg:items-center lg:gap-36">
      {install}
      <ul className="flex flex-row justify-between lg:gap-36">
        {copy.links.map((link) => (
          <li key={link.label}>
            <LinkArrow href={link.href} label={link.label} direction="out" />
          </li>
        ))}
      </ul>
    </div>

    {/* footer */}
    <footer className="flex flex-col gap-10 border-t border-paper/25 pt-20 lg:absolute lg:top-792 lg:left-64 lg:w-1312 lg:flex-row lg:items-center lg:justify-between lg:pt-24">
      <Wordmark text={copy.wordmark} stopClassName="bg-paper" />
      <p className="font-machine text-[0.8125rem] text-ok-mist lg:text-[0.875rem]">{copy.package}</p>
      <p className="font-human text-[1.3125rem] italic lg:text-[1.375rem]">{copy.signOff}</p>
    </footer>
  </Scene>
)
