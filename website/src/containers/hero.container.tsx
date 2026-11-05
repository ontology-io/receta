import { HeroScene } from '@/components/scenes/hero-scene'
import { heroContent } from '@/content/home.content'
import { tokenizeLines } from '@/lib/code/tokenize'
import { CopyCommandContainer } from './copy-command.container'

const PIPE_EMPHASIS = { reader: 'err' } as const

/** The opening scene: the pitch, and the page as a pipe. */
export const HeroContainer = () => (
  <HeroScene
    copy={heroContent}
    pipe={tokenizeLines(heroContent.pipeLines, PIPE_EMPHASIS)}
    install={<CopyCommandContainer tone="err" />}
  />
)
