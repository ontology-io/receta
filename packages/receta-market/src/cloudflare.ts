// The Cloudflare side: Workers AI turns text into vectors, Vectorize stores and searches them.
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import * as R from 'remeda'
import { type Bundle, keyOf } from './bundle'
import { FIELDS, fieldText, vectorId, type Vectors } from './vectors'

export type Env = {
  readonly AI: Ai
  readonly VECTORS: VectorizeIndex
  /** Guards /admin/reindex. Set with `wrangler secret put ADMIN_TOKEN`. */
  readonly ADMIN_TOKEN?: string
}

/** 768 dimensions, cosine. The Vectorize index must be created with the same. */
export const MODEL = '@cf/baai/bge-base-en-v1.5'
const EMBED_BATCH = 50

const embed = async (env: Env, texts: readonly string[]): Promise<readonly (readonly number[])[]> => {
  const result = await env.AI.run(MODEL, { text: [...texts] })
  return 'data' in result && result.data !== undefined ? result.data : []
}

export const cloudflareVectors = (env: Env): Vectors => ({
  embed: (texts) => embed(env, texts),
  query: async (vector, field, topK) => {
    const found = await env.VECTORS.query([...vector], { topK, filter: { field }, returnMetadata: 'none' })
    return R.map(found.matches, (match) => ({ id: match.id, score: match.score }))
  },
})

/** Embeds every asset three ways and writes the vectors. Returns how many were written. */
export const reindex = async (env: Env, bundle: Bundle): Promise<number> => {
  const items = R.flatMap(bundle.assets, (asset) =>
    R.map(FIELDS, (field) => ({
      id: vectorId(asset, field),
      text: fieldText(asset, field),
      metadata: { field, category: asset.category, name: keyOf(asset), status: 'reviewed' },
    })),
  )
  const written = await mapAsyncOrThrow(
    R.chunk(items, EMBED_BATCH),
    async (batch) => {
      const vectors = await embed(env, R.map(batch, R.prop('text')))
      await env.VECTORS.upsert(
        R.zipWith(batch, vectors, (item, values) => ({ id: item.id, values: [...values], metadata: item.metadata })),
      )
      return batch.length
    },
    { concurrency: 2 },
  )
  return R.sum(written)
}
