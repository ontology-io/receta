// Turns a file an agent offers into a submission, or says why it can't be one. A submission
// is public the moment it is stored, so everything that would make it wrong to publish is
// checked here, before it is stored: shape, private-looking text, duplicates.
import { err, ok, type Result } from '@ontologyio/receta/result'
import * as R from 'remeda'
import {
  candidateProblems,
  describe,
  findAsset,
  importsOf,
  privacyWarnings,
  sameCode,
} from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import type { Bundle, BundledAsset } from './bundle'
import type { NewSubmission, Submission } from './registry'
import type { Listing } from './vectors'

/** A submission shaped like a catalog asset, so search and the tools treat both alike. */
export const listingOf = (submission: Submission): Listing => ({
  name: submission.name,
  category: submission.category,
  import: '',
  path: '',
  summary: submission.summary,
  useWhen: submission.why,
  tags: submission.tags,
  composes: [],
  signatures: [],
  inputs: submission.inputs,
  output: submission.output,
  hasDiagram: false,
  source: submission.code,
  candidateId: submission.id,
})

export const MAX_FILE_LENGTH = 20_000

export type Offer = {
  readonly file: string
  readonly category: string
  readonly why: string
  readonly adaptedFrom: string
}

export type Refusal = {
  readonly code: 'NOT_AN_ASSET' | 'UNCHANGED_COPY' | 'PROJECT_CODE' | 'PRIVATE_TEXT' | 'NAME_TAKEN'
  readonly reasons: readonly string[]
}

/** The text between a bracket at `open` and its partner, with nested brackets skipped. */
const balanced = (text: string, open: number): string => {
  const pairs: Readonly<Record<string, string>> = { '(': ')', '<': '>', '{': '}', '[': ']' }
  const closer = pairs[text[open] ?? ''] ?? ''
  const end = R.reduce(
    [...text.slice(open + 1)],
    (state, char, index) => {
      if (state.found >= 0) return state
      if (char === text[open]) return { depth: state.depth + 1, found: -1 }
      if (char === closer) return state.depth === 0 ? { depth: 0, found: open + 1 + index } : { depth: state.depth - 1, found: -1 }
      return state
    },
    { depth: 0, found: -1 },
  ).found
  return end < 0 ? '' : text.slice(open + 1, end)
}

/** Splits on commas outside any brackets. */
const topLevelSplit = (text: string): readonly string[] =>
  R.pipe(
    [...text],
    R.reduce(
      (state, char) => {
        const depth = state.depth + (/[(<{[]/.test(char) ? 1 : 0) - (/[)>}\]]/.test(char) && !state.arrow ? 1 : 0)
        if (char === ',' && state.depth === 0) return { ...state, parts: [...state.parts, ''] }
        const parts = [...state.parts.slice(0, -1), `${state.parts.at(-1) ?? ''}${char}`]
        return { parts, depth, arrow: char === '=' }
      },
      { parts: [''] as readonly string[], depth: 0, arrow: false },
    ),
    (state) => R.filter(R.map(state.parts, (part) => part.trim()), (part) => part !== ''),
  )

/**
 * The parameters and return type of the first `export function name`, read from the text.
 * Close enough to index by; the intake's typecheck is what proves the file.
 */
export const signatureOf = (
  code: string,
  name: string,
): { readonly inputs: readonly { readonly name: string; readonly type: string }[]; readonly output: string } => {
  const at = code.search(new RegExp(`^export function ${name}\\b`, 'm'))
  const afterName = at < 0 ? -1 : code.indexOf('(', at)
  if (afterName < 0) return { inputs: [], output: 'unknown' }
  const params = balanced(code, afterName)
  const rest = code.slice(afterName + params.length + 2)
  const output = /^\s*:\s*([^{;]+?)\s*(?:\{|;|$)/m.exec(rest)?.[1]?.replace(/\s+/g, ' ') ?? 'unknown'
  return {
    inputs: R.map(topLevelSplit(params), (param) => {
      const colon = param.indexOf(':')
      return colon < 0
        ? { name: param, type: 'unknown' }
        : { name: param.slice(0, colon).replace(/[?]$/, '').trim(), type: param.slice(colon + 1).replace(/\s+/g, ' ').trim() }
    }),
    output,
  }
}

const refuse = (code: Refusal['code'], reasons: readonly string[]): Result<never, Refusal> => err({ code, reasons })

/** Checks an offer against the catalog and the rules, and shapes it for the registry. */
export const toSubmission = (
  offer: Offer,
  bundle: Bundle,
  sender: string,
): Result<NewSubmission, Refusal> => {
  const name = /^export function (\w+)/m.exec(offer.file)?.[1] ?? ''
  const existing = findAsset(bundle.assets, name) as BundledAsset | undefined
  if (existing !== undefined && sameCode(existing.source, offer.file)) {
    return refuse('UNCHANGED_COPY', [`This is ${existing.category}/${existing.name} unchanged. There is nothing to offer.`])
  }
  const projectImports = R.filter(importsOf(offer.file), (source) => source.startsWith('.'))
  if (projectImports.length > 0) {
    return refuse('PROJECT_CODE', [
      `It imports ${R.join(projectImports, ', ')} from the project. Only a function that does a job on its own is a candidate.`,
    ])
  }
  const problems = name === '' ? ['The file exports no function.'] : candidateProblems(name, offer.file)
  if (problems.length > 0) return refuse('NOT_AN_ASSET', problems)
  if (existing !== undefined) {
    return refuse('NAME_TAKEN', [
      `${existing.category}/${existing.name} already exists. If this is a variant, name it by what differs.`,
    ])
  }
  const warnings = privacyWarnings(offer.file)
  if (warnings.length > 0) {
    return refuse('PRIVATE_TEXT', [
      'A submission is public at once, and these look like they belong to a project. Remove or generalize them:',
      ...warnings,
    ])
  }
  const { summary, tags } = describe(offer.file, name)
  return ok({
    name,
    category: offer.category,
    summary,
    tags,
    ...signatureOf(offer.file, name),
    why: offer.why,
    adaptedFrom: offer.adaptedFrom,
    code: offer.file,
    sender,
  })
}
