import { describe, expect, it } from 'bun:test'
import { TANGLED_RAIL, STRAIGHT_RAIL, morphRail } from './rails'
import { REST_CAMERA, TIMELINES, segment } from './timelines'

const frameAt = (scene: string, progress: number) => {
  const timeline = TIMELINES[scene]
  if (!timeline) throw new Error(`No timeline for ${scene}`)
  return timeline(progress)
}

describe('segment', () => {
  it('maps a window to 0..1 and clamps outside it', () => {
    expect(segment(0.5, 0.25, 0.75)).toBe(0.5)
    expect(segment(0, 0.25, 0.75)).toBe(0)
    expect(segment(1, 0.25, 0.75)).toBe(1)
  })
})

describe('story', () => {
  it('starts as the crime scene and ends as the story', () => {
    expect(frameAt('story', 0).attributes?.['data-phase']).toBe('crime')
    expect(frameAt('story', 1).attributes?.['data-phase']).toBe('story')
    expect(frameAt('story', 1).variables['--horizon']).toBe(1)
    expect(frameAt('story', 1).railMorph).toBe(1)
  })
})

describe('zoom', () => {
  it('starts on the name and ends on the module', () => {
    expect(frameAt('zoom', 0).attributes?.['data-level']).toBe('0')
    expect(frameAt('zoom', 1).attributes?.['data-level']).toBe('4')
  })

  it('passes through the rest camera at the Flow stop', () => {
    const scale = frameAt('zoom', 0.5).variables['--cam-scale'] ?? 0
    expect(scale).toBeCloseTo(REST_CAMERA.scale, 3)
  })
})

describe('pipe', () => {
  it('lands the innermost call first', () => {
    const halfway = frameAt('pipe', 0.4).variables
    expect(halfway['--unfold-0'] ?? 0).toBeGreaterThan(halfway['--unfold-4'] ?? 0)
  })
})

describe('morphRail', () => {
  it('gives the same command count at both ends, so the path can interpolate', () => {
    const commandsIn = (path: string) => path.split('C').length
    expect(commandsIn(morphRail(TANGLED_RAIL, STRAIGHT_RAIL, 0))).toBe(
      commandsIn(morphRail(TANGLED_RAIL, STRAIGHT_RAIL, 1)),
    )
  })
})
