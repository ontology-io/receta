// What each pinned scene looks like at a given progress. Every timeline is a pure
// function from 0..1 to the CSS variables its scene reads. The rest of the page never
// computes motion: components only read these variables, and each falls back to its
// rest value, so with no JavaScript the page shows the rest frames. Start at TIMELINES.
import { clamp, interpolate } from '@ontologyio/receta/number'
import * as R from 'remeda'

export type SceneFrame = {
  /** CSS variables written on the block. */
  readonly variables: Readonly<Record<string, number>>
  /** Attributes written on the block, for discrete state changes. */
  readonly attributes?: Readonly<Record<string, string>>
  /** How far the crime rail has pulled straight, 0..1. */
  readonly railMorph?: number
  /** How far along its track a second token is, 0..1. */
  readonly followerAt?: number
}

type Timeline = (progress: number) => SceneFrame

/** Maps progress inside one window of the timeline to 0..1. */
export const segment = (progress: number, from: number, to: number): number =>
  clamp((progress - from) / (to - from), 0, 1)

const easeInOut = (amount: number): number =>
  amount < 0.5 ? 2 * amount * amount : 1 - (-2 * amount + 2) ** 2 / 2

/** Crime scene to story: evidence stamps in, the hiding lines fall, paper rises, the story arrives. */
const storyTimeline: Timeline = (progress) => {
  const fall = easeInOut(segment(progress, 0.2, 0.52))
  const horizon = easeInOut(segment(progress, 0.26, 0.74))
  const assemble = segment(progress, 0.56, 0.94)
  return {
    variables: {
      '--stamp': segment(progress, 0, 0.14),
      '--clear': segment(progress, 0.15, 0.24),
      '--fall': fall,
      '--horizon': horizon,
      '--assemble': assemble,
    },
    attributes: { 'data-phase': storyPhase(progress) },
    railMorph: easeInOut(segment(progress, 0.2, 0.66)),
  }
}

const storyPhase = (progress: number): string => {
  if (progress < 0.2) return 'crime'
  return progress < 0.5 ? 'breaking' : 'story'
}

/** Railway: the empty order follows the valid one, then drops to the Err track at checkStock. */
const railwayTimeline: Timeline = (progress) => ({
  variables: {},
  followerAt: segment(progress, 0.08, 0.92),
})

const UNFOLD_STEPS = 5

/** pipe: each call leaves the one around it and lands on its station, innermost first. */
const pipeTimeline: Timeline = (progress) => ({
  variables: {
    ...unfoldVariables(progress),
    '--nest-fade': segment(progress, 0, 0.5),
  },
})

const unfoldVariables = (progress: number): Readonly<Record<string, number>> =>
  R.pipe(
    R.range(0, UNFOLD_STEPS),
    R.map((step): readonly [string, number] => [`--unfold-${step}`, unfoldAt(progress, step)]),
    R.fromEntries(),
  )

const unfoldAt = (progress: number, step: number): number =>
  easeInOut(segment(progress, 0.06 + step * 0.15, 0.36 + step * 0.15))

const CAMERA_VIEW = { width: 760, height: 640 } as const
const CODE_SIZE = 88
const CHARACTER_WIDTH = 0.6
const LINE_HEIGHT = 1.6

/** The code box that fills the frame at each zoom level: column, line, width and height. */
export const ZOOM_BOXES = [
  { line: 11, column: 12, width: 7, height: 1 },
  { line: 11, column: 4, width: 17, height: 1 },
  { line: 9, column: 2, width: 24, height: 5 },
  { line: 6, column: 0, width: 46, height: 8 },
  { line: 0, column: 0, width: 68, height: 14 },
] as const

type Camera = { readonly scale: number; readonly x: number; readonly y: number }

const cameraFor = ({ line, column, width, height }: (typeof ZOOM_BOXES)[number]): Camera => {
  const size = Math.min(
    (CAMERA_VIEW.width * 0.78) / (width * CHARACTER_WIDTH),
    (CAMERA_VIEW.height * 0.62) / (height * LINE_HEIGHT),
    CODE_SIZE,
  )
  return {
    scale: size / CODE_SIZE,
    x: CAMERA_VIEW.width / 2 - (column + width / 2) * size * CHARACTER_WIDTH,
    y: CAMERA_VIEW.height / 2 - (line + height / 2) * size * LINE_HEIGHT,
  }
}

const CAMERAS = R.map(ZOOM_BOXES, cameraFor)

/** Where the camera rests when nothing is scrubbing: the Flow level. */
export const REST_CAMERA = CAMERAS[2] ?? { scale: 1, x: 0, y: 0 }
export const REST_LEVEL = 2

/** Holds on each level, then moves: the soft snap on each of the five stops. */
const snapToStop = (position: number): number => {
  const stop = Math.floor(position)
  const between = position - stop
  return stop + easeInOut(segment(between, 0.3, 1))
}

/** Zoom: the camera starts on one name and pulls back to the module. */
const zoomTimeline: Timeline = (progress) => {
  const position = snapToStop(progress * (CAMERAS.length - 1))
  const level = Math.min(Math.floor(position), CAMERAS.length - 2)
  const from = CAMERAS[level] ?? REST_CAMERA
  const to = CAMERAS[level + 1] ?? REST_CAMERA
  const between = position - level
  // Scale changes multiplicatively, so a steady zoom needs the log of the scale.
  const scale = Math.exp(interpolate(Math.log(from.scale), Math.log(to.scale), between))
  const eased = (scale - from.scale) / (to.scale - from.scale)
  return {
    variables: {
      '--cam-scale': scale,
      '--cam-x': interpolate(from.x, to.x, eased),
      '--cam-y': interpolate(from.y, to.y, eased),
    },
    attributes: { 'data-level': String(Math.round(position)) },
  }
}

/** Scenes that pin, keyed by their block id. */
export const TIMELINES: Readonly<Record<string, Timeline>> = {
  story: storyTimeline,
  railway: railwayTimeline,
  pipe: pipeTimeline,
  zoom: zoomTimeline,
}
