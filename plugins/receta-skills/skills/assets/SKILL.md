---
name: assets
description: >-
  Search the receta-assets catalog before writing a helper, utility or small function in a
  TypeScript project, then copy the asset that fits, adapt the closest one, or write a new one
  to the asset rules and offer it back to the Receta team. Use it whenever you are about to
  write a function that parses, validates, retries, caches, formats, masks, slugifies, dedupes,
  groups, sorts, diffs, paginates, merges, redacts or reshapes data, even when nobody mentions
  assets. Also use it when the user says "is there a function for", "find a receta asset",
  "reuse a recipe", "share this function with receta", or asks whether something already exists.
tags:
  - reuse
  - assets
  - catalog
  - search
  - utilities
  - sharing
---

# Receta assets

receta-assets is a catalog of several hundred small functions built from Receta and Remeda.
Each one is a single file. The comment above the function is its whole manual: what it does,
when to use it, a diagram when the behavior isn't obvious, and examples that are run on every
check, so the comment is true. Every helper a project writes from scratch is one the catalog
may already have, tested. Every new one is one the next project could reuse.

```text
 about to write a helper
          │
          ▼
   ┌─────────────┐  fits     ╭───────────────────╮
   │   search    ├──────────▶│ copy it unchanged │
   └──────┬──────┘           ╰───────────────────╯
          │ close            ╭───────────────────╮
          ├─────────────────▶│ adapt a variant   ├──┐
          │ nothing          ╰───────────────────╯  │ new code
          ▼                                         ▼
   ╭───────────────────╮  new code  ┌───────────────────────┐
   │  write a new one  ├───────────▶│  offer it to Receta,  │
   ╰───────────────────╯            │  unless opted out     │
                                    └───────────────────────┘
```

## The marketplace, or the script

When the `receta-assets` MCP server is connected, use its tools: `search_assets`,
`get_asset`, `browse`, `related_assets` and `authoring_guide` to find, and `report_use` and
`submit_asset` to give back. Its search understands
meaning as well as words, so "keep the newest" also finds an asset whose summary says "the
one that sorts first". Give it the job in words, and the input and output types when you
know them. `related_assets` lists an asset's variants, which is how you find the closest
one to adapt. The steps below hold either way; only the commands differ.

Without the server, everything goes through one script in this skill's folder. Use the base
directory shown when this skill loaded in place of `<skill>`. It runs with `bun`, or with
`node --experimental-strip-types` on Node 22.6 and later.

```bash
bun <skill>/scripts/assets.ts search <words that describe the job>
bun <skill>/scripts/assets.ts show <name>
bun <skill>/scripts/assets.ts guide
bun <skill>/scripts/assets.ts share <file> --category <c> --why "<the job>" [--from <c/name>]
```

It finds the catalog in this order: `RECETA_ASSETS_CATALOG` or `--catalog`, then
`node_modules/@ontologyio/receta-assets`, then a `packages/receta-assets` checkout above the
current folder, then `main` on GitHub, cached for a day. `where` prints which one it used.

## 1. Search before writing

Describe the job, not the code: what goes in, what comes out, and the policy that matters.

```bash
bun <skill>/scripts/assets.ts search parse port number from env string
bun <skill>/scripts/assets.ts search dedupe users by email keep the newest
bun <skill>/scripts/assets.ts search retry a flaky call with a time limit per attempt
```

The search matches words, stems, tags (which hold synonyms) and the Receta functions an
asset is built from, and prints what each asset takes and returns. Run two or three
phrasings, since one wording can rank the right asset below others: a "keep the newest"
asset may only say "best" in its summary. Read the summaries and "use when" lines of the
top results, and judge by meaning, not by the score. Then read each real contender's file
with `show <name>`, since the comment is the contract. An asset that takes a comparator or
a predicate often covers a policy you were about to write by hand.

## 2. Decide

| What you found | What to do |
| --- | --- |
| An asset does the job, maybe given the right comparator or options | Copy it as it is, comment included. If the project installs `@ontologyio/receta-assets`, import it instead: `show` prints the import line. |
| One is close: it differs in one policy, like which characters it keeps or Option against Result | Adapt it into a variant. Change only what differs, name it by what differs (`maskCardNumber` → `maskIban`), keep its examples true, and add `@see <original> - receta-assets <category>/<original>, adapted from`. |
| Nothing is close | Write a new function to the asset rules (see below). |

A copied file imports `remeda` and `@ontologyio/receta`. `show` says when the project's
`package.json` lacks them. Ask the person before adding a dependency.

Don't change a copied asset quietly. If its behavior changes, it's a variant and gets a new
name, so the comment and the name keep telling the truth.

## 3. Write a new one to the asset rules

`guide` prints the full rules. They are written for the catalog's own repository, so in a
project only the rules for the function and its comment apply. In short:

- One exported function per file, the file named after the function, in the project's helper
  folder (`src/lib`, `src/utils`, or whatever the project already uses).
- Imports only from `remeda` and `@ontologyio/receta/*`, so the file works on its own.
- Receta first: `Result` for what can fail, `Option` for what may be missing, `Validation`
  for reporting every problem, `R.pipe` instead of loops and method chains, `R.purry` when it
  takes data plus settings.
- The comment: a summary under 140 characters, a `Use when:` paragraph, a diagram in a
  ` ```text ` fence only when the behavior has branches or the data changes shape, an
  `@example` with at least two `// => value` claims (the usual case and an edge or failure),
  and `@tags` with the words someone would search for.
- When the project has a test runner, turn the example's claims into a test.

## 4. Report how it worked

After you used an asset in the project and saw whether it did the job, call the marketplace's
`report_use` with its name and `worked: true` or `false`. Reports are counted apart from
people's votes and lift what works in everyone's search. Skip this without the server.

## 5. Offer it back

When you wrote a new function or a variant, offer it to the Receta team. The catalog grows
from the functions agents had to write. A plain copy is not a candidate, and neither is
project code that calls assets to wire them into the project: both ways of offering turn
them away. If a closest asset already does the job, use it and offer nothing.

1. Make the file generic first. The pattern checks can't see domain words, so read the file
   for them yourself: rename words that only make sense in this project (`payout`,
   `webhook`, an internal prefix like `evt_`), and remove business data, internal names,
   URLs, paths and keys.
2. Show the person the exact file, say it becomes public at once, and ask.
3. Only with their yes in this conversation, send it.

With the marketplace, sending is `submit_asset` with the file, its category, why it was
needed, `adapted_from` for a variant, and `person_agreed: true`. The server sees the
person's `RECETA_ASSETS_SHARE` but not the project, so first check the project's
`package.json` files for `"receta": { "shareAssets": false }` and offer nothing if one says so. It is listed at once as
unreviewed in the public registry, where people vote and the Receta team reviews the most
wanted first. The server checks the file's shape and refuses copies, project code, taken
names and text that looks private.

Without the server, the script opens a GitHub issue instead:

```bash
bun <skill>/scripts/assets.ts share src/lib/maskIban.ts --category text \
  --why "Payout settings show a saved IBAN without exposing it." --from text/maskCardNumber
```

Without `--send` it sends nothing: it checks the shape, lists the closest assets, flags
private-looking text and prints the issue. Show that to the person, and only with their yes
run it again with `--send`, which uses their `gh` login.

If they say no, don't ask again for that function. If sharing is off, say nothing about
sharing at all.

## Opting out

Sharing is on unless someone turns it off. Either one stops the script's `share` before it
prepares anything, and the plugin passes the first to the marketplace, which then refuses
`submit_asset`:

- one person, everywhere: `RECETA_ASSETS_SHARE=off` in their shell profile
- a whole project: `"receta": { "shareAssets": false }` in its `package.json` (any
  `package.json` from the file's folder up to the root counts)

A person can also just say "don't share" in the conversation. Treat that as an opt-out for
the rest of the session.

## What happens next

The Receta team reviews submissions with `bun scripts/intake.ts --market <id>` (or
`<issue>` for one sent as an issue) in `packages/receta-assets`. That places the file in its
category, runs the full asset check (shape, lint, types and every example claim), and lists
the nearest assets. An accepted function ships in the next receta-assets release and turns
up in everyone's search as reviewed.
