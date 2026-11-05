import { OptionScene } from '@/components/scenes/option-scene'
import { optionContent } from '@/content/home.content'
import { loadCode } from './load-code'

/** The Option scene, with its compiled sample. */
export const OptionContainer = async () => (
  <OptionScene copy={optionContent} code={await loadCode('option.sample.ts')} />
)
