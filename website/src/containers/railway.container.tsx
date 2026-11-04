import { PinBlock } from '@/components/primitives/pin-block'
import { RailwayScene } from '@/components/scenes/railway-scene'
import { railwayContent } from '@/content/home.content'
import { SCENE_HEIGHT } from '@/lib/motion/rails'
import { loadCode } from './load-code'

const PIN_LENGTH = 120

/** Pins the railway so both values can run it. */
export const RailwayContainer = async () => {
  const edgeCode = await loadCode('railway.sample.ts')
  return (
    <PinBlock block="railway" pin={PIN_LENGTH} height={SCENE_HEIGHT.railway}>
      <RailwayScene copy={railwayContent} edgeCode={edgeCode} />
    </PinBlock>
  )
}
