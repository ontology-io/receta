// The Cloudflare side: Workers AI turns text into vectors, Vectorize stores and searches them.
import { mapAsyncOrThrow } from '@ontologyio/receta/async'
import * as R from 'remeda'
import type { Bundle } from './bundle'
import { entriesFor, type Listing, type Vectors } from './vectors'

export type Env = {
  readonly AI: Ai
  readonly VECTORS: VectorizeIndex
  readonly DB: D1Database
  /** Guards /admin/*. Set with `wrangler secret put ADMIN_TOKEN`. */
  readonly ADMIN_TOKEN?: string
  /** Salts the hash of a sender's address, so the stored hash can't be reversed. */
  readonly SENDER_SALT?: string
  /** The path the Worker is mounted under, like `/market`; empty on its own domain. */
  readonly BASE_PATH?: string
  readonly GITHUB_CLIENT_ID?: string
  readonly GITHUB_CLIENT_SECRET?: string
  /** Signs the session cookie of a person signed in with GitHub. */
  readonly SESSION_SECRET?: string
  /** public/: the self-hosted fonts. Served before the Worker runs, except under BASE_PATH. */
  readonly ASSETS?: Fetcher
  /** Caps people's searches per address; past it, search ranks by words and calls no AI. */
  readonly SEARCH_LIMIT?: RateLimit
}

/** 768 dimensions, cosine. The Vectorize index must be created with the same. */
export const MODEL = '@cf/baai/bge-base-en-v1.5'
const EMBED_BATCH = 50

/**
 * bge models are trained to match a short query, prefixed with this, against longer
 * passages. The texts things are indexed by are embedded without it.
 */
const QUERY_INSTRUCTION = 'Represent this sentence for searching relevant passages: '

const embed = async (env: Env, texts: readonly string[]): Promise<readonly (readonly number[])[]> => {
  const result = await env.AI.run(MODEL, { text: [...texts] })
  return 'data' in result && result.data !== undefined ? result.data : []
}

export const cloudflareVectors = (env: Env, options: { readonly instruct?: boolean } = {}): Vectors => ({
  embed: (texts) =>
    embed(env, options.instruct === false ? texts : R.map(texts, (text) => `${QUERY_INSTRUCTION}${text}`)),
  embedEntries: (texts) => embed(env, texts),
  query: async (vector, field, topK, statuses) => {
    const found = await env.VECTORS.query([...vector], {
      topK,
      filter: { field, status: { $in: [...statuses] } },
      returnMetadata: 'none',
    })
    return R.map(found.matches, (match) => ({ id: match.id, score: match.score }))
  },
  upsert: async (entries) => {
    await env.VECTORS.upsert(
      R.map(entries, (entry) => ({ id: entry.id, values: [...entry.values], metadata: { ...entry.metadata } })),
    )
  },
  remove: async (ids) => {
    await env.VECTORS.deleteByIds([...ids])
  },
})

/**
 * Embeds every catalog asset and every unreviewed submission three ways and writes the
 * vectors, so a submission whose indexing failed when it arrived gets indexed here. Returns
 * how many were written.
 */
export const reindex = async (vectors: Vectors, bundle: Bundle, candidates: readonly Listing[]): Promise<number> => {
  const items = [
    ...R.flatMap(bundle.assets, (asset) => entriesFor(asset, 'reviewed')),
    ...R.flatMap(candidates, (candidate) => entriesFor(candidate, 'candidate')),
  ]
  const written = await mapAsyncOrThrow(
    R.chunk(items, EMBED_BATCH),
    async (batch) => {
      const values = await vectors.embedEntries(R.map(batch, R.prop('text')))
      await vectors.upsert(
        R.zipWith(batch, values, (item, vector) => ({ id: item.id, values: vector, metadata: item.metadata })),
      )
      return batch.length
    },
    { concurrency: 2 },
  )
  return R.sum(written)
}
