import type { ReactNode } from 'react'
import { LinkArrow } from '@/components/primitives/link-arrow'
import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { marketContent } from '@/content/home.content'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

/** An empty terminal line: one line of text and the gap after it. */
const BLANK_LINE_ABOVE = 'mt-[calc(1lh_+_3*var(--spacing))]'

type TerminalProps = { readonly terminal: typeof marketContent.terminal }

/** One search as an agent makes it, answered by the live server. */
const SearchTerminal = ({ terminal }: TerminalProps) => (
  <div className="flex flex-col gap-3 bg-ink p-20 font-machine text-[0.8125rem] leading-[1.5] whitespace-pre-wrap text-on-ink-2 lg:absolute lg:top-354 lg:left-160 lg:w-1216 lg:px-30 lg:py-26 lg:text-code-6">
    {/* the call */}
    <p>
      <span className="text-on-ink-3">{terminal.caller}</span>
      {'  '}
      <span className="font-medium text-on-ink">{terminal.tool}</span>
      {`  ${terminal.jobLabel} `}
      <span className="text-ok-on-ink">{terminal.job}</span>
    </p>

    {/* the answer, two lines per result */}
    <ol className={cx(BLANK_LINE_ABOVE, 'flex flex-col gap-3')}>
      {terminal.results.map((result) => (
        <li key={result.name} className="flex flex-col gap-3">
          <p>
            <span className="text-on-ink-3">{`${result.rank} `}</span>
            <span className="font-medium text-on-ink">{result.name}</span>
            <span className="text-on-ink-3 max-lg:block lg:ml-[2ch]">{result.score}</span>
          </p>
          <p className="pl-[3ch]">{result.summary}</p>
        </li>
      ))}
    </ol>

    {/* what the search left out */}
    <p className={cx(BLANK_LINE_ABOVE, 'pl-[3ch] text-warn')}>{terminal.guard}</p>
  </div>
)

type MarketSceneProps = {
  readonly copy: typeof marketContent
  readonly connect: ReactNode
}

/** The functions agents find by meaning, and the one command that connects an agent to them. */
export const MarketScene = ({ copy, connect }: MarketSceneProps) => (
  <Scene block="market" tone="paper-2" height={SCENE_HEIGHT.market}>
    {/* the rail */}
    <Rail path={RAIL.market} height={SCENE_HEIGHT.market} base="paper" paint="ok" token={{ x: 104, y: 491, size: 30 }} />

    {/* heading */}
    <div className="flex flex-col gap-6 lg:absolute lg:top-92 lg:left-160">
      <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={copy.headline} className="text-display-4" />
    </div>
    <p className="font-human text-[1.4375rem] leading-[1.36] text-on-paper-2 lg:absolute lg:top-128 lg:left-850 lg:w-526">{copy.body}</p>

    {/* an agent searches */}
    <SearchTerminal terminal={copy.terminal} />

    {/* connect */}
    <div className="flex flex-col gap-13 lg:absolute lg:top-703 lg:left-160">
      <Eyebrow className="text-on-paper-3">{copy.connectLabel}</Eyebrow>
      <div className="flex flex-col gap-20 lg:flex-row lg:items-center lg:gap-32">
        {connect}
        <LinkArrow href={copy.browse.href} label={copy.browse.label} direction="right" />
      </div>
    </div>

    {/* the rule */}
    <p className="font-human text-[1.5rem] leading-[1.2] italic lg:absolute lg:top-848 lg:left-160 lg:w-1100 lg:text-[2rem]">{copy.rule}</p>
  </Scene>
)
