import { describe, expect, it } from 'bun:test'
import { blockFrame, buildRailReach, railFraction, type BlockGeometry, type Viewport } from './frame'

const block: BlockGeometry = { top: 1000, height: 900, stageHeight: 900, unit: 1, anchorsAtTop: false }
const pinned: BlockGeometry = { ...block, height: 1800 }
const viewportAt = (scroll: number): Viewport => ({ scroll, height: 900, maxScroll: 100000 })

describe('blockFrame', () => {
  it('rests a scene when it is centred in the viewport', () => {
    expect(blockFrame(block, viewportAt(1000)).shift).toBe(0)
  })

  it('holds a pinned scene still for the whole pin', () => {
    expect(blockFrame(pinned, viewportAt(1000)).shift).toBe(0)
    expect(blockFrame(pinned, viewportAt(1900)).shift).toBe(0)
  })

  it('reports pin progress from 0 to 1', () => {
    expect(blockFrame(pinned, viewportAt(1000)).progress).toBe(0)
    expect(blockFrame(pinned, viewportAt(1450)).progress).toBe(0.5)
    expect(blockFrame(pinned, viewportAt(9000)).progress).toBe(1)
  })

  it('finishes the last scene when the page runs out of scroll', () => {
    const lastScene = { ...block, top: 1000, height: 900 }
    const viewport = { scroll: 1000, height: 900, maxScroll: 1000 }
    expect(blockFrame(lastScene, viewport).travel).toBe(1)
  })
})

describe('rail reach', () => {
  const horizontalRun = [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: 500, y: 100 },
    { x: 500, y: 400 },
  ]

  it('never goes backwards', () => {
    const reach = buildRailReach(horizontalRun, 400)
    const isRising = reach.every((value, index) => value >= (reach[index - 1] ?? 0))
    expect(isRising).toBe(true)
  })

  it('makes a horizontal run cost scroll', () => {
    const reach = buildRailReach(horizontalRun, 400)
    expect(reach[2] ?? 0).toBeGreaterThan(reach[1] ?? 0)
  })

  it('finds the fraction of the rail reached', () => {
    expect(railFraction([0, 100, 200], 0)).toBe(0)
    expect(railFraction([0, 100, 200], 100)).toBe(0.5)
    expect(railFraction([0, 100, 200], 500)).toBe(1)
  })
})
