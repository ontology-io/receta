// The registry pages: what strangers submit comes out escaped, the counts read right, and the
// vote control always matches who is looking and whether voting is open.
import { describe, expect, it } from 'bun:test'
import * as R from 'remeda'
import { bundle } from '../src/bundle'
import { age, ordinal, withCode } from '../src/html'
import { listingOf } from '../src/candidates'
import { assetPage, candidatePage, CONTENT_SECURITY_POLICY, homePage, type PageContext, searchPage } from '../src/pages'
import { NO_TALLY, type Submission, type Tally } from '../src/registry'
import { SCRIPT, SCRIPT_HASH } from '../src/style'

const NOW = new Date('2026-11-16T12:00:00Z')

const context = (overrides: Partial<PageContext> = {}): PageContext => ({
  basePath: '',
  mcpUrl: 'https://market.receta.dev/mcp',
  person: undefined,
  votingOpen: true,
  path: '/c/abc123',
  assetCount: bundle.count,
  now: NOW,
  ...overrides,
})

const submission = (overrides: Partial<Submission> = {}): Submission => ({
  id: 'abc123',
  name: 'maskIban',
  category: 'text',
  summary: 'Shows an IBAN as `DE•• •••• 3000`, the country code and the last four characters behind a mask.',
  tags: ['mask', 'iban'],
  inputs: [{ name: 'iban', type: 'string' }],
  output: 'string',
  why: 'Payout settings show a saved IBAN without exposing it.',
  adaptedFrom: 'text/maskCardNumber',
  code: "export function maskIban(iban: string): string {\n  return '••••'\n}\n",
  status: 'candidate',
  decisionNote: '',
  createdAt: '2026-11-14T09:00:00Z',
  ...overrides,
})

const tally = (votes: number, worked = 0, failed = 0): Tally => ({ ...NO_TALLY, votes, worked, failed })

const body = (response: Response): Promise<string> => response.text()

/** The vote panel only, so the header's own sign-in link can't answer for it. */
const panelOf = (page: string): string => page.slice(page.indexOf('<aside class="tally"'), page.indexOf('</aside>') + 8)

const candidate = (overrides: Partial<PageContext>, voted = false): Promise<string> =>
  body(candidatePage(context(overrides), { submission: submission(), tally: tally(14, 3, 0), voted }))

describe('what strangers submit', () => {
  const hostile = submission({
    name: 'maskIban',
    summary: '<script>alert("summary")</script> and \'single quotes\'',
    why: '<img src=x onerror=alert(1)>',
    adaptedFrom: '"><script>alert(2)</script>',
    decisionNote: '<b>bold</b>',
    code: "</code></pre><script>alert('code')</script>\nconst a = \"<div>\"",
  })

  it('comes out escaped on its own page', async () => {
    const page = await body(candidatePage(context(), { submission: hostile, tally: NO_TALLY, voted: false }))
    expect(page).not.toContain('<script>alert')
    expect(page).not.toContain('<img src=x')
    expect(page).not.toContain('<b>bold</b>')
    expect(page).toContain('&lt;script&gt;alert(&quot;summary&quot;)&lt;/script&gt; and &#39;single quotes&#39;')
    expect(page).toContain('&lt;/code&gt;&lt;/pre&gt;&lt;script&gt;alert(&#39;code&#39;)&lt;/script&gt;')
    expect(page).toContain('const a = &quot;&lt;div&gt;&quot;')
    expect(page).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('comes out escaped in the list on the market home', async () => {
    const page = await body(homePage(context(), { categories: bundle.categories, candidates: [[hostile, NO_TALLY]], popular: [] }))
    expect(page).not.toContain('<script>alert')
    expect(page).not.toContain('<img src=x')
    expect(page).toContain('&lt;script&gt;alert(&quot;summary&quot;)&lt;/script&gt;')
  })

  it('shows backtick spans as code, after escaping what is inside them', () => {
    expect(withCode('Reads `PORT` or `a<b`')).toBe('Reads <code>PORT</code> or <code>a&lt;b</code>')
    expect(withCode('`<script>`')).toBe('<code>&lt;script&gt;</code>')
  })

  it('is served under a policy that runs only the copy script', async () => {
    const response = candidatePage(context(), { submission: submission(), tally: NO_TALLY, voted: false })
    const policy = response.headers.get('content-security-policy') ?? ''
    expect(policy).toBe(CONTENT_SECURITY_POLICY)
    expect(policy).toContain("default-src 'none'")
    expect(policy).toContain("font-src 'self'")
    expect(policy).toContain(`script-src '${SCRIPT_HASH}'`)
    expect(SCRIPT_HASH).toBe(`sha256-${new Bun.CryptoHasher('sha256').update(SCRIPT).digest('base64')}`)
  })
})

describe('badges and counts', () => {
  it('marks an offered function unreviewed, and a catalog one reviewed', async () => {
    const home = await body(homePage(context(), { categories: bundle.categories, candidates: [[submission(), tally(1)]], popular: [] }))
    expect(home).toContain('<span class="badge unreviewed">unreviewed</span>')
    const asset = R.first(bundle.assets)
    if (asset === undefined) throw new Error('the bundle is empty')
    const page = await body(assetPage(context(), { asset, tally: NO_TALLY, voted: false, category: undefined, near: [] }))
    expect(page).toContain('<span class="badge reviewed">reviewed</span>')
    expect(page).not.toContain('badge unreviewed')
  })

  it('says 1 vote, and otherwise votes', async () => {
    const home = await body(
      homePage(context(), {
        categories: bundle.categories,
        candidates: [
          [submission({ id: 'one' }), tally(1, 2, 1)],
          [submission({ id: 'none' }), tally(0)],
        ],
        popular: [],
      }),
    )
    expect(home).toContain('<span class="votes">1 vote</span>')
    expect(home).not.toContain('1 votes')
    expect(home).toContain('<span class="votes">0 votes</span>')
    expect(home).toContain('<span class="worked some">worked 2</span><span class="failed some">failed 1</span>')
    expect(home).toContain('<span class="worked">worked 0</span><span class="failed">failed 0</span>')
    const page = await body(candidatePage(context(), { submission: submission(), tally: tally(1), voted: false }))
    expect(panelOf(page)).toContain('<span class="n">1</span><span class="unit">vote</span>')
  })

  it('shows the empty registry and the empty ranking in words', async () => {
    const home = await body(homePage(context(), { categories: bundle.categories, candidates: [], popular: [] }))
    expect(home).toContain('Nothing waiting for review.')
    expect(home).toContain('No votes yet.')
  })
})

describe('the vote control', () => {
  it('is a disabled "Voting opens soon" while sign-in is not set up', async () => {
    const panel = panelOf(await candidate({ votingOpen: false }))
    expect(panel).toContain('Voting opens soon')
    expect(panel).toContain('disabled')
    expect(panel).not.toContain('<form')
    expect(panel).not.toContain('/auth/login')
  })

  it('is a sign-in that comes back to this page, for someone signed out', async () => {
    const panel = panelOf(await candidate({}))
    expect(panel).toContain('href="/auth/login?return=%2Fc%2Fabc123"')
    expect(panel).toContain('Sign in with GitHub to vote')
    expect(panel).not.toContain('<form')
  })

  it('casts a vote for someone signed in who has not voted', async () => {
    const panel = panelOf(await candidate({ person: { id: '1', login: 'octocat' } }))
    expect(panel).toContain('<form method="post" action="/vote">')
    expect(panel).toContain('name="item" value="candidate/abc123"')
    expect(panel).toContain('name="on" value="1"')
    expect(panel).toContain('Vote for it')
    expect(panel).not.toContain('Withdraw my vote')
  })

  it('withdraws the vote for someone who has voted', async () => {
    const panel = panelOf(await candidate({ person: { id: '1', login: 'octocat' } }, true))
    expect(panel).toContain('You voted for this')
    expect(panel).toContain('name="on" value="0"')
    expect(panel).toContain('Withdraw my vote')
    expect(panel).not.toContain('Vote for it')
  })

  it('agrees with the header', async () => {
    expect(await candidate({ votingOpen: false })).toContain('<span class="session off">Voting opens soon</span>')
    const signedIn = await candidate({ person: { id: '1', login: '<octo>' } })
    expect(signedIn).toContain('Signed in as </span>&lt;octo&gt;')
    expect(signedIn).toContain('action="/auth/logout"')
  })

  it('is gone once a submission is decided', async () => {
    const page = await body(
      candidatePage(context({ person: { id: '1', login: 'octocat' } }), {
        submission: submission({ status: 'declined' }),
        tally: tally(3),
        voted: false,
      }),
    )
    expect(panelOf(page)).not.toContain('<form')
    expect(page).toContain('<span class="badge declined">declined</span>')
    expect(page).not.toContain('Nobody has checked this code yet.')
  })
})

describe('a submission page', () => {
  it('warns, links what it was adapted from, and gives its place in line', async () => {
    const adaptedFrom = R.find(bundle.assets, (asset) => asset.name === 'maskCardNumber')
    const page = await body(
      candidatePage(context(), {
        submission: submission(),
        tally: tally(14, 3, 0),
        voted: false,
        queue: { place: 1, of: 23 },
        ...(adaptedFrom === undefined ? {} : { adaptedFrom }),
      }),
    )
    expect(page).toContain('Nobody has checked this code yet.')
    expect(page).toContain('href="/a/text/maskCardNumber"')
    expect(page).toContain('1st of 23 waiting')
    expect(page).toContain('2 days ago, through the receta-assets MCP server')
    expect(page).toContain('<code>DE•• •••• 3000</code>')
  })
})

describe('words for numbers and dates', () => {
  it('writes places as ordinals', () => {
    expect(R.map([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111], ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
      '101st',
      '111th',
    ])
  })

  it('writes ages the way a person says them', () => {
    const ago = (days: number): string => age(new Date(NOW.getTime() - days * 24 * 3600 * 1000).toISOString(), NOW)
    expect(R.map([0, 1, 2, 8, 20, 90, 800], ago)).toEqual([
      'today',
      'yesterday',
      '2 days ago',
      'last week',
      '2 weeks ago',
      '3 months ago',
      '2 years ago',
    ])
    expect(age('not a date', NOW)).toBe('today')
  })
})

describe('the search page', () => {
  const parsePort = bundle.assets.find((asset) => asset.name === 'parsePort')

  it('escapes the query everywhere it shows it', async () => {
    const query = '"><script>alert(1)</script>'
    const page = await body(searchPage(context({ path: '/search' }), { query, unreviewed: false, results: [], semantic: true }))
    expect(page).not.toContain('<script>alert(1)')
    expect(page).toContain('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('links a reviewed function to its page and marks a submission unreviewed', async () => {
    if (parsePort === undefined) throw new Error('parsePort is missing from the catalog')
    const page = await body(
      searchPage(context({ path: '/search' }), {
        query: 'port',
        unreviewed: true,
        results: [
          { listing: parsePort, tally: tally(2) },
          { listing: listingOf(submission()), tally: NO_TALLY },
        ],
        semantic: true,
      }),
    )
    expect(page).toContain('href="/a/parse/parsePort"')
    expect(page).toContain('href="/c/abc123"')
    expect(page.split('class="badge unreviewed"').length - 1).toBe(1)
    expect(page).toContain('2 matches')
    expect(page).toContain('name="unreviewed" value="1" checked')
  })

  it('says when words alone ranked it, and what to do when nothing matched', async () => {
    const page = await body(searchPage(context({ path: '/search' }), { query: 'zzz', unreviewed: false, results: [], semantic: false }))
    expect(page).toContain('Ranked by words only for now')
    expect(page).toContain('Nothing matched.')
  })

  it('puts the search on the market home', async () => {
    const page = await body(homePage(context({ path: '/' }), { categories: bundle.categories, candidates: [], popular: [] }))
    expect(page).toContain('action="/search"')
  })
})
