import { Rail } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { agentsContent } from '@/content/home.content'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const CELL_FILLS = [
  'bg-err',
  'bg-ok-on-ink',
  'bg-warn',
  'bg-on-ink-2',
  'bg-ink-line',
  'bg-code-type-ink',
  'bg-on-ink',
] as const

const GRID_ROWS = [0, 1, 2] as const
const GRID_COLUMNS = [0, 1, 2, 3, 4, 5] as const

/** A fixed scatter, so "no menu" looks the same on every render. */
const mixedFill = (row: number, column: number): string =>
  CELL_FILLS[(row * 5 + column * 3 + row * column) % CELL_FILLS.length] ?? ''

type PatternGridProps = {
  readonly label: string
  readonly caption: string
  /** The grid sorts itself into one colour as the scene arrives. */
  readonly isSorted: boolean
  readonly className: string
}

/** What a codebase's patterns look like, one cell per file. */
const PatternGrid = ({ label, caption, isSorted, className }: PatternGridProps) => (
  <div className={cx('flex flex-col gap-12', className)}>
    <Eyebrow className="text-on-ink-3">{label}</Eyebrow>
    <div aria-hidden className="flex flex-col gap-6">
      {GRID_ROWS.map((row) => (
        <div key={row} className="flex flex-row gap-6">
          {GRID_COLUMNS.map((column) => (
            <div key={column} className={cx('relative h-26 flex-1 lg:w-51 lg:flex-none', mixedFill(row, column))}>
              {isSorted && <div className="absolute inset-0 bg-ok-on-ink [opacity:var(--reveal,1)]" />}
            </div>
          ))}
        </div>
      ))}
    </div>
    <p className="font-human text-note text-on-ink-2">{caption}</p>
  </div>
)

type TerminalProps = { readonly terminal: typeof agentsContent.terminal }

/** Real lint output. The fixable count is left out: it differs between plugin releases. */
const LintTerminal = ({ terminal }: TerminalProps) => (
  <div className="flex flex-col gap-3 overflow-x-auto bg-ink-2 p-20 font-machine text-[0.8125rem] leading-[1.5] lg:absolute lg:top-356 lg:left-160 lg:w-1216 lg:px-30 lg:py-26 lg:text-code-6">
    <p className="font-medium text-on-ink">{terminal.command}</p>
    <p className="mt-[1lh] text-on-ink">{terminal.file}</p>

    {/* one row per warning */}
    <ul className="flex flex-col gap-10 lg:grid lg:grid-cols-[auto_auto_1fr_auto] lg:gap-x-18 lg:gap-y-3 lg:pl-18">
      {terminal.warnings.map((warning) => (
        <li key={warning.rule} className="flex flex-col lg:col-span-4 lg:grid lg:grid-cols-subgrid">
          <span className="text-right text-on-ink-3 max-lg:hidden">{warning.position}</span>
          <span className="text-warn max-lg:hidden">{terminal.warningLabel}</span>
          <span className="text-on-ink">{warning.message}</span>
          <span className="text-on-ink-3">{warning.rule}</span>
        </li>
      ))}
    </ul>

    <p className="mt-[1lh] text-warn">{terminal.summary}</p>
  </div>
)

type AgentsSceneProps = { readonly copy: typeof agentsContent }

/** Style is a prompt now. Lint holds the line, and a person still has to explain the change. */
export const AgentsScene = ({ copy }: AgentsSceneProps) => (
  <Scene block="agents" tone="ink" height={SCENE_HEIGHT.agents}>
    {/* the rail */}
    <Rail path={RAIL.agents} height={SCENE_HEIGHT.agents} base="ink" paint="ok-on-ink" token={{ x: 104, y: 520, size: 30 }} />

    {/* heading */}
    <div className="flex flex-col gap-8 lg:absolute lg:top-92 lg:left-160">
      <Eyebrow className="text-on-ink-3">{copy.eyebrow}</Eyebrow>
      <Headline lines={copy.headline} className="text-display-4 text-on-ink" />
    </div>
    <p className="font-human text-[1.4375rem] leading-[1.36] text-on-ink-2 lg:absolute lg:top-128 lg:left-850 lg:w-526">{copy.body}</p>

    {/* what the machine says */}
    <LintTerminal terminal={copy.terminal} />

    {/* the same codebase with and without a menu */}
    <PatternGrid label={copy.noMenu.label} caption={copy.noMenu.caption} isSorted={false} className="lg:absolute lg:top-668 lg:left-160 lg:w-336" />
    <PatternGrid label={copy.withMenu.label} caption={copy.withMenu.caption} isSorted className="lg:absolute lg:top-668 lg:left-540 lg:w-336" />

    {/* the skills */}
    <div className="flex flex-col gap-9 lg:absolute lg:top-668 lg:left-930 lg:w-446">
      <Eyebrow className="text-on-ink-3">{copy.skillsLabel}</Eyebrow>
      <ul className="flex flex-col gap-9">
        {copy.skills.map((skill) => (
          <li key={skill.name} className="flex flex-row items-center justify-between gap-16">
            <span className="font-machine text-[0.875rem] font-medium text-on-ink lg:text-[1rem]">{skill.name}</span>
            <span className="font-human text-note text-on-ink-2 italic">{skill.does}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* the rule */}
    <p className="font-human text-[1.5rem] leading-[1.2] text-on-ink italic lg:absolute lg:top-924 lg:left-160 lg:w-1100 lg:text-[2rem]">{copy.rule}</p>
  </Scene>
)
