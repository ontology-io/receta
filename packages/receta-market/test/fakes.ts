// Stand-ins for Vectorize, Workers AI and D1, so the tests drive the real server code.
import * as R from 'remeda'
import { tokenize } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import { bundle } from '../src/bundle'
import { newId, NO_TALLY, type Registry, type Submission } from '../src/registry'
import { entriesFor, type VectorEntry, type Vectors } from '../src/vectors'

const DIMENSIONS = 256

const hashOf = (word: string): number =>
  R.reduce([...word], (hash, char) => (hash * 31 + char.charCodeAt(0)) % DIMENSIONS, 7)

/** A hashed bag of words: similar wording gives similar vectors, without Workers AI. */
const fakeEmbed = (text: string): readonly number[] => {
  const perSlot = R.countBy(tokenize(text), (word) => String(hashOf(word)))
  const counts = R.times(DIMENSIONS, (slot): number => perSlot[String(slot)] ?? 0)
  const length = Math.sqrt(R.sumBy(counts, (value) => value * value)) || 1
  return R.map(counts, (value) => value / length)
}

const cosine = (a: readonly number[], b: readonly number[]): number => R.sumBy(R.zip(a, b), ([x, y]) => x * y)

/** A vector index holding the catalog, as a reindex would leave it. */
export const fakeVectors = (): Vectors & { readonly stored: () => readonly VectorEntry[] } => {
  const entries = new Map<string, VectorEntry>(
    R.map(R.flatMap(bundle.assets, (asset) => entriesFor(asset, 'reviewed')), (entry) => [
      entry.id,
      { id: entry.id, values: fakeEmbed(entry.text), metadata: entry.metadata },
    ]),
  )
  return {
    stored: () => [...entries.values()],
    embed: async (texts) => R.map(texts, fakeEmbed),
    embedEntries: async (texts) => R.map(texts, fakeEmbed),
    query: async (vector, field, topK, statuses) =>
      R.pipe(
        [...entries.values()],
        R.filter((entry) => entry.metadata.field === field && statuses.includes(entry.metadata.status)),
        R.map((entry) => ({ id: entry.id, score: cosine(vector, entry.values) })),
        R.sortBy([R.prop('score'), 'desc']),
        R.take(topK),
      ),
    upsert: async (added) => {
      R.forEach(added, (entry) => entries.set(entry.id, entry))
    },
    remove: async (ids) => {
      R.forEach(ids, (id) => entries.delete(id))
    },
  }
}

export const failingVectors: Vectors = {
  embed: async () => {
    throw new Error('index unavailable')
  },
  embedEntries: async () => {
    throw new Error('index unavailable')
  },
  query: async () => [],
  upsert: async () => undefined,
  remove: async () => undefined,
}

type Use = { readonly item: string; readonly worked: boolean; readonly reporter: string; readonly at: Date }
type Stored = Submission & { readonly sender: string }

export const memoryRegistry = (): Registry => {
  const submissions = new Map<string, Stored>()
  const votes = new Set<string>()
  const uses: Use[] = []
  const votesFor = (item: string): number => R.filter([...votes], (vote) => vote.startsWith(`${item}|`)).length
  return {
    submit: async (submission) => {
      const stored: Stored = {
        ...submission,
        id: newId(),
        status: 'candidate',
        decisionNote: '',
        createdAt: new Date().toISOString(),
      }
      submissions.set(stored.id, stored)
      return stored
    },
    find: async (id) => submissions.get(id),
    candidates: async (limit) =>
      R.pipe(
        [...submissions.values()],
        R.filter((submission) => submission.status === 'candidate'),
        R.sortBy([(submission) => votesFor(`candidate/${submission.id}`), 'desc']),
        R.take(limit),
      ),
    submittedSince: async (sender, since) =>
      R.filter([...submissions.values()], (submission) => submission.sender === sender && new Date(submission.createdAt) >= since)
        .length,
    tallies: async (items) =>
      new Map(
        R.map(items, (item) => {
          const reports = R.filter(uses, (use) => use.item === item)
          return [
            item,
            {
              ...NO_TALLY,
              votes: votesFor(item),
              worked: R.filter(reports, (use) => use.worked).length,
              failed: R.filter(reports, (use) => !use.worked).length,
            },
          ] as const
        }),
      ),
    mostVoted: async (limit) =>
      R.pipe(
        [...votes],
        R.map((vote) => vote.slice(0, vote.indexOf('|'))),
        R.countBy(R.identity()),
        R.entries(),
        R.sortBy([([, count]) => count, 'desc']),
        R.take(limit),
      ),
    reportUse: async (item, worked, reporter) => {
      uses.push({ item, worked, reporter, at: new Date() })
    },
    reportedSince: async (reporter, since) => R.filter(uses, (use) => use.reporter === reporter && use.at >= since).length,
    vote: async (item, githubId, on) => {
      if (on) votes.add(`${item}|${githubId}`)
      else votes.delete(`${item}|${githubId}`)
    },
    hasVoted: async (item, githubId) => votes.has(`${item}|${githubId}`),
    decide: async (id, status, note) => {
      const found = submissions.get(id)
      if (found === undefined) return false
      submissions.set(id, { ...found, status, decisionNote: note })
      return true
    },
  }
}
