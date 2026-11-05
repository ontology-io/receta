import { PinBlock } from '@/components/primitives/pin-block'
import { Rail } from '@/components/primitives/rail'
import { CrimeScene } from '@/components/scenes/crime-scene'
import { StoryBackdrop } from '@/components/scenes/story-backdrop'
import { StoryScene } from '@/components/scenes/story-scene'
import { crimeContent, storyContent } from '@/content/home.content'
import { withFalls } from '@/lib/motion/crime-lines'
import { morphRail, SCENE_HEIGHT, STRAIGHT_RAIL, TANGLED_RAIL } from '@/lib/motion/rails'
import { loadCode } from './load-code'

const PIN_LENGTH = 240
const START_PHASE = { 'data-phase': 'crime' } as const
const EVIDENCE = { data2: 'evidence', null: 'evidence', catch: 'evidence', e: 'evidence' } as const
const DECLARED_FAILURES = { SyntaxError: 'err', OrderError: 'err' } as const

/** The crime scene and the story share one pin: the first turns into the second. */
export const StoryContainer = async () => {
  const crime = await loadCode('crime.sample.js', EVIDENCE)
  const crimeNarrow = await loadCode('crime-narrow.sample.js', EVIDENCE)
  const story = await loadCode('story.sample.ts', DECLARED_FAILURES)
  const storyNarrow = await loadCode('story-narrow.sample.ts', DECLARED_FAILURES)

  return (
    <PinBlock block="story" pin={PIN_LENGTH} height={SCENE_HEIGHT.story} attributes={START_PHASE}>
      {/* ink, with paper rising through it */}
      <StoryBackdrop />

      {/* the rail pulling straight */}
      <div className="absolute inset-y-0 left-1/2 hidden w-1440 -translate-x-1/2 scrub:block">
        <Rail
          path={morphRail(TANGLED_RAIL, STRAIGHT_RAIL, 0)}
          height={SCENE_HEIGHT.story}
          base="ink"
          paint="phase"
          token={{ x: 710, y: 0, size: 24 }}
          display="scrub"
          shouldMorph
          tailX={104}
        />
      </div>

      {/* before */}
      <CrimeScene copy={crimeContent} lines={withFalls(crime)} narrowLines={crimeNarrow} />

      {/* after */}
      <StoryScene copy={storyContent} lines={story} narrowLines={storyNarrow} />
    </PinBlock>
  )
}
