// How each line of the crime scene leaves. The lines that hid failure fall away. The
// lines that do the work close ranks. Index order matches src/samples/crime.sample.js.
import * as R from 'remeda'
import type { CodeLine } from '@/lib/code/tokenize'

export type LineFall = {
  readonly isKept: boolean
  /** Where the line ends up, in design pixels from where it starts. */
  readonly dx: number
  readonly dy: number
  readonly turn: number
}

const LINE_HEIGHT = 38
const INDENT = 28.8

const keep = (linesUp: number, dx = 0): LineFall => ({
  isKept: true,
  dx,
  dy: -linesUp * LINE_HEIGHT,
  turn: 0,
})

const fall = (dx: number, dy: number, turn: number): LineFall => ({ isKept: false, dx, dy, turn })

const LINE_FALLS: readonly LineFall[] = [
  keep(0),
  fall(28, 300, -3),
  keep(1, -INDENT),
  fall(86, 380, 3),
  keep(2, -INDENT),
  fall(40, 520, -4),
  fall(112, 640, 5),
  fall(32, 760, -7),
  keep(5),
]

export type CrimeLine = LineFall & { readonly tokens: CodeLine }

/** Pairs each line of code with the way it leaves. */
export const withFalls = (lines: readonly CodeLine[]): readonly CrimeLine[] =>
  R.map(lines, (tokens, index) => ({ ...(LINE_FALLS[index] ?? keep(0)), tokens }))
