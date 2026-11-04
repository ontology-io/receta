import type { CSSProperties } from 'react'

const designPixels = (value: number): string => `calc(${value} * var(--spacing))`

/** Places an element at design coordinates. For positions that come from data. */
export const stagePosition = (x: number, y: number): CSSProperties => ({
  left: designPixels(x),
  top: designPixels(y),
})

/** A size in design pixels, for sizes that come from data. */
export const stageSize = (size: number): string => designPixels(size)
