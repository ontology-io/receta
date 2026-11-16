// The registry as people see it, drawn from the "Market · …" frames in
// design/receta-website.pen: the market home, a submission, an asset, a category and the
// whole list. Anyone can submit, so every submitted text is escaped before it is placed;
// summaries, "use when" and "why" then show their `backtick spans` as code.
import * as R from 'remeda'
import type { Person } from './auth'
import { type BundledAsset, type CategoryInfo, keyOf } from './bundle'
import { age, escape, html, icon, ordinal, plural, withCode } from './html'
import type { Submission, Tally } from './registry'
import { SCRIPT, SCRIPT_HASH, stylesheet } from './style'
import type { Listing } from './vectors'

export type PageContext = {
  /** Like `/market`, or empty. */
  readonly basePath: string
  readonly mcpUrl: string
  readonly person: Person | undefined
  /** False until the GitHub OAuth app is configured. */
  readonly votingOpen: boolean
  /** The path of this page, to come back to after signing in. */
  readonly path: string
  /** How many reviewed functions the catalog holds. */
  readonly assetCount: number
  /** When the page is drawn, for "offered 2 days ago". */
  readonly now: Date
}

const SITE = 'https://receta.dev'
const ASSETS_SOURCE = 'https://github.com/ontology-io/receta/tree/main/packages/receta-assets'

/** Only what the page needs: its own styles and fonts, one hashed script, forms to itself. */
export const CONTENT_SECURITY_POLICY = R.join(
  [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "font-src 'self'",
    `script-src '${SCRIPT_HASH}'`,
    "form-action 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ],
  '; ',
)

// ─── Parts ──────────────────────────────────────────────────────────────────────────────

const MARK = {
  token: '<span class="mark token" aria-hidden="true"></span>',
  station: '<span class="mark station" aria-hidden="true"></span>',
  tile: '<span class="mark tile" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
  emptyTile: '<span class="mark tile empty" aria-hidden="true"></span>',
} as const

type Tone = 'ink' | 'paper' | 'paper-2'

const section = (tone: Tone, mark: string, content: string, options: { readonly id?: string; readonly detail?: boolean } = {}): string =>
  `<section class="sec ${tone}${options.detail === true ? ' detail' : ''}"${options.id === undefined ? '' : ` id="${options.id}"`}><div class="wrap">${mark}${content}</div></section>`

const signInHref = (context: PageContext): string =>
  `${context.basePath}/auth/login?return=${encodeURIComponent(context.path)}`

/** `text/` dimmed, then `maskIban` in bold; a link when there is somewhere to go. */
const fnName = (category: string, name: string, href?: string): string => {
  const inner = `<span class="cat">${escape(category)}/</span><b>${escape(name)}</b>`
  return href === undefined ? `<span class="fn">${inner}</span>` : `<a class="fn" href="${href}">${inner}</a>`
}

type BadgeKind = 'unreviewed' | 'reviewed' | 'accepted' | 'declined'

const badge = (kind: BadgeKind): string =>
  `<span class="badge ${kind === 'accepted' ? 'reviewed' : kind}">${kind}</span>`

const counted = (count: number, word: string): string => `<span class="${word}${count > 0 ? ' some' : ''}">${word} ${count}</span>`

/** `14 votes │ agents: worked 3 failed 0`: people's votes first, agents' reports apart. */
export const counts = (tally: Tally): string =>
  `<span class="counts"><span class="votes">${plural(tally.votes, 'vote', 'votes')}</span><span class="rule" aria-hidden="true"></span><span class="agents">agents:</span>${counted(tally.worked, 'worked')}${counted(tally.failed, 'failed')}</span>`

const head = (eyebrow: string, title: string, aside: string): string =>
  `<div class="head"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div><p class="aside">${aside}</p></div>`

const more = (href: string, label: string): string => `<a class="more" href="${href}">${label}${icon('arrowRight', 18)}</a>`

const emptyState = (title: string, body: string, link = ''): string =>
  `<div class="empty-state"><h3>${title}</h3><p>${body}</p>${link}</div>`

const validKey = (key: string): boolean => /^[a-z]+\/\w+$/.test(key)

/** `(input: string) => Result<number, ParsePortError>`, when the catalog knows the types. */
const signatureOf = (inputs: Submission['inputs'] | undefined, output: string | undefined): string =>
  inputs === undefined || output === undefined
    ? ''
    : `(${R.join(
        R.map(inputs, (input) => `${input.name}: ${input.type}`),
        ', ',
      )}) => ${output}`

// ─── Code ───────────────────────────────────────────────────────────────────────────────

const lineKind = (line: string): string => {
  const text = line.trim()
  if (text.startsWith('* // =>') || text.startsWith('// =>')) return ' ex'
  return text.startsWith('//') || text.startsWith('/*') || text.startsWith('*') ? ' doc' : ''
}

/** The whole file, numbered by CSS so copying it copies the code and nothing else. */
const codeBlock = (path: string, source: string, reviewed: boolean): string => {
  const lines = R.pipe(
    source.replace(/\r/g, '').replace(/\n+$/, ''),
    R.split('\n'),
    R.map((line) => `<span class="line${lineKind(line)}">${escape(line)}</span>`),
  )
  return `<div class="code"><div class="code-head"><span class="file"><span>${escape(path)}</span><span class="status${reviewed ? '' : ' unchecked'}">${reviewed ? 'examples run on every change' : 'unreviewed · read all of it'}</span></span><button type="button" class="copy" data-copy="source">${icon('copy', 15)}<span class="label">Copy</span></button></div><pre><code id="source">${R.join(lines, '\n')}</code></pre></div>`
}

// ─── Votes ──────────────────────────────────────────────────────────────────────────────

/** What a person can do about one item: the header and the button always agree. */
export type VoteState = 'closed' | 'sign-in' | 'vote' | 'voted'

export const voteStateOf = (context: PageContext, voted: boolean): VoteState =>
  !context.votingOpen ? 'closed' : context.person === undefined ? 'sign-in' : voted ? 'voted' : 'vote'

const voteForm = (context: PageContext, item: string, on: boolean, button: string): string =>
  `<form method="post" action="${context.basePath}/vote"><input type="hidden" name="item" value="${escape(item)}"><input type="hidden" name="on" value="${on ? '1' : '0'}">${button}</form>`

const voteControl = (context: PageContext, item: string, state: VoteState): string => {
  if (state === 'closed') return `<button type="button" class="btn closed" disabled>${icon('lock', 16)}Voting opens soon</button>`
  if (state === 'sign-in') return `<a class="btn" href="${escape(signInHref(context))}">${icon('github', 16)}Sign in with GitHub to vote</a>`
  if (state === 'voted') {
    return `<p class="you-voted">${icon('check', 16)}You voted for this</p>${voteForm(context, item, false, `<button class="btn">${icon('undo', 16)}Withdraw my vote</button>`)}`
  }
  return voteForm(context, item, true, `<button class="btn primary">${icon('arrowUp', 16)}Vote for it</button>`)
}

const VOTE_HELP: Readonly<Record<VoteState, string>> = {
  closed: 'Agents’ reports are counted already. People’s votes start when sign-in opens.',
  'sign-in': 'Sign in to vote. One vote per GitHub account.',
  vote: 'One vote per GitHub account. The most voted are reviewed first.',
  voted: 'You can withdraw it at any time.',
}

type TallyPanel = {
  readonly item: string
  readonly tally: Tally
  readonly voted: boolean
  /** False once a submission is decided: its votes are closed. */
  readonly votable: boolean
  readonly help?: string
  readonly after?: string
}

const tallyPanel = (context: PageContext, panel: TallyPanel): string => {
  const state = voteStateOf(context, panel.voted)
  const reports = `<p class="reports">${counted(panel.tally.worked, 'worked')}${counted(panel.tally.failed, 'failed')}</p>`
  return html([
    `<aside class="tally" id="tally"><p class="eyebrow">People’s votes</p>`,
    `<div class="big${state === 'closed' ? ' off' : ''}"><span class="n">${panel.tally.votes}</span><span class="unit">${panel.tally.votes === 1 ? 'vote' : 'votes'}</span></div>`,
    panel.votable ? voteControl(context, panel.item, state) : '',
    `<p class="help">${panel.votable ? (state === 'vote' && panel.help !== undefined ? panel.help : VOTE_HELP[state]) : 'Decided. Votes are closed.'}</p>`,
    `<hr><p class="eyebrow">Agents reported</p>${reports}`,
    '<p class="help">Each report is from an agent that used it in someone’s code. Counted apart from votes.</p>',
    panel.after ?? '',
    '</aside>',
  ])
}

// ─── Layout ─────────────────────────────────────────────────────────────────────────────

const NAV: readonly (readonly [string, string])[] = [
  ['Why', `${SITE}/#why`],
  ['Recipes', `${SITE}/#recipes`],
  ['Docs', `${SITE}/docs`],
  ['Market', ''],
  ['GitHub', 'https://github.com/ontology-io/receta'],
  ['Install', `${SITE}/#install`],
]

const navLinks = (context: PageContext): string =>
  html(
    R.map(NAV, ([label, href]) =>
      label === 'Market'
        ? `<li><a href="${context.basePath}/" aria-current="page">Market</a></li>`
        : `<li${label === 'Install' ? ' class="install"' : ''}><a href="${href}">${label}</a></li>`,
    ),
  )

const session = (context: PageContext): string => {
  if (!context.votingOpen) return '<span class="session off">Voting opens soon</span>'
  if (context.person === undefined) {
    return `<span class="session">${icon('github', 16)}<a href="${escape(signInHref(context))}">Sign in with GitHub to vote</a></span>`
  }
  return `<span class="session">${icon('github', 16)}<span><span class="as">Signed in as </span>${escape(context.person.login)}</span><span aria-hidden="true">·</span><form method="post" action="${context.basePath}/auth/logout"><button>Sign out</button></form></span>`
}

const header = (context: PageContext, trail: string): string => {
  const links = navLinks(context)
  return `<header class="top"><nav class="nav wrap" aria-label="Receta"><a class="logo" href="${SITE}/">receta<span class="dot" aria-hidden="true"></span></a><ul class="links">${links}</ul><details class="menu"><summary aria-label="Menu">${icon('menu', 24)}</summary><ul>${links}</ul></details></nav><div class="bar"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a class="root" href="${context.basePath}/">MARKET</a><span class="trail">${trail}</span></nav>${session(context)}</div></div></header>`
}

const footer = (context: PageContext): string =>
  `<footer class="foot"><div class="wrap"><a class="logo" href="${SITE}/">receta<span class="dot" aria-hidden="true"></span></a><span class="pkg">@ontologyio/receta-assets · ${context.assetCount} functions · MIT</span><ul><li><a href="${SITE}/docs">Docs${icon('arrowUpRight', 16)}</a></li><li><a href="${ASSETS_SOURCE}">GitHub${icon('arrowUpRight', 16)}</a></li><li><a href="${context.basePath}/#connect">Connect an agent${icon('arrowRight', 16)}</a></li></ul></div></footer>`

const crumb = (label: string, href?: string): string =>
  `<span aria-hidden="true">/</span>${href === undefined ? `<span>${label}</span>` : `<a href="${href}">${label}</a>`}`

type Page = {
  readonly title: string
  readonly description: string
  readonly trail: string
  readonly body: string
  readonly status?: number
}

const layout = (context: PageContext, page: Page): Response => {
  const font = (file: string): string =>
    `<link rel="preload" href="${context.basePath}/fonts/${file}" as="font" type="font/woff2" crossorigin>`
  return new Response(
    html([
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
      `<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="theme-color" content="#14110e">`,
      font('newsreader-latin-opsz-normal.woff2'),
      font('ibm-plex-mono-latin-400-normal.woff2'),
      `<style>${stylesheet(context.basePath)}</style></head><body>`,
      header(context, page.trail),
      `<main>${page.body}</main>`,
      footer(context),
      `<script>${SCRIPT}</script></body></html>`,
    ]),
    {
      status: page.status ?? 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': CONTENT_SECURITY_POLICY,
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'same-origin',
      },
    },
  )
}

// ─── The market home ────────────────────────────────────────────────────────────────────

const STEPS: readonly (readonly [string, string])[] = [
  ['Search', 'Agents search by meaning, blended with words, before they write a helper. Each result is one file whose comment is its whole manual.'],
  ['Offer', 'When an agent had to write a new function, it can offer it, with your OK. It is listed here at once, marked unreviewed.'],
  ['Vote and report', 'People vote once each, signed in with GitHub. Agents report whether a function worked. The most wanted are reviewed first.'],
]

const intro = (context: PageContext): string =>
  section(
    'ink',
    MARK.token,
    html([
      '<p class="eyebrow">Receta market</p>',
      '<h1 class="display">Functions agents reuse<span class="stop" aria-hidden="true"></span></h1>',
      `<p class="lede">${context.assetCount} reviewed functions built from Receta and Remeda, and what agents and people have offered since. Vote for what you’d use: the Receta team reviews the most wanted first.</p>`,
      '<div class="connect" id="connect"><p class="eyebrow">Connect your agent</p>',
      `<div class="cmd"><span class="prompt" aria-hidden="true">$</span><code id="connect-command">claude mcp add --transport http receta-assets ${escape(context.mcpUrl)}</code><button type="button" class="copy" data-copy="connect-command" aria-label="Copy the command">${icon('copy', 18)}<span class="label">Copy</span></button></div>`,
      '<p class="then">Then ask it for a helper. It searches here before it writes one.</p></div>',
      `<ol class="steps">${html(
        R.map(STEPS, ([title, body], index) => `<li><h3><span class="n">${index + 1}</span>${title}</h3><p>${body}</p></li>`),
      )}</ol>`,
      `<p class="guard">${icon('eyeOff', 22)}An agent sees unreviewed functions only when it asks for them.</p>`,
    ]),
  )

/** People search the way agents do: the same ranking as the MCP tool, meaning and words. */
const searchForm = (context: PageContext, query = '', unreviewed = false): string =>
  html([
    `<form class="search" role="search" method="get" action="${context.basePath}/search">`,
    '<label class="sr" for="search-q">What should the function do?</label>',
    `<div class="field">${icon('search', 20)}<input id="search-q" name="q" type="search" required minlength="2" maxlength="200" value="${escape(query)}" placeholder="What should it do? Like “dedupe events by id, keep the newest”"></div>`,
    '<button type="submit" class="btn primary">Search</button>',
    `<label class="incl"><input type="checkbox" name="unreviewed" value="1"${unreviewed ? ' checked' : ''}>Include unreviewed submissions</label>`,
    '</form>',
  ])

const categoriesSection = (context: PageContext, categories: readonly CategoryInfo[]): string =>
  section(
    'paper',
    MARK.station,
    html([
      head(
        'Browse',
        `${categories.length} categories, ${context.assetCount} functions`,
        'Each one is a single file. Its comment is the whole manual, and its examples run on every change.',
      ),
      searchForm(context),
      '<ul class="index">',
      html(
        R.map(
          categories,
          (category) =>
            `<li><a href="${context.basePath}/category/${escape(category.name)}"><span class="row-top"><span class="name">${escape(category.name)}</span><span class="count">${category.count}${icon('arrowRight', 16)}</span></span><span class="about">${escape(category.about)}</span></a></li>`,
        ),
      ),
      `<li class="all"><a href="${context.basePath}/all"><span class="row-top"><span class="name">Every function, A to Z</span><span class="count">${context.assetCount}${icon('arrowRight', 16)}</span></span><span class="about">One list, with each function’s summary and what it takes and returns.</span></a></li>`,
      '</ul>',
    ]),
    { id: 'categories' },
  )

const adaptedFromLink = (context: PageContext, key: string): string =>
  validKey(key) ? `<a href="${context.basePath}/a/${key}">${escape(key)}</a>` : escape(key)

const offeredItem = (context: PageContext, submission: Submission, tally: Tally): string =>
  html([
    '<li class="item"><div class="main">',
    `<div class="title-line">${fnName(submission.category, submission.name, `${context.basePath}/c/${escape(submission.id)}`)}${badge('unreviewed')}</div>`,
    `<p class="summary">${withCode(submission.summary)}</p>`,
    `<p class="why">Offered because: ${withCode(submission.why)}</p>`,
    `<p class="meta">${submission.adaptedFrom === '' ? 'New' : `Adapted from ${adaptedFromLink(context, submission.adaptedFrom)}`} · offered ${age(submission.createdAt, context.now)}</p>`,
    `</div><div class="side">${counts(tally)}</div></li>`,
  ])

const offeredSection = (context: PageContext, candidates: readonly (readonly [Submission, Tally])[]): string =>
  candidates.length === 0
    ? section(
        'paper-2',
        MARK.emptyTile,
        html([
          head(
            'The registry',
            'Offered, not yet reviewed',
            'Functions agents write and offer, each with a person’s OK, wait here for the Receta team. Most votes first.',
          ),
          emptyState(
            'Nothing waiting for review.',
            'When an agent writes a function the catalog doesn’t have, it can offer it, with your OK. It shows up here at once, marked unreviewed.',
          ),
        ]),
        { id: 'offered' },
      )
    : section(
        'paper-2',
        MARK.tile,
        html([
          head(
            'The registry',
            'Offered, not yet reviewed',
            'Agents wrote these and offered them, each with a person’s OK. Nobody has checked them yet. Most votes first: the Receta team reviews from the top.',
          ),
          `<p class="note">${icon('eyeOff', 16)}Hidden from agents’ search unless an agent asks for unreviewed functions.</p>`,
          `<ul class="list">${html(R.map(candidates, ([submission, tally]) => offeredItem(context, submission, tally)))}</ul>`,
        ]),
        { id: 'offered' },
      )

const wantedSection = (context: PageContext, popular: readonly (readonly [BundledAsset, Tally])[], categoryCount: number): string =>
  section(
    'paper',
    MARK.station,
    html([
      head(
        'The catalog',
        'Most wanted reviewed functions',
        'Ranked by people’s votes. Agents’ reports are counted apart: they say whether a function worked where it was used.',
      ),
      popular.length === 0
        ? emptyState(
            'No votes yet.',
            'The ranking starts with the first vote. Until then, browse by category.',
            more('#categories', `Browse the ${categoryCount} categories`),
          )
        : html([
            `<ol class="list ranked">${html(
              R.map(
                popular,
                ([asset, tally], index) =>
                  `<li class="item"><span class="rank">${index + 1}</span><div class="main">${fnName(asset.category, asset.name, `${context.basePath}/a/${keyOf(asset)}`)}<p class="summary">${withCode(asset.summary)}</p></div><div class="side">${counts(tally)}</div></li>`,
              ),
            )}</ol>`,
            more(`${context.basePath}/all`, `Browse all ${context.assetCount}`),
          ]),
    ]),
    { id: 'wanted' },
  )

export type HomeData = {
  readonly categories: readonly CategoryInfo[]
  readonly candidates: readonly (readonly [Submission, Tally])[]
  readonly popular: readonly (readonly [BundledAsset, Tally])[]
}

export const homePage = (context: PageContext, data: HomeData): Response =>
  layout(context, {
    title: 'Receta market: functions agents reuse',
    description: `${context.assetCount} reviewed TypeScript functions built from Receta and Remeda, that AI coding agents search over MCP before they write a helper.`,
    trail: `<span>${context.assetCount} functions · ${data.categories.length} categories</span>`,
    body: html([
      intro(context),
      categoriesSection(context, data.categories),
      offeredSection(context, data.candidates),
      wantedSection(context, data.popular, data.categories.length),
    ]),
  })

// ─── A submission ───────────────────────────────────────────────────────────────────────

const fact = (label: string, value: string): string => `<div class="fact"><dt>${label}</dt><dd>${value}</dd></div>`

const takes = (inputs: Submission['inputs'] | undefined): string =>
  inputs === undefined || inputs.length === 0
    ? ''
    : fact(
        'Takes',
        html(
          R.map(
            inputs,
            (input) => `<div class="mono">${escape(input.name)}<span class="soft">: ${escape(input.type)}</span></div>`,
          ),
        ),
      )

const returns = (output: string | undefined): string =>
  output === undefined || output === '' ? '' : fact('Returns', `<span class="mono">${escape(output)}</span>`)

export type CandidateData = {
  readonly submission: Submission
  readonly tally: Tally
  readonly voted: boolean
  /** Its place among the unreviewed, most voted first, while it waits. */
  readonly queue?: { readonly place: number; readonly of: number }
  /** The reviewed asset it varies, when that is in the catalog. */
  readonly adaptedFrom?: BundledAsset
}

const WARNING =
  '<div class="warning" role="note">' +
  `${icon('alert', 24)}<div><h2>Nobody has checked this code yet.</h2><p>An agent wrote it and offered it, with a person’s OK. The Receta team hasn’t reviewed it, and agents won’t find it unless they ask for unreviewed functions. Read all of it before you use it.</p></div></div>`

export const candidatePage = (context: PageContext, data: CandidateData): Response => {
  const { submission } = data
  const waiting = submission.status === 'candidate'
  const kind: BadgeKind = waiting ? 'unreviewed' : submission.status
  const adapted =
    submission.adaptedFrom === ''
      ? ''
      : fact(
          'Adapted from',
          data.adaptedFrom === undefined
            ? `<span class="mono">${escape(submission.adaptedFrom)}</span>`
            : `<a class="link" href="${context.basePath}/a/${keyOf(data.adaptedFrom)}"><span class="key">${escape(keyOf(data.adaptedFrom))}</span>${badge('reviewed')}${icon('arrowRight', 16)}</a>`,
        )
  const place =
    data.queue === undefined
      ? ''
      : `<hr><p class="eyebrow">In line for review</p><p class="place">${ordinal(data.queue.place)} of ${data.queue.of} waiting</p>`
  return layout(context, {
    title: `${submission.category}/${submission.name}, offered · Receta market`,
    description: submission.summary,
    trail: html([
      crumb('offered', `${context.basePath}/#offered`),
      crumb(`${escape(submission.category)}/${escape(submission.name)}`),
    ]),
    body: section(
      'paper',
      MARK.tile,
      html([
        `<a class="back" href="${context.basePath}/#offered">${icon('arrowLeft', 14)}Offered, not yet reviewed</a>`,
        `<div class="title-row"><h1 class="fn"><span class="cat">${escape(submission.category)}/</span><b>${escape(submission.name)}</b></h1>${badge(kind)}</div>`,
        `<p class="summary-lg">${withCode(submission.summary)}</p>`,
        '<div class="cols"><div class="main">',
        waiting ? WARNING : '',
        submission.decisionNote === '' ? '' : `<p class="review-note">Review note: ${withCode(submission.decisionNote)}</p>`,
        '<dl class="facts">',
        fact('Offered because', withCode(submission.why)),
        adapted,
        takes(submission.inputs),
        returns(submission.output),
        fact('Offered', `<span class="soft">${age(submission.createdAt, context.now)}, through the receta-assets MCP server</span>`),
        '</dl></div>',
        tallyPanel(context, {
          item: `candidate/${submission.id}`,
          tally: data.tally,
          voted: data.voted,
          votable: waiting,
          after: waiting ? place : '',
        }),
        '</div>',
        codeBlock(`src/${submission.category}/${submission.name}.ts`, submission.code, false),
      ]),
      { detail: true },
    ),
  })
}

// ─── An asset ───────────────────────────────────────────────────────────────────────────

export type AssetData = {
  readonly asset: BundledAsset
  readonly tally: Tally
  readonly voted: boolean
  readonly category: CategoryInfo | undefined
  /** Its nearest neighbours in its category. */
  readonly near: readonly BundledAsset[]
}

const chip = (part: string): string => `<span class="chip${part.startsWith('R.') ? ' remeda' : ''}">${escape(part)}</span>`

export const assetPage = (context: PageContext, data: AssetData): Response => {
  const { asset } = data
  const key = keyOf(asset)
  const near =
    data.near.length === 0
      ? ''
      : `<hr><p class="eyebrow">Near it</p><ul class="near">${html(
          R.map(
            data.near,
            (other) =>
              `<li><a href="${context.basePath}/a/${keyOf(other)}">${escape(keyOf(other))}</a><p>${withCode(other.summary)}</p></li>`,
          ),
        )}</ul>`
  return layout(context, {
    title: `${key} · Receta market`,
    description: asset.summary,
    trail: html([crumb(escape(asset.category), `${context.basePath}/category/${escape(asset.category)}`), crumb(escape(asset.name))]),
    body: section(
      'paper',
      MARK.token,
      html([
        `<a class="back" href="${context.basePath}/category/${escape(asset.category)}">${icon('arrowLeft', 14)}${escape(asset.category)}${data.category === undefined ? '' : ` · ${data.category.count} functions`}</a>`,
        `<div class="title-row"><h1 class="fn"><span class="cat">${escape(asset.category)}/</span><b>${escape(asset.name)}</b></h1>${badge('reviewed')}</div>`,
        `<p class="summary-lg">${withCode(asset.summary)}</p>`,
        '<div class="cols"><div class="main">',
        asset.useWhen === '' ? '' : `<div class="use-when"><p class="eyebrow">Use when</p><p class="text">${withCode(R.capitalize(asset.useWhen))}</p></div>`,
        '<dl class="facts">',
        takes(asset.inputs),
        returns(asset.output),
        fact(
          'Import',
          `<div class="import"><code id="import">${escape(asset.import)}</code><button type="button" class="copy" data-copy="import" aria-label="Copy the import">${icon('copy', 16)}</button></div>`,
        ),
        asset.composes.length === 0 ? '' : fact('Built from', `<div class="chips">${html(R.map(asset.composes, chip))}</div>`),
        asset.tags.length === 0 ? '' : fact('Tags', `<span class="mono soft tags">${escape(R.join(asset.tags, ' · '))}</span>`),
        '</dl></div>',
        tallyPanel(context, {
          item: key,
          tally: data.tally,
          voted: data.voted,
          votable: true,
          help: 'One vote per GitHub account. Votes tell the team what to keep sharp.',
          after: near,
        }),
        '</div>',
        codeBlock(asset.path, asset.source, true),
      ]),
      { detail: true },
    ),
  })
}

// ─── A category, and every function ─────────────────────────────────────────────────────

const assetItem = (context: PageContext, asset: BundledAsset, tally?: Tally): string => {
  const signature = signatureOf(asset.inputs, asset.output)
  return html([
    '<li class="item"><div class="main">',
    fnName(asset.category, asset.name, `${context.basePath}/a/${keyOf(asset)}`),
    `<p class="summary">${withCode(asset.summary)}</p>`,
    signature === '' ? '' : `<p class="sig">${escape(signature)}</p>`,
    '</div>',
    tally === undefined ? '' : `<div class="side">${counts(tally)}</div>`,
    '</li>',
  ])
}

export type CategoryData = {
  readonly category: CategoryInfo
  readonly assets: readonly (readonly [BundledAsset, Tally])[]
}

export const categoryPage = (context: PageContext, data: CategoryData): Response =>
  layout(context, {
    title: `${data.category.name} · Receta market`,
    description: data.category.about,
    trail: crumb(escape(data.category.name)),
    body: section(
      'paper',
      MARK.station,
      html([
        `<a class="back" href="${context.basePath}/#categories">${icon('arrowLeft', 14)}All categories</a>`,
        `<div class="title-row"><h1 class="fn"><b>${escape(data.category.name)}</b></h1><span class="count-of">${plural(data.category.count, 'function', 'functions')}</span></div>`,
        `<p class="summary-lg">${escape(data.category.about)}</p>`,
        `<ul class="list plain">${html(R.map(data.assets, ([asset, tally]) => assetItem(context, asset, tally)))}</ul>`,
      ]),
      { detail: true },
    ),
  })

export const allPage = (context: PageContext, assets: readonly BundledAsset[]): Response =>
  layout(context, {
    title: 'Every function, A to Z · Receta market',
    description: `All ${assets.length} reviewed functions in receta-assets, with what each takes and returns.`,
    trail: crumb('every function'),
    body: section(
      'paper',
      MARK.station,
      html([
        `<a class="back" href="${context.basePath}/#categories">${icon('arrowLeft', 14)}All categories</a>`,
        `<div class="title-row"><h1 class="fn"><b>Every function, A to Z</b></h1><span class="count-of">${assets.length}</span></div>`,
        '<p class="summary-lg">One list, with each function’s summary and what it takes and returns.</p>',
        `<ul class="list plain">${html(
          R.pipe(
            assets,
            R.sortBy((asset) => asset.name.toLowerCase()),
            R.map((asset) => assetItem(context, asset)),
          ),
        )}</ul>`,
      ]),
      { detail: true },
    ),
  })

// ─── Search ─────────────────────────────────────────────────────────────────────────────

export type SearchResult = { readonly listing: Listing; readonly tally: Tally }

export type SearchData = {
  readonly query: string
  readonly unreviewed: boolean
  readonly results: readonly SearchResult[]
  /** False when only words ranked the results: the index was down or the address searched a lot. */
  readonly semantic: boolean
}

const resultItem = (context: PageContext, { listing, tally }: SearchResult): string => {
  const signature = signatureOf(listing.inputs, listing.output)
  const href =
    listing.candidateId === undefined
      ? `${context.basePath}/a/${keyOf(listing)}`
      : `${context.basePath}/c/${escape(listing.candidateId)}`
  return html([
    '<li class="item"><div class="main">',
    `<div class="title-line">${fnName(listing.category, listing.name, href)}${listing.candidateId === undefined ? '' : badge('unreviewed')}</div>`,
    `<p class="summary">${withCode(listing.summary)}</p>`,
    signature === '' ? '' : `<p class="sig">${escape(signature)}</p>`,
    `</div><div class="side">${counts(tally)}</div></li>`,
  ])
}

export const searchPage = (context: PageContext, data: SearchData): Response =>
  layout(context, {
    title: `${data.query} · Search · Receta market`,
    description: `Functions in the Receta market for: ${data.query}`,
    trail: crumb('search'),
    body: section(
      'paper',
      MARK.station,
      html([
        `<a class="back" href="${context.basePath}/#categories">${icon('arrowLeft', 14)}All categories</a>`,
        `<div class="title-row"><h1 class="fn"><b>Search</b></h1><span class="count-of">${plural(data.results.length, 'match', 'matches')}</span></div>`,
        searchForm(context, data.query, data.unreviewed),
        data.semantic ? '' : '<p class="note">Ranked by words only for now. Try again in a minute for matches by meaning.</p>',
        data.results.length === 0
          ? emptyState('Nothing matched.', 'Try other words, or browse the categories.', more(`${context.basePath}/#categories`, 'Browse the categories'))
          : `<ul class="list plain">${html(R.map(data.results, (result) => resultItem(context, result)))}</ul>`,
      ]),
      { detail: true },
    ),
  })

export const notFoundPage = (context: PageContext): Response =>
  layout(context, {
    title: 'Not found · Receta market',
    description: 'Nothing lives at this address.',
    trail: crumb('not found'),
    status: 404,
    body: section(
      'paper',
      MARK.station,
      html([
        '<p class="eyebrow">Not found</p>',
        '<h2>Nothing lives at this address.</h2>',
        more(`${context.basePath}/`, 'Back to the market'),
      ]),
      { detail: true },
    ),
  })
