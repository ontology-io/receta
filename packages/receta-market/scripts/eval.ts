// Measures how well search finds the right asset for jobs phrased the way an agent would,
// in words the assets' own summaries mostly don't use. It fetches each signal's raw scores
// once from /admin/explain, then compares ways of blending them offline.
//
//   RECETA_MARKET_URL=<deployment> bun scripts/eval.ts
//
// The admin token is read from ~/.config/receta-market/admin-token, or RECETA_MARKET_TOKEN_FILE.
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mapAsyncOrThrow, retry } from '@ontologyio/receta/async'
import { unwrap } from '@ontologyio/receta/result'
import * as R from 'remeda'

type Case = { readonly job: string; readonly input?: string; readonly output?: string; readonly want: readonly string[] }

const CASES: readonly Case[] = [
  { job: 'stop calling a failing downstream service for a while after repeated errors', want: ['async/circuitBreaker'] },
  { job: 'stop hammering an API after it fails several times in a row', want: ['async/circuitBreaker'] },
  { job: 'send the same request to two replicas and take whichever answers first', want: ['async/hedgedCall', 'async/raceToSuccess'] },
  { job: 'only keep the result of the most recent search request while the user types fast', want: ['async/latestOnly'] },
  { job: 'wait for a background export job to finish, checking every few seconds', want: ['async/pollJob', 'async/pollUntil'] },
  { job: 'undo the earlier steps when a later step of checkout fails', want: ['async/runWithRollback'] },
  { job: 'save a document draft while the user types, not on every keystroke', want: ['async/autosave'] },
  { job: 'dedupe webhook events by id, keeping the most recent one', want: ['collection/latestBy', 'collection/dedupeByKeepBest'] },
  { job: 'find which records were added, removed or changed between two lists', want: ['collection/diffById', 'collection/reconcileById', 'collection/tagChanges'] },
  { job: 'turn a flat list of categories with a parentId into a nested tree', want: ['collection/buildTree'] },
  { job: 'the five best selling products by revenue', want: ['collection/topNBy'] },
  { job: 'add up order amounts for each customer', want: ['collection/totalsBy'] },
  { job: 'page links for a paginator, with gaps shown as dots', want: ['collection/pageNumbers'] },
  { job: 'split a bill into equal parts in cents that still add up to the total', want: ['number/splitEvenly', 'collection/splitEvenly', 'number/splitByWeights'] },
  { job: 'read the PORT the server listens on from the environment', want: ['parse/parsePort', 'parse/parsePortOption'] },
  { job: 'understand size limits like 10MB or 512 KiB written in config', want: ['parse/parseByteSize'] },
  { job: 'get the token out of an Authorization header', want: ['parse/parseBearerToken'] },
  { job: 'how long to wait before trying again, from the HTTP header a rate limited API sends', want: ['parse/parseRetryAfter'] },
  { job: 'turn a price the user typed, like 12.50, into whole cents', want: ['parse/parseMoneyCents', 'number/toMinorUnits'] },
  { job: 'treat yes, no, 1, 0, true and false in an env var as a boolean', want: ['parse/parseEnvFlag', 'parse/parseBoolean'] },
  { job: 'tell the user every rule their new password breaks', want: ['validate/validatePassword'] },
  { job: 'check a registration form with email, password and the repeated password', want: ['validate/validateSignupForm'] },
  { job: 'accept an uploaded avatar only if it is an image below 5 MB', want: ['validate/validateFileUpload', 'control/guardUpload'] },
  { job: 'phone number in international format with country code', want: ['validate/validatePhoneE164'] },
  { job: 'hide most of an email address on a profile page', want: ['text/maskEmail'] },
  { job: 'turn a blog post title into a url segment that no other post uses', want: ['text/uniqueSlug'] },
  { job: 'how many minutes it takes to read an article', want: ['text/readingTimeMinutes'] },
  { job: 'show liked by Ana, Bo and 3 others', want: ['text/listWithOthers', 'text/listToSentence'] },
  { job: 'convert API response keys from snake_case to camelCase', want: ['object/toCamelCaseKeys'] },
  { job: 'remove passwords and tokens from an object before logging it', want: ['object/redactSecrets', 'object/redactKeys'] },
  { job: 'pinned posts first, then the newest', want: ['sort/pinnedFirst', 'sort/sortByPriorityThenNewest'] },
  { job: 'sort file names so file10 comes after file9', want: ['sort/sortNatural'] },
  { job: 'order release numbers so 1.10.0 comes after 1.9.0', want: ['sort/sortVersions', 'sort/latestVersion'] },
  { job: 'add VAT to a net price', want: ['number/priceWithTax'] },
  { job: 'show a byte count as something like 1.5 MB', want: ['number/formatFileSize', 'number/formatFileSizeBinary'] },
  { job: 'show 1.2k instead of 1234 followers', want: ['number/formatCompactCount'] },
  { job: 'may this user delete this document, given their role', want: ['control/authorizeAction'] },
  { job: 'put each user in the same experiment group every time', want: ['control/assignVariant'] },
  { job: 'decide from the HTTP status code whether a request is worth retrying', want: ['control/isRetryableStatus', 'control/classifyHttpStatus'] },
  { job: 'undo and redo in an editor', want: ['state/historyUndo', 'state/historyPush', 'state/historyRedo'] },
  { job: 'add a product to the cart, or bump its quantity if it is already there', want: ['state/cartAddItem'] },
  { job: 'serve a cached value at once and refresh it in the background when it is old', want: ['cache/staleWhileRevalidate'] },
  { job: 'when ten requests ask for the same key at once, fetch it only once', want: ['cache/singleFlight', 'cache/batchedLoader'] },
  { job: 'report every failed item from a list of Results, not just the first', want: ['result/collectAllErrors', 'result/traverseResultsAll', 'result/sequenceRecordAll'] },
  { job: 'turn an error Result into an HTTP response with the right status code', want: ['result/toHttpResponse'] },
  { job: 'check the value is a usable port', input: 'string', output: 'Result<number>', want: ['parse/parsePort'] },
  { job: 'group and sum', input: 'Order[]', output: 'totals per customer', want: ['collection/totalsBy'] },
]

type Explain = {
  readonly asked: readonly (readonly [string, string])[]
  readonly words: Readonly<Record<string, number>>
  readonly fields: Readonly<Record<string, Readonly<Record<string, number>>>> | null
}

const base = process.env['RECETA_MARKET_URL']?.replace(/\/(mcp)?$/, '')
if (base === undefined) {
  console.error('Set RECETA_MARKET_URL to the deployment')
  process.exit(1)
}
const token = (
  await readFile(process.env['RECETA_MARKET_TOKEN_FILE'] ?? join(homedir(), '.config', 'receta-market', 'admin-token'), 'utf8')
).trim()

const explainOnce = async (testCase: Case, instruct: boolean): Promise<Explain> => {
  const response = await fetch(`${base}/admin/explain`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ job: testCase.job, input: testCase.input, output: testCase.output, instruct }),
  })
  // Throwing asks retry for another attempt: right after a deploy, some edges still run
  // the old version for a few minutes, and it doesn't know /admin/explain.
  if (!response.ok) throw new Error(`explain answered ${response.status}`)
  return (await response.json()) as Explain
}

const explain = async (testCase: Case, instruct: boolean): Promise<Explain> =>
  unwrap(await retry(() => explainOnce(testCase, instruct), { maxAttempts: 8, delay: 1500 }))

const WEIGHTS: Readonly<Record<string, number>> = { does: 0.6, takes: 0.2, returns: 0.2 }

const normalize = (scores: Readonly<Record<string, number>>): Readonly<Record<string, number>> => {
  const values = R.values(scores)
  const low = Math.min(...values)
  const high = Math.max(...values)
  return R.mapValues(scores, (score) => (high === low ? 1 : (score - low) / (high - low)))
}

const ranks = (scores: Readonly<Record<string, number>>): Readonly<Record<string, number>> =>
  R.pipe(
    R.entries(scores),
    R.sortBy([([, score]) => score, 'desc']),
    R.map(([key], index) => [key, index + 1] as const),
    R.fromEntries(),
  )

type Blend = { readonly name: string; readonly score: (explained: Explain) => Readonly<Record<string, number>> }

const keysOf = (explained: Explain): readonly string[] =>
  R.unique([...R.keys(explained.words), ...R.flatMap(R.values(explained.fields ?? {}), (scores) => R.keys(scores))])

const minMax = (share: number): Blend => ({
  name: `min-max, vectors ${share}`,
  score: (explained) => {
    const words = normalize(explained.words)
    const fields = R.mapValues(explained.fields ?? {}, normalize)
    const total = R.sumBy(explained.asked, ([field]) => WEIGHTS[field] ?? 0)
    return R.fromEntries(
      R.map(keysOf(explained), (key) => {
        const vector =
          R.sumBy(explained.asked, ([field]) => (WEIGHTS[field] ?? 0) * (fields[field]?.[key] ?? 0)) / total
        return [key, share * vector + (1 - share) * (words[key] ?? 0)] as const
      }),
    )
  },
})

/** Reciprocal rank fusion: each signal adds 1 / (k + rank), so no scale needs matching. */
const fusion = (k: number, wordWeight: number): Blend => ({
  name: `rank fusion, k ${k}, words ${wordWeight}`,
  score: (explained) => {
    const wordRanks = ranks(explained.words)
    const fieldRanks = R.mapValues(explained.fields ?? {}, ranks)
    return R.fromEntries(
      R.map(keysOf(explained), (key) => {
        const vector = R.sumBy(explained.asked, ([field]) => {
          const rank = fieldRanks[field]?.[key]
          return rank === undefined ? 0 : (WEIGHTS[field] ?? 0) / (k + rank)
        })
        const word = wordRanks[key] === undefined ? 0 : wordWeight / (k + (wordRanks[key] ?? 0))
        return [key, vector + word] as const
      }),
    )
  },
})

// The first is words alone, the second vectors alone; src/search.ts uses min-max at 0.75.
const BLENDS: readonly Blend[] = [minMax(0), minMax(1), minMax(0.75), minMax(0.6), fusion(10, 0.4)]

const measure = (explained: readonly Explain[], blend: Blend) => {
  const positions = R.map(R.zip(CASES, explained), ([testCase, result]) => {
    const order = R.pipe(R.entries(blend.score(result)), R.sortBy([([, score]) => score, 'desc']), R.map(([key]) => key))
    const at = R.findIndex(order, (key) => testCase.want.includes(key))
    return at < 0 ? Number.POSITIVE_INFINITY : at + 1
  })
  return {
    top1: R.filter(positions, (at) => at === 1).length,
    top3: R.filter(positions, (at) => at <= 3).length,
    mrr: R.sumBy(positions, (at) => (Number.isFinite(at) ? 1 / at : 0)) / CASES.length,
    misses: R.pipe(
      R.zip(CASES, positions),
      R.filter(([, at]) => at > 3),
      R.map(([testCase, at]) => `${testCase.want[0]} at ${Number.isFinite(at) ? at : 'none'}`),
    ),
  }
}

for (const instruct of [false, true]) {
  const explained = await mapAsyncOrThrow(CASES, (testCase) => explain(testCase, instruct), { concurrency: 4 })
  console.log(`\nQuery instruction ${instruct ? 'on' : 'off'}, ${CASES.length} cases`)
  for (const blend of BLENDS) {
    const result = measure(explained, blend)
    console.log(
      `  ${blend.name.padEnd(34)} top1 ${String(result.top1).padStart(2)}  top3 ${String(result.top3).padStart(2)}  mrr ${result.mrr.toFixed(3)}`,
    )
    if (result.misses.length > 0 && result.misses.length <= 3) {
      console.log(`      misses: ${R.join(result.misses, '; ')}`)
    }
  }
}
