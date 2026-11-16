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
                                  what it does · what it takes · what it returns
```

## Tools

| Tool | What it answers |
| --- | --- |
| `search_assets` | the best assets for a job, optionally by input and output type or within a category |
| `get_asset` | an asset's whole file, ready to copy |
| `browse` | the categories, or every asset in one |
| `related_assets` | an asset's nearest neighbours, its variants and siblings |
| `authoring_guide` | the rules a new function follows |

Search blends vector similarity (60%) with word ranking (40%), so meaning finds an asset
whose summary uses other words, and an exact name or type still wins. If the vector index
can't be reached, the words answer alone and the result says so.

## Connect

```bash
claude mcp add --transport http receta-assets <deployment>/mcp
```

## Work on it

```bash
bun run test        # bundle the catalog, then drive every tool through an MCP client
bun run typecheck
bun run dev         # wrangler dev; AI and Vectorize are remote bindings
bun run deploy      # bundle and deploy
bun scripts/smoke.ts <deployment>/mcp   # call the live server as an agent would
```

After a catalog change, deploy, then rebuild the vectors:

```bash
curl -X POST <deployment>/admin/reindex -H "Authorization: Bearer $(cat ~/.config/receta-market/admin-token)"
```

The Vectorize index `receta-assets` has 768 dimensions and cosine distance, matching
`@cf/baai/bge-base-en-v1.5`, with metadata indexes on `field`, `category` and `status`.
Vectorize applies writes in the background, so a fresh index answers from words for a
minute or two.
