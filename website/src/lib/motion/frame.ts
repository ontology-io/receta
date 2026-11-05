// Turns a scroll position into what one block should show. Pure, so the whole scroll
// model is testable without a browser. useScrollStage is the only caller, and writes
// the result to the DOM. Start at blockFrame.
import { clamp } from '@ontologyio/receta/number'
import * as R from 'remeda'

/** The value rides at 61% of the viewport height while the page moves under it. */
export const TOKEN_LINE = 0.61

/** The least scroll a stretch of rail may cost, so horizontal runs still take time. */
const SCROLL_PER_RAIL_UNIT = 0.3

export type Point = { readonly x: number; readonly y: number }

export type BlockGeometry = {
  readonly top: number
  readonly height: number
  /** Height of the scene itself. Anything beyond it is pin distance. */
  readonly stageHeight: number
  /** Stage scale: real pixels per design pixel. */
  readonly unit: number
  /** Parallax measures from the top instead of the centre, so the hero rests at scroll 0. */
  readonly anchorsAtTop: boolean
}

export type Viewport = { readonly scroll: number; readonly height: number; readonly maxScroll: number }

export type BlockFrame = {
  /** Scene offset from its rest position in design pixels, for parallax. */
  readonly shift: number
  /** Pin progress 0..1. */
  readonly progress: number
  /** Reveal progress 0..1 as the block enters the viewport. */
  readonly reveal: number
  /** How far the value line has travelled through the block, 0..1. */
  readonly travel: number
  readonly isVisible: boolean
}

const REVEAL_START = 0.85
const REVEAL_LENGTH = 0.6

/** Computes one block's state for a scroll position. */
export const blockFrame = (block: BlockGeometry, viewport: Viewport): BlockFrame => {
  const { top, height, stageHeight, unit, anchorsAtTop } = block
  const { scroll, height: viewportHeight, maxScroll } = viewport
  const pin = height - stageHeight
  const line = scroll + viewportHeight * TOKEN_LINE
  const lastLine = Math.min(top + height, maxScroll + viewportHeight * TOKEN_LINE)
  return {
    shift: restOffset(block, viewport, pin, anchorsAtTop) / unit,
    progress: pin > 0 ? clamp((scroll - top) / pin, 0, 1) : 1,
    reveal: clamp(
      (scroll + viewportHeight * REVEAL_START - top) / (stageHeight * REVEAL_LENGTH),
      0,
      1,
    ),
    travel: clamp((line - top) / (lastLine - top), 0, 1),
    isVisible: top < scroll + viewportHeight && top + height > scroll,
  }
}

const restOffset = (
  { top, height }: BlockGeometry,
  { scroll, height: viewportHeight }: Viewport,
  pin: number,
  anchorsAtTop: boolean,
): number => {
  if (anchorsAtTop) return scroll
  if (pin > 0) return scroll - clamp(scroll, top, top + pin)
  return scroll - (top + (height - viewportHeight) / 2)
}

/**
 * For each rail point, how far down the scene the value line must be to reach it. It
 * follows the point's own height, but every stretch of rail costs a minimum, so a
 * horizontal run spends a fixed budget and the next vertical stretch catches up.
 */
export const buildRailReach = (points: readonly Point[], stageHeight: number): readonly number[] => {
  const first = points[0]?.y ?? 0
  const reach = R.reduce(
    points,
    (reached: readonly number[], point, index) => {
      const previous = points[index - 1] ?? point
      const step = Math.hypot(point.x - previous.x, point.y - previous.y)
      const earliest = (reached[index - 1] ?? first) + step * SCROLL_PER_RAIL_UNIT
      return R.concat(reached, [Math.max(point.y, earliest)])
    },
    [],
  )
  const last = reach[reach.length - 1] ?? stageHeight
  return R.map(reach, (value) => (value * stageHeight) / Math.max(last, stageHeight))
}

/** Finds how far along the rail the value is, 0..1, when the line is at a height in the scene. */
export const railFraction = (reach: readonly number[], lineHeight: number): number => {
  const lastIndex = reach.length - 1
  return lastIndex > 0 ? Math.min(R.sortedIndex(reach, lineHeight), lastIndex) / lastIndex : 1
}
