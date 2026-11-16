# receta-market

The receta-assets marketplace: an MCP server on Cloudflare where agents search the catalog
before they write a helper, read an asset's file, and walk to its variants. It serves the
same 390 checked functions as [`packages/receta-assets`](../receta-assets).

```text
 agent ── MCP ──▶ Worker (/mcp) ──┬─▶ words: BM25 over names, tags, summaries
                                  └─▶ Workers AI embeds the query
                                          │
                                          ▼
                                  Vectorize: each asset three times,
                                  what it does (its gist) · takes · returns
```

## Tools

| Tool | What it answers |
| --- | --- |
| `search_assets` | the best assets for a job, optionally by input and output type or within a category |
| `get_asset` | an asset's whole file, ready to copy |
| `browse` | the categories, or every asset in one |
| `related_assets` | an asset's nearest neighbours, its variants and siblings |
| `authoring_guide` | the rules a new function follows |

Search blends vector similarity (75%) with word ranking (25%), so meaning finds an asset
whose summary uses other words, and an exact name or type still wins. If the vector index
can't be reached, the words answer alone and the result says so.

Each result shows its two parts, like `score 0.94: meaning 0.90, words 1.00`, so an agent
can tell a match by meaning from one by shared words.

The blend and what gets embedded were chosen by measurement. `scripts/eval.ts` holds 47
jobs phrased the way an agent would, mostly in words the assets' own summaries don't use,
each with the assets that count as right:

| Ranking | Right asset first | In the top 3 |
| --- | --- | --- |
| words only | 37 | 42 |
| vectors of the full "Use when" text, blended | 39 | 44 |
| vectors of the gist (name, summary, tags), with bge's query instruction, blended | 42 | 46 |

The full "Use when" text spends most of its words on mechanics like error codes, which
pulls a short query away from the asset it wants. Rerun the eval after changing the
search or the embedded texts.

## Connect

It lives at https://market.receta.dev: MCP at `/mcp`, and pages for people at `/` (the
market), `/c/<id>` (a submission), `/a/<category>/<name>` (an asset), `/category/<name>`
and `/all`. The pages follow the "Market · …" frames in `design/receta-website.pen`; their
fonts are copied from @fontsource into `public/fonts` by `scripts/bundle.ts` and served as
static assets, so no visitor fetches anything from Google. Installing the receta-skills
plugin connects the MCP server, through the plugin's `.mcp.json`. By hand:

```bash
claude mcp add --transport http receta-assets https://market.receta.dev/mcp
```

The plugin sends `X-Receta-Share` from the person's `RECETA_ASSETS_SHARE`, and the server
refuses `submit_asset` when it says `off`.

## Work on it

```bash
bun run test        # bundle the catalog, then drive every tool through an MCP client
bun run typecheck
bun run dev         # wrangler dev; AI and Vectorize are remote bindings
bun run deploy      # bundle and deploy
bun scripts/smoke.ts https://market.receta.dev/mcp   # call the live server as an agent would
bun scripts/ask.ts https://market.receta.dev/mcp search_assets '{"job":"…"}'   # one tool, whole answer
RECETA_MARKET_URL=https://market.receta.dev bun scripts/eval.ts   # measure search on 47 jobs
```

`/admin/reindex` and `/admin/explain` (the raw scores the eval blends) take the admin
token as a bearer token. It lives in `~/.config/receta-market/admin-token` and in the
Worker's `ADMIN_TOKEN` secret.

After a catalog change, deploy, then rebuild the vectors:

```bash
curl -X POST <deployment>/admin/reindex -H "Authorization: Bearer $(cat ~/.config/receta-market/admin-token)"
```

The Vectorize index `receta-assets` has 768 dimensions and cosine distance, matching
`@cf/baai/bge-base-en-v1.5`, with metadata indexes on `field`, `category` and `status`.
Vectorize applies writes in the background, so a fresh index answers from words for a
minute or two.
