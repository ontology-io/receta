import { afterEach, describe, expect, it } from 'bun:test'
import { debounce, throttle } from '@ontologyio/receta/async'
import * as R from 'remeda'
import { timelines } from '@/content/timelines.content'
import { parseCalls, runsOf, type Call, type Timing } from './timing'

const START_TIME = 1_000_000

type Timer = { readonly id: number; readonly at: number; readonly fire: () => void }

const real = { now: Date.now, setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout }

/** A clock that only moves when told to, so a replay takes no real time. */
const fakeClock = () => {
  let now = START_TIME
  let nextId = 1
  let timers: readonly Timer[] = []

  Date.now = () => now
  Object.assign(globalThis, {
    setTimeout: (fire: () => void, delay = 0) => {
      const id = nextId++
      timers = [...timers, { id, at: now + delay, fire }]
      return id
    },
    clearTimeout: (id: number) => {
      timers = R.filter(timers, (timer) => timer.id !== id)
    },
  })

  const flush = () => new Promise((resolve) => setImmediate(resolve))

  /** Fires what's due by `until`, in order, then stops the clock there. */
  const advanceTo = async (until: number): Promise<void> => {
    for (;;) {
      const next = R.pipe(
        timers,
        R.filter((timer) => timer.at <= until),
        R.sortBy((timer) => timer.at),
        R.first(),
      )
      if (!next) break
      timers = R.filter(timers, (timer) => timer.id !== next.id)
      now = next.at
      next.fire()
      await flush()
    }
    now = until
  }

  return { advanceTo, flush, now: () => now }
}

/** Runs the calls through the published function and notes when `fn` really ran. */
const replay = async (calls: readonly Call[], { fn, ...options }: Timing) => {
  const clock = fakeClock()
  const ran: Call[] = []
  const target = async (label: string) => {
    ran.push({ at: clock.now() - START_TIME, label })
  }
  const timed = fn === 'debounce' ? debounce(target, options) : throttle(target, options)

  for (const { at, label } of calls) {
    await clock.advanceTo(START_TIME + at)
    void timed(label).catch(() => undefined)
    await clock.flush()
  }
  await clock.advanceTo(START_TIME + 1000)
  return ran
}

const withoutEdge = (runs: ReturnType<typeof runsOf>) => R.map(runs, ({ at, label }) => ({ at, label }))

describe('parseCalls', () => {
  it('reads one tick per character', () => {
    expect(parseCalls('a--b')).toEqual([
      { at: 0, label: 'a' },
      { at: 3, label: 'b' },
    ])
  })
})

describe('runsOf', () => {
  it('runs a trailing debounce once the calls stop', () => {
    expect(runsOf(parseCalls('a-b'), { fn: 'debounce', delay: 3 })).toEqual([{ at: 5, edge: 'trailing', label: 'b' }])
  })

  it('runs a throttle at most once per delay', () => {
    const runs = runsOf(parseCalls(timelines.throttle.calls), { fn: 'throttle', delay: 8 })
    expect(R.map(runs, ({ at }) => at)).toEqual([0, 8, 16, 24, 32])
  })
})

describe('every timeline in the docs', () => {
  afterEach(() => {
    Date.now = real.now
    Object.assign(globalThis, { setTimeout: real.setTimeout, clearTimeout: real.clearTimeout })
  })

  const lanes = R.flatMap(R.entries(timelines), ([name, { calls, lanes }]) =>
    R.map(lanes, (lane) => ({ name, calls, lane })),
  )

  for (const { name, calls, lane } of lanes) {
    it(`${name}: ${lane.label} matches the real ${lane.fn}`, async () => {
      const parsed = parseCalls(calls)
      expect(withoutEdge(runsOf(parsed, lane))).toEqual(await replay(parsed, lane))
    })
  }
})
