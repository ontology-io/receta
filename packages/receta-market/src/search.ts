// Ranks assets for a job by blending two signals. Vectors find meaning: "keep the newest"
// reaches an asset whose summary says "the one that sorts first". Words find exact names and
// types, which vectors blur: `parsePort` or `Result<number>` must not lose to a near miss.
//
//   query ─┬─ words: BM25 over name, tags, summary ──────────────────┐
//          ├─ job    ─ embed ─ nearest "does" vectors    (weight .6) ├─ min-max each,
//          ├─ input  ─ embed ─ nearest "takes" vectors   (weight .2) │  blend .4 words
//          └─ output ─ embed ─ nearest "returns" vectors (weight .2) ┘  with .6 vectors
//
// When the vectors fail, the words alone answer, so search degrades instead of erroring.
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import { isOk, tryCatchAsync } from '@ontologyio/receta/result'
import * as R from 'remeda'
import { search as searchWords } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { type BundledAsset, keyOf } from './bundle'
import { type Field, keyOfVector, type Vectors } from './vectors'

export type SearchQuery = {
  readonly job: string
  readonly input?: string | undefined
  readonly output?: string | undefined
  readonly category?: string | undefined
  readonly limit?: number | undefined
}

export type Ranked = {
  readonly asset: BundledAsset
  /** 0 to 1. */
  readonly score: number
  /** False when the vector index couldn't be reached and only words ranked the results. */
  readonly semantic: boolean
}

const WEIGHTS: Readonly<Record<Field, number>> = { does: 0.6, takes: 0.2, returns: 0.2 }
const VECTOR_SHARE = 0.6
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

/** Each asked field's normalized similarity per asset key. */
const vectorScores = async (
  vectors: Vectors,
  asked: readonly (readonly [Field, string])[],
): Promise<ReadonlyMap<Field, ReadonlyMap<string, number>>> => {
  const embeddings = await vectors.embed(R.map(asked, ([, text]) => text))
  const perField = await mapAsyncOrThrow(asked, async ([field], index) => {
    const matches = await vectors.query(embeddings[index] ?? [], field, PER_FIELD)
    // A key can match twice when an old vector lingers; its best score counts.
    const best = R.pipe(
      matches,
      R.groupBy((match) => keyOfVector(match.id)),
      R.mapValues((group) => Math.max(...R.map(group, R.prop('score')))),
    )
    return [field, normalize(new Map(R.entries(best)))] as const
  })
  return new Map(perField)
}

export const rank = async (
  assets: readonly BundledAsset[],
  query: SearchQuery,
  vectors: Vectors | undefined,
): Promise<readonly Ranked[]> => {
  const byKey = new Map(R.map(assets, (asset) => [keyOf(asset), asset] as const))
  const words = normalize(
    new Map(
      R.map(
        searchWords(assets, R.join([query.job, query.input ?? '', query.output ?? ''], ' '), {
          category: query.category,
          limit: WORD_HITS,
        }),
        (hit) => [keyOf(hit.asset), hit.score] as const,
      ),
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
  const fromVectors =
    vectors === undefined ? undefined : await tryCatchAsync(() => vectorScores(vectors, asked))
  const fields = fromVectors !== undefined && isOk(fromVectors) ? fromVectors.value : undefined
  const totalWeight = R.sumBy(asked, ([field]) => WEIGHTS[field])
  const vectorScore = (key: string): number =>
    fields === undefined
      ? 0
      : R.sumBy(asked, ([field]) => WEIGHTS[field] * (fields.get(field)?.get(key) ?? 0)) / totalWeight
  const keys = R.unique([...words.keys(), ...[...(fields?.values() ?? [])].flatMap((scores) => [...scores.keys()])])

  return R.pipe(
    keys,
    R.map((key) => ({ key, asset: byKey.get(key) })),
    // Vectors of an asset that left the catalog stay in the index until it is rebuilt.
    R.filter((entry): entry is { key: string; asset: BundledAsset } => entry.asset !== undefined),
    R.filter(({ asset }) => query.category === undefined || asset.category === query.category),
    R.map(({ key, asset }) => ({
      asset,
      semantic: fields !== undefined,
      score:
        fields === undefined
          ? (words.get(key) ?? 0)
          : VECTOR_SHARE * vectorScore(key) + (1 - VECTOR_SHARE) * (words.get(key) ?? 0),
    })),
    R.sortBy([R.prop('score'), 'desc']),
    R.take(query.limit ?? 8),
  )
}
