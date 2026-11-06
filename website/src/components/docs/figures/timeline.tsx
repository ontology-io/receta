import type { ReactNode } from 'react'
import * as R from 'remeda'
import { timelines, type TimelineLane, type TimelineName } from '@/content/timelines.content'
import { cx } from '@/lib/cx'
import { parseCalls, runsOf, type Call, type Run } from '@/lib/docs/timing'
import { Figure } from './figure'

const UNLABELLED = '.'
const SPACE = '_'

const shownLabel = (label: string): string => (label === SPACE ? '␣' : label)

/** Where a tick sits along a track, as a CSS length. */
const position = (tick: number, ticks: number): string => `${(tick / (ticks - 1)) * 100}%`

type LaneProps = {
  readonly label: string
  readonly note?: string | undefined
  readonly summary: string
  readonly children: ReactNode
}

/** One row of the timeline: its name on the left, or above it when the column is narrow. */
const Lane = ({ label, note, summary, children }: LaneProps) => (
  <div className="grid gap-x-4 gap-y-1 @lg:grid-cols-[10rem_minmax(0,1fr)] @lg:items-center">
    <p className="flex flex-wrap items-baseline gap-x-2 leading-tight @lg:flex-col">
      <span className="font-mono text-sm">{label}</span>
      {note ? <span className="text-sm text-fd-muted-foreground">{note}</span> : null}
    </p>
    <div role="img" aria-label={summary} className="relative mx-2.5 h-7">
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-fd-border" />
      {children}
    </div>
  </div>
)

type CallMarkProps = { readonly call: Call; readonly ticks: number }

const CallMark = ({ call, ticks }: CallMarkProps) => (
  <span
    className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
    style={{ left: position(call.at, ticks) }}
  >
    {call.label === UNLABELLED ? (
      <span className="h-3 w-px bg-fd-muted-foreground" />
    ) : (
      <span className="grid size-3 place-items-center bg-fd-card font-mono text-[0.6875rem] leading-none text-fd-muted-foreground">
        {shownLabel(call.label)}
      </span>
    )}
  </span>
)

type RunMarkProps = { readonly run: Run; readonly ticks: number }

const RunMark = ({ run, ticks }: RunMarkProps) => (
  <span
    className={cx(
      'absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ok font-mono text-[0.6875rem] leading-none font-medium text-fd-card',
      run.label === UNLABELLED ? 'size-3' : 'size-5',
    )}
    style={{ left: position(run.at, ticks) }}
  >
    {run.label === UNLABELLED ? null : shownLabel(run.label)}
  </span>
)

type DelayBarProps = { readonly from: number; readonly to: number; readonly ticks: number }

const DelayBar = ({ from, to, ticks }: DelayBarProps) => (
  <span
    className="absolute top-1/2 h-2.5 -translate-y-1/2 bg-ok-soft"
    style={{ left: position(from, ticks), width: position(to - from, ticks) }}
  />
)

/** The delay behind a run: a trailing debounce waited it out, anything else starts one. */
const delayOf = (run: Run, { fn, delay }: TimelineLane, ticks: number) =>
  fn === 'debounce' && run.edge === 'trailing'
    ? { from: run.at - delay, to: run.at }
    : { from: run.at, to: Math.min(run.at + delay, ticks - 1) }

const runsSummary = (label: string, runs: readonly Run[]): string =>
  `${label} runs ${runs.length} ${runs.length === 1 ? 'time' : 'times'}`

const Legend = () => (
  <p aria-hidden className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fd-muted-foreground">
    <span className="mr-auto font-mono text-xs">time →</span>
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full bg-ok" />
      run
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-5 bg-ok-soft" />
      delay
    </span>
  </p>
)

type TimelineProps = {
  readonly name: TimelineName
  readonly children?: ReactNode
}

/** Calls and the runs they cause, worked out from src/content/timelines.content.ts. */
export const Timeline = ({ name, children }: TimelineProps) => {
  const { callsLabel, calls: marbles, lanes } = timelines[name]
  const calls = parseCalls(marbles)
  const ticks = marbles.length

  return (
    <Figure caption={children}>
      <div className="flex flex-col gap-2">
        {/* the calls everything else reacts to */}
        <Lane label={callsLabel} summary={`${calls.length} calls`}>
          {R.map(calls, (call) => (
            <CallMark key={call.at} call={call} ticks={ticks} />
          ))}
        </Lane>

        {/* one lane per way of timing them */}
        {R.map(lanes, (lane: TimelineLane) => {
          const runs = runsOf(calls, lane)
          return (
            <Lane key={lane.label} label={lane.label} note={lane.note} summary={runsSummary(lane.label, runs)}>
              {R.map(runs, (run) => (
                <DelayBar key={run.at} ticks={ticks} {...delayOf(run, lane, ticks)} />
              ))}
              {R.map(runs, (run) => (
                <RunMark key={run.at} run={run} ticks={ticks} />
              ))}
            </Lane>
          )
        })}
      </div>
      <Legend />
    </Figure>
  )
}
