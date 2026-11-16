// What the registry stores, behind one interface: D1 in the Worker, memory in the tests.
import { parseJSON, unwrapOr } from '@ontologyio/receta/result'
import * as R from 'remeda'

export type SubmissionStatus = 'candidate' | 'accepted' | 'declined'

export type Submission = {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly summary: string
  readonly tags: readonly string[]
  readonly inputs: readonly { readonly name: string; readonly type: string }[]
  readonly output: string
  readonly why: string
  /** `category/name` of the asset it varies, or '' when it is new. */
  readonly adaptedFrom: string
  readonly code: string
  readonly status: SubmissionStatus
  readonly decisionNote: string
  readonly createdAt: string
}

export type NewSubmission = Omit<Submission, 'id' | 'status' | 'decisionNote' | 'createdAt'> & {
  /** A salted hash of the sender's address, kept only to rate-limit. */
  readonly sender: string
}

/** People's votes and agents' reports for one item. */
export type Tally = { readonly votes: number; readonly worked: number; readonly failed: number }

export const NO_TALLY: Tally = { votes: 0, worked: 0, failed: 0 }

/** `candidate/<id>`: how votes, reports and vectors name a submission. */
export const candidateKey = (id: string): string => `candidate/${id}`

export type Registry = {
  readonly submit: (submission: NewSubmission) => Promise<Submission>
  readonly find: (id: string) => Promise<Submission | undefined>
  /** Unreviewed submissions, most voted first, then newest. */
  readonly candidates: (limit: number) => Promise<readonly Submission[]>
  readonly submittedSince: (sender: string, since: Date) => Promise<number>
  readonly tallies: (items: readonly string[]) => Promise<ReadonlyMap<string, Tally>>
  /** Items by people's votes, most first. */
  readonly mostVoted: (limit: number) => Promise<readonly (readonly [string, number])[]>
  readonly reportUse: (item: string, worked: boolean, reporter: string) => Promise<void>
  readonly reportedSince: (reporter: string, since: Date) => Promise<number>
  /** Casts or withdraws a person's vote. Voting twice changes nothing. */
  readonly vote: (item: string, githubId: string, on: boolean) => Promise<void>
  readonly hasVoted: (item: string, githubId: string) => Promise<boolean>
  readonly decide: (id: string, status: SubmissionStatus, note: string) => Promise<boolean>
}

/** A short, sortable, unguessable id: the time in base 36, then random characters. */
export const newId = (): string =>
  `${Date.now().toString(36)}${R.join(
    R.map([...crypto.getRandomValues(new Uint8Array(6))], (byte) => (byte % 36).toString(36)),
    '',
  )}`

type SubmissionRow = {
  id: string
  name: string
  category: string
  summary: string
  tags: string
  inputs: string
  output: string
  why: string
  adapted_from: string | null
  code: string
  status: SubmissionStatus
  decision_note: string | null
  created_at: string
}

const toSubmission = (row: SubmissionRow): Submission => ({
  id: row.id,
  name: row.name,
  category: row.category,
  summary: row.summary,
  tags: unwrapOr(parseJSON<readonly string[]>(row.tags), []),
  inputs: unwrapOr(parseJSON<Submission['inputs']>(row.inputs), []),
  output: row.output,
  why: row.why,
  adaptedFrom: row.adapted_from ?? '',
  code: row.code,
  status: row.status,
  decisionNote: row.decision_note ?? '',
  createdAt: row.created_at,
})

const placeholders = (count: number): string => R.join(R.times(count, () => '?'), ', ')

export const d1Registry = (db: D1Database): Registry => ({
  submit: async (submission) => {
    const id = newId()
    const row = await db
      .prepare(
        `INSERT INTO submissions (id, name, category, summary, tags, inputs, output, why, adapted_from, code, sender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .bind(
        id,
        submission.name,
        submission.category,
        submission.summary,
        JSON.stringify(submission.tags),
        JSON.stringify(submission.inputs),
        submission.output,
        submission.why,
        submission.adaptedFrom === '' ? null : submission.adaptedFrom,
        submission.code,
        submission.sender,
      )
      .first<SubmissionRow>()
    if (row === null) throw new Error('the submission was not stored')
    return toSubmission(row)
  },
  find: async (id) => {
    const row = await db.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first<SubmissionRow>()
    return row === null ? undefined : toSubmission(row)
  },
  candidates: async (limit) => {
    const { results } = await db
      .prepare(
        `SELECT s.* FROM submissions s
         LEFT JOIN (SELECT item, COUNT(*) AS votes FROM votes GROUP BY item) v ON v.item = 'candidate/' || s.id
         WHERE s.status = 'candidate'
         ORDER BY COALESCE(v.votes, 0) DESC, s.created_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<SubmissionRow>()
    return R.map(results, toSubmission)
  },
  submittedSince: async (sender, since) => {
    const row = await db
      .prepare('SELECT COUNT(*) AS n FROM submissions WHERE sender = ? AND created_at >= ?')
      .bind(sender, since.toISOString())
      .first<{ n: number }>()
    return row?.n ?? 0
  },
  tallies: async (items) => {
    if (items.length === 0) return new Map()
    const votes = await db
      .prepare(`SELECT item, COUNT(*) AS n FROM votes WHERE item IN (${placeholders(items.length)}) GROUP BY item`)
      .bind(...items)
      .all<{ item: string; n: number }>()
    const uses = await db
      .prepare(
        `SELECT item, SUM(worked) AS worked, SUM(1 - worked) AS failed FROM uses
         WHERE item IN (${placeholders(items.length)}) GROUP BY item`,
      )
      .bind(...items)
      .all<{ item: string; worked: number; failed: number }>()
    const voteCount = new Map(R.map(votes.results, (row) => [row.item, row.n] as const))
    const useCount = new Map(R.map(uses.results, (row) => [row.item, row] as const))
    return new Map(
      R.map(items, (item) => [
        item,
        {
          votes: voteCount.get(item) ?? 0,
          worked: useCount.get(item)?.worked ?? 0,
          failed: useCount.get(item)?.failed ?? 0,
        },
      ] as const),
    )
  },
  mostVoted: async (limit) => {
    const { results } = await db
      .prepare('SELECT item, COUNT(*) AS n FROM votes GROUP BY item ORDER BY n DESC LIMIT ?')
      .bind(limit)
      .all<{ item: string; n: number }>()
    return R.map(results, (row) => [row.item, row.n] as const)
  },
  reportUse: async (item, worked, reporter) => {
    await db.prepare('INSERT INTO uses (item, worked, reporter) VALUES (?, ?, ?)').bind(item, worked ? 1 : 0, reporter).run()
  },
  reportedSince: async (reporter, since) => {
    const row = await db
      .prepare('SELECT COUNT(*) AS n FROM uses WHERE reporter = ? AND created_at >= ?')
      .bind(reporter, since.toISOString())
      .first<{ n: number }>()
    return row?.n ?? 0
  },
  vote: async (item, githubId, on) => {
    await (on
      ? db.prepare('INSERT OR IGNORE INTO votes (item, github_id) VALUES (?, ?)').bind(item, githubId).run()
      : db.prepare('DELETE FROM votes WHERE item = ? AND github_id = ?').bind(item, githubId).run())
  },
  hasVoted: async (item, githubId) =>
    (await db.prepare('SELECT 1 FROM votes WHERE item = ? AND github_id = ?').bind(item, githubId).first()) !== null,
  decide: async (id, status, note) => {
    const result = await db
      .prepare('UPDATE submissions SET status = ?, decision_note = ? WHERE id = ?')
      .bind(status, note === '' ? null : note, id)
      .run()
    return result.meta.changes > 0
  },
})
