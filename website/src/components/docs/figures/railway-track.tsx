import * as R from 'remeda'
import { cx } from '@/lib/cx'
import { Block, Figure, type FigureWordsProps } from './figure'

const STATIONS = ['20%', '45%', '70%'] as const

// The rows are equal, so each rail sits a quarter of the way in, less a quarter of the row gap.
const RAIL_INSET = 'calc(25% - 0.5rem)'

const TRACK_NAME = 'absolute left-[72%] hidden text-sm whitespace-nowrap @lg:block'

/** Every station on the success track has a switch down to the error track. */
export const RailwayTrack = ({ children }: FigureWordsProps) => (
  <Figure caption={children}>
    <div className="grid auto-rows-fr grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-y-8 @lg:grid-cols-[auto_minmax(0,1fr)_11rem]">
      <Block className="col-start-1 row-start-1 justify-self-start">Input</Block>

      {/* the tracks */}
      <div aria-hidden className="relative col-start-2 row-span-2 row-start-1 self-stretch">
        {R.map(STATIONS, (left) => (
          <span
            key={left}
            className="absolute right-0 rounded-bl-2xl border-b-2 border-l-2 border-err"
            style={{ left, top: RAIL_INSET, bottom: RAIL_INSET }}
          />
        ))}
        <span className="absolute inset-x-0 h-0.5 -translate-y-px bg-ok" style={{ top: RAIL_INSET }} />
        {R.map(STATIONS, (left) => (
          <span
            key={left}
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ok bg-fd-card"
            style={{ left, top: RAIL_INSET }}
          />
        ))}

        {/* the names the text around the figure uses */}
        <span className={cx(TRACK_NAME, '-translate-y-full pb-1 text-ok')} style={{ top: RAIL_INSET }}>
          success track
        </span>
        <span className={cx(TRACK_NAME, 'pt-1 text-err')} style={{ bottom: `calc(${RAIL_INSET} - 1.75rem)` }}>
          error track
        </span>
      </div>

      <Block tone="ok" className="col-start-3 row-start-1">
        Ok
        <span className="block font-sans text-[0.9375rem]">Continue pipeline</span>
      </Block>
      <Block tone="err" className="col-start-3 row-start-2">
        Err
        <span className="block font-sans text-[0.9375rem]">Short-circuit to error handler</span>
      </Block>
    </div>
  </Figure>
)
