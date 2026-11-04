import { PinBlock } from '@/components/primitives/pin-block'
import { PipeScene } from '@/components/scenes/pipe-scene'
import { pipeContent } from '@/content/home.content'
import { SCENE_HEIGHT } from '@/lib/motion/rails'

const PIN_LENGTH = 80

/** Pins the unfolding of nested calls onto the rail. */
export const PipeContainer = () => (
  <PinBlock block="pipe" pin={PIN_LENGTH} height={SCENE_HEIGHT.pipe}>
    <PipeScene copy={pipeContent} />
  </PinBlock>
)
