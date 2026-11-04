import { ValidationScene } from '@/components/scenes/validation-scene'
import { validationContent } from '@/content/home.content'
import { loadCode } from './load-code'

/** The Validation scene, with its compiled sample. */
export const ValidationContainer = async () => (
  <ValidationScene copy={validationContent} code={await loadCode('validation.sample.ts')} />
)
