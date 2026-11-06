// Works out when a debounced or throttled function runs, so the timelines in the docs show
// what the library does rather than what someone remembered. timing.test.ts replays every
// timeline through the real functions. Start at runsOf.
import * as R from 'remeda'
import { isSome, none, some, type Option } from '@ontologyio/receta/option'

/** One call: when it happened, and the argument it passed. */
export type Call = { readonly at: number; readonly label: string }

export type Edge = 'leading' | 'trailing'

/** One run: when it happened, what started it, and the argument it used. */
export type Run = Call & { readonly edge: Edge }

export type Timing = {
  readonly fn: 'debounce' | 'throttle'
  readonly delay: number
  readonly leading?: boolean
  readonly trailing?: boolean
}

type Clock = {
  readonly runs: readonly Run[]
  readonly lastRun: number
  readonly lastCall: number
  readonly latest: string
  /** When the waiting trailing run goes off. */
  readonly timer: Option<number>
}

const START: Clock = { runs: [], lastRun: -Infinity, lastCall: -Infinity, latest: '', timer: none() }

const run = (clock: Clock, at: number, edge: Edge): Clock => ({
  ...clock,
  runs: [...clock.runs, { at, edge, label: clock.latest }],
  lastRun: at,
  timer: none(),
})

/** A timer due at the same moment as a call goes first. */
const settle = (clock: Clock, now: number): Clock =>
  isSome(clock.timer) && clock.timer.value <= now ? run(clock, clock.timer.value, 'trailing') : clock

const debounceCall = (clock: Clock, now: number, { delay, leading = false, trailing = true }: Timing): Clock => {
  const called = { ...clock, lastCall: now }
  if (leading && now - clock.lastCall >= delay) return run(called, now, 'leading')
  return { ...called, timer: trailing ? some(now + delay) : none() }
}

const throttleCall = (clock: Clock, now: number, { delay, leading = true, trailing = true }: Timing): Clock => {
  const sinceLastRun = now - clock.lastRun
  if (leading && sinceLastRun >= delay) return run(clock, now, 'leading')
  if (!trailing || isSome(clock.timer)) return clock
  // A call after a quiet spell opens a new delay, and any other waits out the current one
  return { ...clock, timer: some(now + (sinceLastRun >= delay ? delay : delay - sinceLastRun)) }
}

/** Every run a stream of calls causes. */
export const runsOf = (calls: readonly Call[], timing: Timing): readonly Run[] => {
  const applyCall = timing.fn === 'debounce' ? debounceCall : throttleCall
  const afterCalls = R.reduce(
    calls,
    (clock, { at, label }) => applyCall({ ...settle(clock, at), latest: label }, at, timing),
    START,
  )
  return settle(afterCalls, Infinity).runs
}

/** Reads marble notation, one character per tick: `-` is silence, anything else is a call. */
export const parseCalls = (marbles: string): readonly Call[] =>
  R.pipe(
    [...marbles],
    R.map((label, at) => ({ at, label })),
    R.filter(({ label }) => label !== '-'),
  )
