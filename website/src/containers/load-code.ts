// Loads a sample for a container. The containers are the edge of the build: a missing
// sample stops the build here, rather than shipping a page with a hole in it.
import * as R from 'remeda'
import { map, unwrap } from '@ontologyio/receta/result'
import { readSample } from '@/lib/code/sample'
import { tokenizeLines, type CodeLine, type Emphasis } from '@/lib/code/tokenize'

/** Reads a sample and tokenizes it. Throws at build time if the sample is unusable. */
export const loadCode = async (fileName: string, emphasis: Emphasis = {}): Promise<readonly CodeLine[]> =>
  R.pipe(
    await readSample(fileName),
    map((lines) => tokenizeLines(lines, emphasis)),
    unwrap,
  )
