import { PinBlock } from '@/components/primitives/pin-block'
import { OkScene } from '@/components/scenes/ok-scene'
import { okContent } from '@/content/home.content'
import { SCENE_HEIGHT } from '@/lib/motion/rails'
import { CopyCommandContainer } from './copy-command.container'

const PIN_LENGTH = 40

/** The ending: pins the last sentence so the value can land. */
export const OkContainer = () => (
  <PinBlock id="install" block="ok" pin={PIN_LENGTH} height={SCENE_HEIGHT.ok}>
    <OkScene copy={okContent} install={<CopyCommandContainer tone="paper" />} />
  </PinBlock>
)
