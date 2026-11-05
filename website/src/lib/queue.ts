// The change requests pouring into the funnel. Positions come from a low-discrepancy
// sequence, so the funnel fills evenly and renders the same on every build. Start at
// QUEUE_PLANES.
import * as R from 'remeda'

export type QueueRectTone = 'far' | 'mid' | 'near' | 'bar-mid' | 'bar-near' | 'bar-hot'

export type QueueRect = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly tone: QueueRectTone
}

const RAIL_X = 710
const NECK_Y = 556
const FUNNEL_HALF_WIDTH = 552
const NECK_HALF_WIDTH = 22
const GOLDEN_A = 0.7548776662
const GOLDEN_B = 0.569840291

type Plane = {
  readonly count: number
  readonly width: number
  readonly height: number
  readonly spread: number
  readonly offsetA: number
  readonly offsetB: number
  readonly tone: 'far' | 'mid' | 'near'
  readonly bars: number
}

const FAR: Plane = { count: 46, width: 22, height: 28, spread: 0.72, offsetA: 0, offsetB: 0, tone: 'far', bars: 0 }
const MID: Plane = { count: 30, width: 38, height: 48, spread: 0.74, offsetA: 0.31, offsetB: 0.17, tone: 'mid', bars: 3 }
const NEAR: Plane = { count: 13, width: 64, height: 82, spread: 0.8, offsetA: 0.62, offsetB: 0.34, tone: 'near', bars: 5 }

/** Every fifth near tile hides a failure that looks just like the code around it. */
const HOT_TILE_EVERY = 5

const funnelHalfWidthAt = (y: number): number =>
  FUNNEL_HALF_WIDTH * (1 - Math.min(y, NECK_Y) / NECK_Y) + NECK_HALF_WIDTH

const barsOf = (plane: Plane, x: number, y: number, tileIndex: number): readonly QueueRect[] => {
  const padX = Math.round(plane.width / 7)
  const padY = Math.round(plane.height / 6)
  const barHeight = Math.max(2, Math.round(plane.height / 12))
  const gap = Math.max(2, Math.round(plane.height / 9))
  return R.map(R.range(0, plane.bars), (bar) => {
    const length = 0.45 + (((tileIndex * 7 + bar * 13) % 10) / 10) * 0.55
    const isHot = plane.tone === 'near' && tileIndex % HOT_TILE_EVERY === 2 && bar === 2
    return {
      x: x + padX,
      y: y + padY + bar * (barHeight + gap),
      width: Math.round((plane.width - padX * 2) * length),
      height: barHeight,
      tone: isHot ? 'bar-hot' : plane.tone === 'near' ? 'bar-near' : 'bar-mid',
    }
  })
}

const tileRects = (plane: Plane, index: number): readonly QueueRect[] => {
  const depth = ((index + 1) * GOLDEN_A + plane.offsetA) % 1
  const side = ((index + 1) * GOLDEN_B + plane.offsetB) % 1
  const centerY = -24 + depth ** plane.spread * 540
  const room = Math.max(funnelHalfWidthAt(Math.max(centerY, 0)) - plane.width / 2 - 6, 4)
  const x = Math.round(RAIL_X + (side * 2 - 1) * room - plane.width / 2)
  const y = Math.round(centerY - plane.height / 2)
  const tile: QueueRect = { x, y, width: plane.width, height: plane.height, tone: plane.tone }
  return [tile, ...barsOf(plane, x, y, index)]
}

const planeRects = (plane: Plane): readonly QueueRect[] =>
  R.flatMap(R.range(0, plane.count), (index) => tileRects(plane, index))

export const QUEUE_PLANES = {
  far: planeRects(FAR),
  mid: planeRects(MID),
  near: planeRects(NEAR),
} as const
