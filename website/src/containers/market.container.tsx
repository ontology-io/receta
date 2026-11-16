import { MarketScene } from '@/components/scenes/market-scene'
import { marketContent } from '@/content/home.content'
import { CopyCommandContainer } from './copy-command.container'

/** The marketplace: one live search, and the command that connects an agent to it. */
export const MarketContainer = () => (
  <MarketScene
    copy={marketContent}
    connect={<CopyCommandContainer copy={marketContent.connect} tone="err" shouldWrap />}
  />
)
