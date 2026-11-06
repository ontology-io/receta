// Finds the code examples in a docs page and decides which compiler complaints are real.
// Pure, so the rules have tests. scripts/check-examples.ts runs them. Start at pageExamples.
import * as R from 'remeda'

export type Example = {
  /** Page path relative to content/docs. */
  readonly page: string
  /** 1-based line of the first line of code in the page. */
  readonly line: number
  readonly code: string
  readonly isTsx: boolean
  /** How the lint treats it: `vanilla` must avoid Receta, `nolint` is a counted exception. */
  readonly style: ExampleStyle
}

export type ExampleStyle = 'receta' | 'vanilla' | 'nolint'

/** Fence titles the reference generator gives to signatures, which have no bodies to run. */
const SIGNATURE_TITLE = /title="(Signature|Data-first|Data-last|Overload \d+)"/

/** Marks a fence as deliberately wrong or not TypeScript at all, such as a broken "before". */
const OPT_OUT = /\bnocheck\b/

const FENCE = /^```(tsx|typescript|ts)([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm

const lineOf = (text: string, index: number): number => text.slice(0, index).split('\n').length

/** A title is prose, so a title that says "vanilla" says nothing about the fence. */
const styleOf = (meta: string): ExampleStyle => {
  const flags = meta.replace(/title="[^"]*"/, '')
  if (/\bvanilla\b/.test(flags)) return 'vanilla'
  return /\bnolint\b/.test(flags) ? 'nolint' : 'receta'
}

const toExample = (page: string, text: string, match: RegExpExecArray): Example => {
  const [whole, language = '', meta = '', code = ''] = match
  return {
    page,
    line: lineOf(text, match.index + whole.indexOf('\n') + 1),
    code,
    isTsx: language === 'tsx',
    style: styleOf(meta),
  }
}

const isCheckable = ([, , meta = '']: RegExpExecArray): boolean =>
  !SIGNATURE_TITLE.test(meta) && !OPT_OUT.test(meta)

/** Every example on a page that the checker should compile. */
export const pageExamples = (page: string, text: string): readonly Example[] =>
  R.pipe(
    [...text.matchAll(FENCE)],
    R.filter(isCheckable),
    R.map((match) => toExample(page, text, match)),
  )

/** How many fences on a page opted out, so the total can be reported. */
export const optOutCount = (text: string): number =>
  R.pipe(
    [...text.matchAll(FENCE)],
    R.filter(([, , meta = '']) => OPT_OUT.test(meta)),
    R.length(),
  )

/** The module a page teaches, read from its path, so examples can leave imports out. */
export const pageModule = (page: string): string => {
  const [first = '', second = ''] = page.split('/')
  return first === 'reference' ? second.replace(/\.mdx$/, '') : first
}

/**
 * Complaints that come from examples being fragments rather than from a wrong API:
 * - the same name declared twice, because one block shows several variations
 * - a signature with no body, shown to describe a function
 * - `unknown`, which is what a generic infers when its input is an imaginary helper
 * - `EventTarget`, because only ECMAScript is typed, so a browser event has no real target
 * - a module that isn't Receta or Remeda, such as an imaginary ./db
 */
const FRAGMENT_CODES = new Set([2300, 2323, 2391, 2393, 2451, 2484, 2440])

const UNKNOWN_VALUE = 18046

const NO_OVERLOAD_MATCHES = 2769

const OWN_MODULE = /'(@ontologyio\/[^']+|remeda(?:\/[^']*)?)'/

/**
 * Whether a compiler complaint is about the docs being wrong. An example with imaginary
 * helpers gets more slack, because its types can't all be known.
 */
export const isRealProblem = (code: number, message: string, hasHelpers = true): boolean => {
  if (code === UNKNOWN_VALUE) return !hasHelpers
  if (FRAGMENT_CODES.has(code) || message.includes('EventTarget')) return false
  // "No overload matches" prints `value is unknown` even when the example is fully typed.
  const isUnknownNoise = code !== NO_OVERLOAD_MATCHES && /\bunknown\b/.test(message)
  if (isUnknownNoise && hasHelpers) return false
  if (code === 2307) return OWN_MODULE.test(message)
  return true
}

/** A compiler code that means a name isn't declared anywhere in the example. */
export const isUndeclaredName = (code: number): boolean => [2304, 2552, 2503, 2663, 2580, 2582, 2584, 2591].includes(code)
