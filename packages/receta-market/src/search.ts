// Ranks assets for a job by blending two signals. Vectors find meaning: "keep the newest"
// reaches an asset whose summary says "the one that sorts first". Words find exact names and
// types, which vectors blur: `parsePort` or `Result<number>` must not lose to a near miss.
//
//   query ─┬─ words: BM25 over name, tags, summary ──────────────────┐
//          ├─ job    ─ embed ─ nearest "does" vectors    (weight .6) ├─ min-max each,
//          ├─ input  ─ embed ─ nearest "takes" vectors   (weight .2) │  blend .25 words
//          └─ output ─ embed ─ nearest "returns" vectors (weight .2) ┘  with .75 vectors
//
// The shares come from scripts/eval.ts: on 47 realistic queries this blend put the right
// asset first 42 times and in the top three 45 times; words alone managed 37 and 42.
// When the vectors fail, the words alone answer, so search degrades instead of erroring.
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import { isOk, tryCatchAsync } from '@ontologyio/receta/result'
import * as R from 'remeda'
import { search as searchWords } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { type Field, keyFor, keyOfVector, type Listing, type Status, type Vectors } from './vectors'

export type SearchQuery = {
  readonly job: string
  readonly input?: string | undefined
  readonly output?: string | undefined
  readonly category?: string | undefined
  readonly limit?: number | undefined
  /** Reviewed only, unless the agent asks for unreviewed submissions too. */
  readonly statuses?: readonly Status[] | undefined
}

export type Ranked = {
  readonly asset: Listing
  /** 0 to 1. */
  readonly score: number
  /** The two signals before blending, each 0 to 1, for tuning. */
  readonly parts: { readonly words: number; readonly vectors: number }
  /** False when the vector index couldn't be reached and only words ranked the results. */
  readonly semantic: boolean
}

/** What each signal said before any blending, keyed by `category/name`. */
export type RawScores = {
  readonly asked: readonly (readonly [Field, string])[]
  /** BM25 scores. */
  readonly words: ReadonlyMap<string, number>
  /** Cosine similarity per asked field; undefined when the vector index failed. */
  readonly fields: ReadonlyMap<Field, ReadonlyMap<string, number>> | undefined
}

const WEIGHTS: Readonly<Record<Field, number>> = { does: 0.6, takes: 0.2, returns: 0.2 }
const VECTOR_SHARE = 0.75
const PER_FIELD = 50
const WORD_HITS = 60

/** Scales scores to 0..1 so words and vectors, on different scales, can be blended. */
const normalize = (scores: ReadonlyMap<string, number>): ReadonlyMap<string, number> => {
  const values = [...scores.values()]
  const low = Math.min(...values)
  const high = Math.max(...values)
  return new Map(
    R.map([...scores.entries()], ([key, score]) => [key, high === low ? 1 : (score - low) / (high - low)] as const),
  )
}

const vectorScores = async (
  vectors: Vectors,
  asked: readonly (readonly [Field, string])[],
  statuses: readonly Status[],
): Promise<ReadonlyMap<Field, ReadonlyMap<string, number>>> => {
  const embeddings = await vectors.embed(R.map(asked, ([, text]) => text))
  const perField = await mapAsyncOrThrow(asked, async ([field], index) => {
    const matches = await vectors.query(embeddings[index] ?? [], field, PER_FIELD, statuses)
    // A key can match twice when an old vector lingers; its best score counts.
    const best = R.pipe(
      matches,
      R.groupBy((match) => keyOfVector(match.id)),
      R.mapValues((group) => Math.max(...R.map(group, R.prop('score')))),
    )
    return [field, new Map(R.entries(best))] as const
  })
  return new Map(perField)
}

/** Search sees only what it is given: pass catalog assets, plus candidates when asked for. */
export const rawScores = async (
  listings: readonly Listing[],
  query: SearchQuery,
  vectors: Vectors | undefined,
): Promise<RawScores> => {
  const words = new Map(
    R.map(
      searchWords(listings, R.join([query.job, query.input ?? '', query.output ?? ''], ' '), {
        category: query.category,
        limit: WORD_HITS,
      }),
      (hit) => [keyFor(hit.asset as Listing), hit.score] as const,
    ),
  )
  const asked = R.filter(
    [
      ['does', query.job],
      ['takes', query.input ?? ''],
      ['returns', query.output ?? ''],
    ] as const,
    ([, text]) => text.trim() !== '',
  )
  const statuses = query.statuses ?? ['reviewed']
  const fromVectors =
    vectors === undefined ? undefined : await tryCatchAsync(() => vectorScores(vectors, asked, statuses))
  return { asked, words, fields: fromVectors !== undefined && isOk(fromVectors) ? fromVectors.value : undefined }
}

export const rank = async (
  listings: readonly Listing[],
  query: SearchQuery,
  vectors: Vectors | undefined,
): Promise<readonly Ranked[]> => {
  const raw = await rawScores(listings, query, vectors)
  // Only what was passed in can be returned, whatever the index holds.
  const byKey = new Map(R.map(listings, (listing) => [keyFor(listing), listing] as const))
  const words = normalize(raw.words)
  const fields =
    raw.fields === undefined
      ? undefined
      : new Map(R.map([...raw.fields.entries()], ([field, scores]) => [field, normalize(scores)] as const))
  const totalWeight = R.sumBy(raw.asked, ([field]) => WEIGHTS[field])
  const vectorScore = (key: string): number =>
    fields === undefined
      ? 0
      : R.sumBy(raw.asked, ([field]) => WEIGHTS[field] * (fields.get(field)?.get(key) ?? 0)) / totalWeight
  const keys = R.unique([...words.keys(), ...[...(fields?.values() ?? [])].flatMap((scores) => [...scores.keys()])])

  return R.pipe(
    keys,
    R.map((key) => ({ key, asset: byKey.get(key) })),
    // Vectors of an asset that left the catalog stay in the index until it is rebuilt.
    R.filter((entry): entry is { key: string; asset: Listing } => entry.asset !== undefined),
    R.filter(({ asset }) => query.category === undefined || asset.category === query.category),
    R.map(({ key, asset }) => {
      const parts = { words: words.get(key) ?? 0, vectors: vectorScore(key) }
      return {
        asset,
        parts,
        semantic: fields !== undefined,
        score: fields === undefined ? parts.words : VECTOR_SHARE * parts.vectors + (1 - VECTOR_SHARE) * parts.words,
      }
    }),
    R.sortBy([R.prop('score'), 'desc']),
    R.take(query.limit ?? 8),
  )
}
