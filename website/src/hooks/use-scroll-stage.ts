// Drives every scrubbed scene from one animation loop. This is the only code that
// touches scroll, layout or the DOM: it asks lib/motion what each block should show and
// writes the answer as CSS variables, so React never re-renders while the page scrolls.
// Start at useScrollStage.
import Lenis from 'lenis'
import { useEffect, type RefObject } from 'react'
import { clamp } from '@ontologyio/receta/number'
import { fromNullable, isSome, type Option } from '@ontologyio/receta/option'
import * as R from 'remeda'
import {
  blockFrame,
  buildRailReach,
  railFraction,
  TOKEN_LINE,
  type BlockFrame,
  type BlockGeometry,
  type Point,
  type Viewport,
} from '@/lib/motion/frame'
import { morphRail, STRAIGHT_RAIL, TANGLED_RAIL } from '@/lib/motion/rails'
import { TIMELINES, type SceneFrame } from '@/lib/motion/timelines'

const STAGE_MEDIA_QUERY = '(min-width: 72rem)'
const RAIL_SAMPLE_STEP = 8
const NAV_HEIGHT = 84
/** The full stop stays in its sentence for the first pixels of scroll. */
const HOLD_IN_SENTENCE = 40
const SCROLL_DAMPING = 0.12

type RailParts = {
  readonly base: SVGPathElement
  readonly paint: SVGPathElement
  readonly token: SVGCircleElement
  readonly reach: readonly number[]
  readonly shouldMorph: boolean
}

type Follower = { readonly path: SVGPathElement; readonly token: SVGCircleElement }

type Block = {
  readonly id: string
  readonly element: HTMLElement
  readonly geometry: BlockGeometry
  readonly rail: Option<RailParts>
  readonly follower: Option<Follower>
  readonly isLast: boolean
}

/**
 * Starts the scroll stage on the stage layout when the reader allows motion. Without
 * either, it does nothing and the page shows its rest frames.
 */
export const useScrollStage = (stage: RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const element = stage.current
    const canScrub = document.documentElement.hasAttribute('data-motion')
    if (!element || !canScrub) return undefined

    const stageMedia = matchMedia(STAGE_MEDIA_QUERY)
    let stopStage = stageMedia.matches ? startStage(element) : undefined

    const onLayoutChange = (): void => {
      stopStage?.()
      stopStage = stageMedia.matches ? startStage(element) : undefined
    }

    stageMedia.addEventListener('change', onLayoutChange)
    return () => {
      stageMedia.removeEventListener('change', onLayoutChange)
      stopStage?.()
    }
  }, [stage])
}

const startStage = (stage: HTMLElement): (() => void) => {
  const lenis = new Lenis({ lerp: SCROLL_DAMPING, anchors: true })
  const nav = fromNullable(document.querySelector<HTMLElement>('[data-nav]'))
  let blocks = measureBlocks(stage)
  let animationFrame = 0

  const onFrame = (time: number): void => {
    lenis.raf(time)
    const viewport = readViewport(lenis.scroll)
    R.forEach(blocks, (block) => renderBlock(block, viewport))
    paintNav(nav, blocks, viewport)
    animationFrame = requestAnimationFrame(onFrame)
  }

  const onResize = (): void => {
    blocks = measureBlocks(stage)
  }

  addEventListener('resize', onResize)
  animationFrame = requestAnimationFrame(onFrame)

  return () => {
    cancelAnimationFrame(animationFrame)
    removeEventListener('resize', onResize)
    lenis.destroy()
  }
}

const readViewport = (scroll: number): Viewport => ({
  scroll,
  height: innerHeight,
  maxScroll: document.documentElement.scrollHeight - innerHeight,
})

const designUnit = (): number => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16

const measureBlocks = (stage: HTMLElement): readonly Block[] => {
  const unit = designUnit()
  const elements = [...stage.querySelectorAll<HTMLElement>('[data-block]')]
  return R.map(elements, (element, index) => {
    const { top, height } = element.getBoundingClientRect()
    const pinStage = element.querySelector('[data-pin-stage]')
    const stageHeight = pinStage?.getBoundingClientRect().height ?? height
    return {
      id: element.dataset['block'] ?? '',
      element,
      geometry: {
        top: top + scrollY,
        height,
        stageHeight,
        unit,
        anchorsAtTop: element.hasAttribute('data-anchor-top'),
      },
      rail: readRail(element, readDesignHeight(element)),
      follower: readFollower(element),
      isLast: index === elements.length - 1,
    }
  })
}

const readDesignHeight = (element: HTMLElement): number =>
  parseFloat(getComputedStyle(element).getPropertyValue('--stage-height'))

const samplePath = (path: SVGPathElement): readonly Point[] => {
  const length = path.getTotalLength()
  const count = Math.ceil(length / RAIL_SAMPLE_STEP)
  return R.map(R.range(0, count + 1), (index) => {
    const { x, y } = path.getPointAtLength(Math.min(index * RAIL_SAMPLE_STEP, length))
    return { x, y }
  })
}

const readRail = (element: HTMLElement, stageHeight: number): Option<RailParts> => {
  const rails = [...element.querySelectorAll<SVGSVGElement>('[data-rail]')]
  const visibleRail = R.find(rails, (rail) => getComputedStyle(rail).display !== 'none')
  const base = visibleRail?.querySelector<SVGPathElement>('[data-rail-base]')
  const paint = visibleRail?.querySelector<SVGPathElement>('[data-rail-paint]')
  const token = visibleRail?.querySelector<SVGCircleElement>('[data-token]')
  return fromNullable(
    visibleRail && base && paint && token
      ? {
          base,
          paint,
          token,
          reach: buildRailReach(samplePath(base), stageHeight),
          shouldMorph: visibleRail.hasAttribute('data-rail-morph'),
        }
      : undefined,
  )
}

const readFollower = (element: HTMLElement): Option<Follower> => {
  const path = element.querySelector<SVGPathElement>('[data-follow-path]')
  const token = element.querySelector<SVGCircleElement>('[data-follow-token]')
  return fromNullable(path && token ? { path, token } : undefined)
}

const renderBlock = (block: Block, viewport: Viewport): void => {
  const frame = blockFrame(block.geometry, viewport)
  const sceneFrame = TIMELINES[block.id]?.(frame.progress)
  if (frame.isVisible) writeFrame(block.element, frame, sceneFrame)
  if (isSome(block.rail)) renderRail(block, block.rail.value, frame, viewport, sceneFrame)
  if (isSome(block.follower) && frame.isVisible) {
    moveAlong(block.follower.value.path, block.follower.value.token, sceneFrame?.followerAt ?? 1)
  }
}

const writeFrame = (element: HTMLElement, frame: BlockFrame, sceneFrame: SceneFrame | undefined): void => {
  const { style } = element
  style.setProperty('--shift', frame.shift.toFixed(2))
  style.setProperty('--reveal', frame.reveal.toFixed(3))
  R.forEachObj(sceneFrame?.variables ?? {}, (value, name) => style.setProperty(name, value.toFixed(4)))
  R.forEachObj(sceneFrame?.attributes ?? {}, (value, name) => element.setAttribute(name, value))
}

const renderRail = (
  block: Block,
  rail: RailParts,
  frame: BlockFrame,
  viewport: Viewport,
  sceneFrame: SceneFrame | undefined,
): void => {
  if (rail.shouldMorph && frame.isVisible) {
    const path = morphRail(TANGLED_RAIL, STRAIGHT_RAIL, sceneFrame?.railMorph ?? 0)
    rail.base.setAttribute('d', path)
    rail.paint.setAttribute('d', path)
  }
  const fraction = railProgress(block, rail, frame, viewport)
  rail.paint.setAttribute('stroke-dashoffset', (1 - fraction).toFixed(4))
  const isHere = frame.travel > 0 && (frame.travel < 1 || block.isLast)
  rail.token.style.visibility = isHere ? 'visible' : 'hidden'
  if (isHere) moveAlong(rail.base, rail.token, fraction)
}

const railProgress = (block: Block, rail: RailParts, frame: BlockFrame, viewport: Viewport): number => {
  const { geometry } = block
  const isPinned = geometry.height > geometry.stageHeight
  if (isPinned) return frame.travel
  if (!geometry.anchorsAtTop) return railFraction(rail.reach, (frame.travel * geometry.stageHeight) / geometry.unit)
  const start = viewport.height * TOKEN_LINE + HOLD_IN_SENTENCE
  const line = viewport.scroll + viewport.height * TOKEN_LINE
  return clamp((line - start) / (geometry.height - start), 0, 1)
}

const moveAlong = (path: SVGPathElement, token: SVGCircleElement, fraction: number): void => {
  const { x, y } = path.getPointAtLength(path.getTotalLength() * fraction)
  token.setAttribute('cx', x.toFixed(1))
  token.setAttribute('cy', y.toFixed(1))
}

/** The nav takes the colour of the scene under it, once the page has left the hero's top. */
const paintNav = (nav: Option<HTMLElement>, blocks: readonly Block[], viewport: Viewport): void => {
  if (!isSome(nav)) return
  const line = viewport.scroll + NAV_HEIGHT * (blocks[0]?.geometry.unit ?? 1)
  const under = R.find(blocks, ({ geometry }) => geometry.top <= line && geometry.top + geometry.height > line)
  nav.value.dataset['tone'] = viewport.scroll > HOLD_IN_SENTENCE && under ? toneOf(under) : 'clear'
}

const toneOf = ({ element }: Block): string => {
  if (element.dataset['phase']) return element.dataset['phase'] === 'story' ? 'paper' : 'ink'
  return element.dataset['tone'] ?? element.querySelector<HTMLElement>('[data-tone]')?.dataset['tone'] ?? 'ink'
}
