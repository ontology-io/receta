// Each asset is indexed three times, so an agent can ask by what a function does, by what it
// takes, or by what it returns, and get a match on whichever it knows.
//
// "What it does" is the gist: the name's words, the summary and the tags. The "Use when"
// paragraph stays out. It spends most of its words on mechanics such as error codes, which
// pulled short queries away: on 47 realistic queries (scripts/eval.ts), the gist put the
// right asset in the top three 46 times where the full text did 44.
import * as R from 'remeda'
import { type BundledAsset, keyOf } from './bundle'

export const FIELDS = ['does', 'takes', 'returns'] as const

export type Field = (typeof FIELDS)[number]

export type VectorMatch = { readonly id: string; readonly score: number }

/** Reviewed assets come from the catalog; candidates are submissions nobody has reviewed. */
export type Status = 'reviewed' | 'candidate'

export type VectorEntry = {
  readonly id: string
  readonly values: readonly number[]
  readonly metadata: { readonly field: Field; readonly category: string; readonly status: Status }
}

/** The vector side of the search. Cloudflare's lives in cloudflare.ts, a fake in the tests. */
export type Vectors = {
  /** Embeds search queries. */
  readonly embed: (texts: readonly string[]) => Promise<readonly (readonly number[])[]>
  /** Embeds the texts an asset or a submission is indexed by. */
  readonly embedEntries: (texts: readonly string[]) => Promise<readonly (readonly number[])[]>
  readonly query: (
    vector: readonly number[],
    field: Field,
    topK: number,
    statuses: readonly Status[],
  ) => Promise<readonly VectorMatch[]>
  readonly upsert: (entries: readonly VectorEntry[]) => Promise<void>
  readonly remove: (ids: readonly string[]) => Promise<void>
}

/**
 * A catalog asset, or a submission shaped like one. Submissions carry their id, and their
 * key is `candidate/<id>`, so no submission can pass for a reviewed asset.
 */
export type Listing = BundledAsset & { readonly candidateId?: string }

export const keyFor = (listing: Listing): string =>
  listing.candidateId === undefined ? keyOf(listing) : `candidate/${listing.candidateId}`

export const vectorId = (listing: Listing, field: Field): string => `${keyFor(listing)}#${field}`

/** The asset key a vector id belongs to: `parse/parsePort#does` gives `parse/parsePort`. */
export const keyOfVector = (id: string): string => id.replace(/#[a-z]+$/, '')

/** The three vectors a listing is indexed by, ready to embed. */
export const entriesFor = (
  listing: Listing,
  status: Status,
): readonly { readonly id: string; readonly text: string; readonly metadata: VectorEntry['metadata'] }[] =>
  R.map(FIELDS, (field) => ({
    id: vectorId(listing, field),
    text: fieldText(listing, field),
    metadata: { field, category: listing.category, status },
  }))

export const fieldText = (asset: BundledAsset, field: Field): string => {
  if (field === 'does') {
    // The name's words read as a phrase: circuitBreaker gives "circuit breaker".
    const name = asset.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
    return `${name}: ${asset.summary} (${R.join(asset.tags, ', ')})`
  }
  if (field === 'takes') {
    const inputs = asset.inputs ?? []
    return inputs.length === 0
      ? 'takes nothing'
      : `takes ${R.join(R.map(inputs, (input) => `${input.name}: ${input.type}`), '; ')}`
  }
  return `returns ${asset.output ?? 'unknown'}`
}
