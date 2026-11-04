// The rail through every scene, in scene coordinates. Each scene's exit x is the
// next scene's entry x, which is what makes the page read as one continuous line.
// Pinned scenes are 900 tall so they fit the stage, so a few differ from the Pen frames.

import * as R from 'remeda'

/** Scene heights in design pixels. */
export const SCENE_HEIGHT = {
  hero: 900,
  queue: 960,
  crime: 900,
  story: 900,
  railway: 900,
  option: 1040,
  validation: 800,
  pipe: 900,
  menu: 1200,
  zoom: 900,
  agents: 1040,
  limits: 800,
  ok: 900,
} as const

export const RAIL = {
  hero: 'M 710 485 V 900',
  queue: 'M 710 0 V 960',
  crime:
    'M 710 0 V 52 Q 710 92 750 92 H 1010 Q 1050 92 1050 132 C 1050 237 1345 179 1335 286 C 1325 383 925 268 945 383 C 960 480 1305 407 1295 505 C 1285 594 1005 480 995 578 C 985 675 1180 626 1180 723 V 900',
  story: 'M 1180 0 V 56 Q 1180 96 1140 96 H 144 Q 104 96 104 136 V 900',
  railway: 'M 104 0 V 370 Q 104 430 164 430 H 1290 Q 1340 430 1340 480 V 900',
  railwayErr: 'M 560 430 V 550 Q 560 610 620 610 H 950',
  option: 'M 1340 0 V 800 Q 1340 880 1260 880 H 340 Q 300 880 300 920 V 1040',
  optionNone: 'M 1340 110 H 1000 Q 960 110 960 150 V 860 Q 960 880 940 880',
  validation: 'M 300 0 V 800',
  pipe: 'M 300 0 V 30 Q 300 70 340 70 H 680 Q 720 70 720 110 V 900',
  menu: 'M 720 0 V 40 Q 720 80 680 80 H 144 Q 104 80 104 120 V 1200',
  zoom: 'M 104 0 V 900',
  agents: 'M 104 0 V 1040',
  limits: 'M 104 0 V 800',
  ok: 'M 104 0 V 40 Q 104 80 144 80 H 1275 Q 1315 80 1315 120 V 327',
} as const

type Point = readonly [x: number, y: number]

/** One cubic segment: two control points and an end point. */
export type CubicSegment = readonly [Point, Point, Point]

export type CubicPath = {
  readonly start: Point
  readonly segments: readonly CubicSegment[]
}

const straight = (from: Point, to: Point): CubicSegment => [from, to, to]

/**
 * The tangled rail of the crime scene and the straight rail it pulls into. Both have
 * the same ten segments, so one can be interpolated into the other.
 */
export const TANGLED_RAIL: CubicPath = {
  start: [710, 0],
  segments: [
    straight([710, 0], [710, 52]),
    [[710, 74], [728, 92], [750, 92]],
    straight([750, 92], [1010, 92]),
    [[1032, 92], [1050, 110], [1050, 132]],
    [[1050, 237], [1345, 179], [1335, 286]],
    [[1325, 383], [925, 268], [945, 383]],
    [[960, 480], [1305, 407], [1295, 505]],
    [[1285, 594], [1005, 480], [995, 578]],
    [[985, 675], [1180, 626], [1180, 723]],
    straight([1180, 723], [1180, 900]),
  ],
}

export const STRAIGHT_RAIL: CubicPath = {
  start: [710, 0],
  segments: [
    straight([710, 0], [710, 56]),
    [[710, 78], [692, 96], [670, 96]],
    straight([670, 96], [144, 96]),
    [[122, 96], [104, 114], [104, 136]],
    straight([104, 136], [104, 288]),
    straight([104, 288], [104, 440]),
    straight([104, 440], [104, 592]),
    straight([104, 592], [104, 700]),
    straight([104, 700], [104, 800]),
    straight([104, 800], [104, 900]),
  ],
}

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount

const lerpPoint = (from: Point, to: Point, amount: number): Point => [
  lerp(from[0], to[0], amount),
  lerp(from[1], to[1], amount),
]

const pointText = ([x, y]: Point): string => `${x.toFixed(1)} ${y.toFixed(1)}`

const morphSegment = (from: CubicSegment, to: CubicSegment, amount: number): string => {
  const [firstControl, secondControl, end] = R.map(R.zip(from, to), ([start, target]) =>
    pointText(lerpPoint(start, target, amount)),
  )
  return `C ${firstControl} ${secondControl} ${end}`
}

/** Interpolates between two paths of the same shape and returns an SVG path string. */
export const morphRail = (from: CubicPath, to: CubicPath, amount: number): string => {
  const curves = R.pipe(
    R.zip(from.segments, to.segments),
    R.map(([segment, target]) => morphSegment(segment, target, amount)),
    R.join(' '),
  )
  return `M ${pointText(lerpPoint(from.start, to.start, amount))} ${curves}`
}
