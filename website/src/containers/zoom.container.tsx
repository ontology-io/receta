import * as R from 'remeda'
import { PinBlock } from '@/components/primitives/pin-block'
import { ZoomScene } from '@/components/scenes/zoom-scene'
import { zoomContent } from '@/content/home.content'
import { SCENE_HEIGHT } from '@/lib/motion/rails'
import { REST_LEVEL } from '@/lib/motion/timelines'
import { loadCode } from './load-code'

const PIN_LENGTH = 160
const START_LEVEL = { 'data-level': String(REST_LEVEL) } as const
const FUNCTION_FIRST_LINE = 6
const DECLARED_FAILURES = { SyntaxError: 'err', OrderError: 'err' } as const

/** Pins the zoom scene: the real module, and just its function for small screens. */
export const ZoomContainer = async () => {
  const source = await loadCode('zoom.sample.ts')
  const narrowSource = R.drop(await loadCode('zoom.sample.ts', DECLARED_FAILURES), FUNCTION_FIRST_LINE)
  return (
    <PinBlock block="zoom" pin={PIN_LENGTH} height={SCENE_HEIGHT.zoom} attributes={START_LEVEL}>
      <ZoomScene copy={zoomContent} source={source} narrowSource={narrowSource} />
    </PinBlock>
  )
}
