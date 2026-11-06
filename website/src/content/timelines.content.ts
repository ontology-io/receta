// The timelines in the debounce and throttle guide. `calls` is marble notation, one
// character per tick: `-` is silence, a letter is a call with that argument, and `.` is a
// call too small to label. Delays are in ticks, and timing.test.ts replays every lane
// through the real functions.
import type { Timing } from '@/lib/docs/timing'

export type TimelineLane = Timing & {
  readonly label: string
  /** A few words under the label, such as the delay in milliseconds. */
  readonly note?: string
}

export type TimelineSpec = {
  readonly callsLabel: string
  readonly calls: string
  readonly lanes: readonly TimelineLane[]
}

const BURSTS = 'a-b-c-d--------------e-f-g--------------h-i-j-k--------'
const STEADY = 'a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p--'
const TYPING = 'h-e-l-l-o-_-w-o-r-l-d--------'
const STREAM = '..............................--------'

export const timelines = {
  debounce: {
    callsLabel: 'Calls',
    calls: 'a---b-c-d-----e-f-g-h---------i------',
    lanes: [{ label: 'debounce', note: '500ms', fn: 'debounce', delay: 5 }],
  },
  'debounce-edges': {
    callsLabel: 'Calls',
    calls: BURSTS,
    lanes: [
      { label: 'Trailing', note: 'the default', fn: 'debounce', delay: 7 },
      { label: 'Leading', note: 'trailing: false', fn: 'debounce', delay: 7, leading: true, trailing: false },
      { label: 'Both', note: 'leading: true', fn: 'debounce', delay: 7, leading: true },
    ],
  },
  throttle: {
    callsLabel: 'Calls',
    calls: STEADY,
    lanes: [{ label: 'throttle', note: '200ms', fn: 'throttle', delay: 8 }],
  },
  'throttle-edges': {
    callsLabel: 'Calls',
    calls: STEADY,
    lanes: [
      { label: 'Leading', note: 'trailing: false', fn: 'throttle', delay: 8, trailing: false },
      { label: 'Trailing', note: 'leading: false', fn: 'throttle', delay: 8, leading: false },
      { label: 'Both', note: 'the default', fn: 'throttle', delay: 8 },
    ],
  },
  typing: {
    callsLabel: 'Typing',
    calls: TYPING,
    lanes: [
      { label: 'debounce', note: '300ms', fn: 'debounce', delay: 6 },
      { label: 'throttle', note: '300ms', fn: 'throttle', delay: 6 },
    ],
  },
  stream: {
    callsLabel: 'Events',
    calls: STREAM,
    lanes: [
      { label: 'debounce', note: '“Let me finish first”', fn: 'debounce', delay: 6 },
      { label: 'throttle', note: '“Regular updates please”', fn: 'throttle', delay: 6 },
    ],
  },
} as const satisfies Record<string, TimelineSpec>

export type TimelineName = keyof typeof timelines
