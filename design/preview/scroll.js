// Throwaway scroll preview for design/receta-website.pen. Not production code.
// index.html is a straight Pen export. This file reads the speeds out of the
// layer names ("z0 · ghost code · 0.30×"), so the design file stays the spec.
// It previews parallax, the travelling value and the painted rail. Pinned
// scrubs (the morph, the unfold, the zoom) live in the storyboard frames.

const DESIGN_WIDTH = 1440
const TOKEN_VIEWPORT_Y = 0.61 // motion board: the value is held at 61% of the viewport
const SCROLL_PER_RAIL_PX = 0.3 // the least scroll a stretch of rail may spend, so horizontals still take time
const HOLD_IN_SENTENCE = 40 // the full stop stays put for the first pixels of scroll
const TOKEN_DAMPING = 0.14
const SAMPLE_STEP = 6

// The main rail, one geometry per scene, in scene coordinates. Same order as the page.
const RAIL_SEGMENTS = [
  'M 710 485 V 900',
  'M 710 0 V 960',
  'M 710 0 V 52 Q 710 92 750 92 H 1010 Q 1050 92 1050 132 C 1050 262 1345 190 1335 322 C 1325 442 925 300 945 442 C 960 562 1305 472 1295 592 C 1285 702 1005 562 995 682 C 985 802 1180 742 1180 862 V 1040',
  'M 1180 0 V 56 Q 1180 96 1140 96 H 144 Q 104 96 104 136 V 900',
  'M 104 0 V 410 Q 104 470 164 470 H 1290 Q 1340 470 1340 520 V 1020',
  'M 1340 0 V 800 Q 1340 880 1260 880 H 340 Q 300 880 300 920 V 1040',
  'M 300 0 V 800',
  'M 300 0 V 30 Q 300 70 340 70 H 680 Q 720 70 720 110 V 1000',
  'M 720 0 V 40 Q 720 80 680 80 H 144 Q 104 80 104 120 V 1200',
  'M 104 0 V 900',
  'M 104 0 V 1040',
  'M 104 0 V 800',
  'M 104 0 V 40 Q 104 80 144 80 H 1275 Q 1315 80 1315 120 V 327',
]

const ERR_TRACK = 'M 190 470 H 560 V 610 Q 560 670 620 670 H 950'

// Pen draws Newsreader at its default optical size. Measured on "a crime scene" at 126px:
// Pen 632px, optical sizing none 631px, auto 704px. index.html must load the opsz axis too.
document.documentElement.style.fontOpticalSizing = 'none'

const root = document.querySelector('[data-pencil-name^="Home"]')
const scenes = [...root.children]
const prefersStill = matchMedia('(prefers-reduced-motion: reduce)').matches

const sceneHeights = scenes.map((scene) => parseFloat(scene.style.height))
const sceneTops = sceneHeights.map((_, index) =>
  sceneHeights.slice(0, index).reduce((sum, height) => sum + height, 0),
)
const pageHeight = sceneHeights.reduce((sum, height) => sum + height, 0)

const offsetPath = (d, dy) => {
  const parts = d.split(' ')
  let command = ''
  let coordinate = 0
  return parts
    .map((part) => {
      if (/^[A-Z]$/.test(part)) {
        command = part
        coordinate = 0
        return part
      }
      const isY = command === 'V' || (command !== 'H' && coordinate % 2 === 1)
      coordinate += 1
      return isY ? String(parseFloat(part) + dy) : part
    })
    .join(' ')
}

const samplePath = (d) => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  const length = path.getTotalLength()
  const count = Math.ceil(length / SAMPLE_STEP)
  return Array.from({ length: count + 1 }, (_, index) => {
    const point = path.getPointAtLength(Math.min(index * SAMPLE_STEP, length))
    return { x: point.x, y: point.y }
  })
}

const rail = RAIL_SEGMENTS.flatMap((segment, index) => samplePath(offsetPath(segment, sceneTops[index])))
const errTrack = samplePath(ERR_TRACK)

// scrollAt[i] is the scroll position at which the value reaches rail point i. It follows
// the 61% line, except that every stretch of rail costs a minimum of scroll. A horizontal
// run therefore spends a fixed budget, and the next vertical stretch catches back up.
let scrollAt = []

const buildTimeline = () => {
  const line = viewportHeight * TOKEN_VIEWPORT_Y
  scrollAt = []
  rail.forEach((point, index) => {
    const previous = rail[index - 1]
    if (!previous) {
      scrollAt.push(HOLD_IN_SENTENCE)
      return
    }
    const step = Math.hypot(point.x - previous.x, point.y - previous.y)
    scrollAt.push(Math.max(point.y - line, scrollAt[index - 1] + step * SCROLL_PER_RAIL_PX))
  })
}

const indexAtScroll = (scrollY) => {
  let low = 0
  let high = scrollAt.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if (scrollAt[middle] < scrollY) low = middle + 1
    else high = middle
  }
  return low
}

// Parallax layers: anything whose name ends in a speed other than 1.
const layers = [...root.querySelectorAll('[data-pencil-name$="×"]')].flatMap((element) => {
  const speed = parseFloat(element.dataset.pencilName.match(/([\d.]+)×$/)[1])
  const sceneIndex = scenes.findIndex((scene) => scene.contains(element))
  if (speed === 1) return []
  element.style.willChange = 'transform'
  return [{ element, speed, sceneIndex }]
})

const hide = (selector) => root.querySelectorAll(selector).forEach((node) => (node.style.visibility = 'hidden'))
const tokenB = root.querySelector('[data-pencil-name="Token B · empty order"]')

const nav = root.querySelector('[data-pencil-name="Nav · fixed"]')
nav.style.position = 'fixed'
nav.style.zIndex = '20'
nav.style.transition = 'background-color 200ms linear'
const navLabels = [...nav.querySelectorAll('[data-pencil-name]')].filter(
  (node) => node.children.length === 0 && node.style.color,
)
navLabels.forEach((node) => (node.style.transition = 'color 200ms linear'))

// The nav takes the colour of the scene under it.
const SCENE_FILLS = ['#14110E', '#14110E', '#14110E', '#F3EDE2', '#F3EDE2', '#F3EDE2', '#E8E0D1', '#14110E', '#F3EDE2', '#14110E', '#14110E', '#F3EDE2', '#17694A']
const isPaper = (fill) => fill === '#F3EDE2' || fill === '#E8E0D1'

const paintNav = (scrollY) => {
  const fill = SCENE_FILLS[sceneTops.findLastIndex((top) => top <= scrollY + 42)]
  nav.style.backgroundColor = scrollY > 40 ? fill : '#14110E00'
  navLabels.forEach((node) => (node.style.color = isPaper(fill) ? '#16130F' : '#F3EDE2'))
}

const canvas = document.createElement('canvas')
canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10'
const context = canvas.getContext('2d')

let scale = 1
let viewportHeight = 0

const resize = () => {
  const page = document.documentElement
  scale = page.clientWidth / DESIGN_WIDTH
  root.style.zoom = scale
  viewportHeight = page.clientHeight / scale
  const pixelRatio = Math.min(devicePixelRatio, 2)
  canvas.width = page.clientWidth * pixelRatio
  canvas.height = page.clientHeight * pixelRatio
  context.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, 0, 0)
  buildTimeline()
}

// Colour follows the story: hidden failure, then Ok on paper, on ink, and paper on the green ending.
const colourAt = (y) => {
  const scene = sceneTops.findLastIndex((top) => top <= y)
  if (scene < 3) return '#E2461C'
  if (scene === 12) return '#F3EDE2'
  if (scene === 7 || scene === 9 || scene === 10) return '#5CC595'
  return '#17694A'
}

const draw = (scrollY, tokenIndex) => {
  context.clearRect(0, 0, DESIGN_WIDTH, viewportHeight)
  context.lineWidth = 3
  context.lineCap = 'round'

  let index = Math.max(0, tokenIndex - 1200)
  while (index < tokenIndex) {
    const from = rail[index]
    const to = rail[index + 1]
    if (to.y > scrollY - 20 && from.y < scrollY + viewportHeight + 20) {
      context.strokeStyle = colourAt(to.y)
      context.beginPath()
      context.moveTo(from.x, from.y - scrollY)
      context.lineTo(to.x, to.y - scrollY)
      context.stroke()
    }
    index += 1
  }

  const token = rail[tokenIndex]
  const size = token.y < sceneTops[3] ? 12 : 15
  context.fillStyle = colourAt(token.y)
  context.beginPath()
  context.arc(token.x, token.y - scrollY, tokenIndex >= rail.length - 1 ? 12 : size, 0, Math.PI * 2)
  context.fill()
}

const moveTokenB = (scrollY) => {
  const local = scrollY + viewportHeight * TOKEN_VIEWPORT_Y - sceneTops[4]
  const progress = Math.min(Math.max((local - 330) / 620, 0), 1)
  const point = errTrack[Math.round(progress * (errTrack.length - 1))]
  tokenB.style.left = `${point.x - 15}px`
  tokenB.style.top = `${point.y - 15}px`
}

const applyParallax = (scrollY) => {
  layers.forEach(({ element, speed, sceneIndex }) => {
    const centred = sceneTops[sceneIndex] + sceneHeights[sceneIndex] / 2 - viewportHeight / 2
    const anchor = sceneIndex === 0 ? 0 : centred
    element.style.transform = `translate3d(0, ${(1 - speed) * (scrollY - anchor)}px, 0)`
  })
}

let tokenScroll = 0

const frame = () => {
  const scrollY = window.scrollY / scale
  tokenScroll += (scrollY - tokenScroll) * TOKEN_DAMPING

  applyParallax(scrollY)
  moveTokenB(scrollY)
  draw(scrollY, indexAtScroll(tokenScroll))
  paintNav(scrollY)
  requestAnimationFrame(frame)
}

// Read-only hook so the page can be measured from the outside.
window.__preview = { rail, scrollAt: () => scrollAt, indexAtScroll, viewportHeight: () => viewportHeight, pageHeight }

addEventListener('resize', resize)
resize()

// With reduced motion the page stays as exported: rail drawn, tokens at rest, nothing moves.
if (!prefersStill) {
  hide('[data-pencil-name="Token · pinned to scroll"]')
  hide('[data-pencil-name="Token A · valid order"]')
  hide('[data-pencil-name="Token · the last full stop"]')
  document.body.append(canvas)
  frame()
}
