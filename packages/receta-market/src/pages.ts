// The registry as people see it: what was offered, what is popular, and a vote button.
// Every submitted text is escaped, since anyone can submit.
import * as R from 'remeda'
import type { Person } from './auth'
import { type BundledAsset, keyOf } from './bundle'
import type { Submission, Tally } from './registry'

export type PageContext = {
  /** Like `/market`, or empty. */
  readonly basePath: string
  readonly mcpUrl: string
  readonly person: Person | undefined
  /** False until the GitHub OAuth app is configured. */
  readonly votingOpen: boolean
  /** The path of this page, to come back to after signing in. */
  readonly path: string
}

const escape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const STYLE = `
:root { --bg: #fbfaf7; --fg: #1d1c1a; --muted: #6b6760; --line: #e3e0d8; --accent: #b4532a; --warn: #8a5a00; --warn-bg: #fff4d6; --code: #f2f0ea; }
@media (prefers-color-scheme: dark) { :root { --bg: #171614; --fg: #ecebe7; --muted: #a29d94; --line: #2e2c28; --accent: #e08a5f; --warn: #f2c66d; --warn-bg: #3a2f14; --code: #211f1c; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.55 ui-sans-serif, system-ui, sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 32px 16px 64px; }
a { color: var(--accent); }
h1 { font-size: 1.6rem; margin: 0 0 4px; } h2 { font-size: 1.15rem; margin: 32px 0 8px; }
.muted { color: var(--muted); } .row { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; }
ul.items { list-style: none; padding: 0; margin: 0; } ul.items li { padding: 10px 0; border-bottom: 1px solid var(--line); }
.badge { font-size: .75rem; padding: 2px 8px; border-radius: 99px; border: 1px solid var(--line); color: var(--muted); }
.unreviewed { background: var(--warn-bg); color: var(--warn); border-color: transparent; }
pre { background: var(--code); padding: 14px; border-radius: 8px; overflow-x: auto; font: 13px/1.5 ui-monospace, monospace; }
code { font: 13px ui-monospace, monospace; }
button { font: inherit; padding: 6px 14px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--fg); cursor: pointer; }
.counts { font-variant-numeric: tabular-nums; }
header.top { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
`

const layout = (context: PageContext, title: string, body: string): Response =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title><style>${STYLE}</style></head><body><main>
<header class="top"><a href="${context.basePath}/">receta-assets registry</a><span class="muted">${
      context.person === undefined
        ? context.votingOpen
          ? `<a href="${context.basePath}/auth/login?return=${encodeURIComponent(context.path)}">Sign in with GitHub to vote</a>`
          : 'Voting opens soon'
        : `Signed in as ${escape(context.person.login)} · <form method="post" action="${context.basePath}/auth/logout" style="display:inline"><button>Sign out</button></form>`
    }</span></header>
${body}</main></body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'" } },
  )

const counts = (tally: Tally): string =>
  `<span class="counts muted">${tally.votes} ${tally.votes === 1 ? 'vote' : 'votes'} · agents: worked ${tally.worked}, failed ${tally.failed}</span>`

const voteForm = (context: PageContext, item: string, voted: boolean): string =>
  context.person === undefined
    ? ''
    : `<form method="post" action="${context.basePath}/vote"><input type="hidden" name="item" value="${escape(item)}"><input type="hidden" name="on" value="${voted ? '0' : '1'}"><button>${voted ? 'Withdraw my vote' : 'Vote for it'}</button></form>`

export const homePage = (
  context: PageContext,
  candidates: readonly (readonly [Submission, Tally])[],
  popular: readonly (readonly [BundledAsset, Tally])[],
  assetCount: number,
): Response =>
  layout(
    context,
    'receta-assets registry',
    `<h1>Functions agents reuse</h1>
<p class="muted">${assetCount} reviewed functions built from Receta and Remeda, and what agents and people have offered since. Vote for what you'd use; the Receta team reviews the most wanted first.</p>
<p>Connect an agent: <code>claude mcp add --transport http receta-assets ${escape(context.mcpUrl)}</code></p>
<h2>Offered, not yet reviewed</h2>
${
  candidates.length === 0
    ? '<p class="muted">Nothing waiting.</p>'
    : `<ul class="items">${R.join(
        R.map(
          candidates,
          ([submission, tally]) =>
            `<li><div class="row"><a href="${context.basePath}/c/${escape(submission.id)}">${escape(submission.category)}/${escape(submission.name)}</a><span class="badge unreviewed">unreviewed</span>${counts(tally)}</div><div class="muted">${escape(submission.summary)}</div></li>`,
        ),
        '',
      )}</ul>`
}
<h2>Most wanted reviewed functions</h2>
${
  popular.length === 0
    ? '<p class="muted">No votes yet.</p>'
    : `<ul class="items">${R.join(
        R.map(
          popular,
          ([asset, tally]) =>
            `<li><div class="row"><a href="${context.basePath}/a/${escape(keyOf(asset))}">${escape(keyOf(asset))}</a>${counts(tally)}</div><div class="muted">${escape(asset.summary)}</div></li>`,
        ),
        '',
      )}</ul>`
}`,
  )

export const candidatePage = (context: PageContext, submission: Submission, tally: Tally, voted: boolean): Response =>
  layout(
    context,
    `${submission.category}/${submission.name}`,
    `<div class="row"><h1>${escape(submission.category)}/${escape(submission.name)}</h1><span class="badge ${submission.status === 'candidate' ? 'unreviewed' : ''}">${submission.status === 'candidate' ? 'unreviewed' : escape(submission.status)}</span></div>
<p>${escape(submission.summary)}</p>
<p class="muted">Offered because: ${escape(submission.why)}${submission.adaptedFrom === '' ? '' : ` · Adapted from <a href="${context.basePath}/a/${escape(submission.adaptedFrom)}">${escape(submission.adaptedFrom)}</a>`}</p>
${submission.decisionNote === '' ? '' : `<p class="muted">Review note: ${escape(submission.decisionNote)}</p>`}
<div class="row">${counts(tally)}${submission.status === 'candidate' ? voteForm(context, `candidate/${submission.id}`, voted) : ''}</div>
${submission.status === 'candidate' ? '<p class="badge unreviewed">Nobody has checked this code yet. Read all of it before you use it.</p>' : ''}
<pre>${escape(submission.code)}</pre>`,
  )

export const assetPage = (context: PageContext, asset: BundledAsset, tally: Tally, voted: boolean): Response =>
  layout(
    context,
    keyOf(asset),
    `<h1>${escape(keyOf(asset))}</h1>
<p>${escape(asset.summary)}</p>
<p class="muted">Use when: ${escape(asset.useWhen)}</p>
<div class="row">${counts(tally)}${voteForm(context, keyOf(asset), voted)}</div>
<pre>${escape(asset.source)}</pre>`,
  )

export const notFoundPage = (context: PageContext): Response => {
  const page = layout(context, 'Not found', '<h1>Not found</h1><p class="muted">Nothing lives at this address.</p>')
  return new Response(page.body, { status: 404, headers: page.headers })
}
