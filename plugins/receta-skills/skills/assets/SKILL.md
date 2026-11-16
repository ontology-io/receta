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

## The script

Everything goes through one script in this skill's folder. Use the base directory shown when
this skill loaded in place of `<skill>`. It runs with `bun`, or with
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
asset is built from. Run two or three phrasings when the first one is thin. Then read the
summaries and "use when" lines of the top five, and judge by meaning, not by the score.
Read the file of each real contender with `show <name>`, since the comment is the contract.

## 2. Decide

| What you found | What to do |
| --- | --- |
| An asset does the job | Copy it as it is, comment included. If the project installs `@ontologyio/receta-assets`, import it instead, as its catalog `import` line shows. |
| One is close: it differs in one policy, like which duplicate wins or Option against Result | Adapt it into a variant. Change only what differs, name it by what differs (`dedupeByKeepFirst` → `dedupeByKeepNewest`), keep its examples true, and add `@see <original> - receta-assets <category>/<original>, adapted from`. |
| Nothing is close | Write a new function to the asset rules (see below). |

Don't change a copied asset quietly. If its behavior changes, it's a variant and gets a new
name, so the comment and the name keep telling the truth.

## 3. Write a new one to the asset rules

`guide` prints the full rules. In short:

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

## 4. Offer it back

When you wrote a new function or a variant (not a plain copy), offer it to the Receta team.
The catalog grows from the functions agents had to write.

```bash
bun <skill>/scripts/assets.ts share src/lib/maskIban.ts --category text \
  --why "Payout settings show a saved IBAN without exposing it." --from text/maskCardNumber
```

Without `--send`, this sends nothing. It checks the file against the asset rules, finds the
closest assets in the catalog, flags text that looks project-specific (emails, URLs, paths,
keys), and prints the issue it would open on ontology-io/receta. Then:

1. Make the file generic first. Rename domain words that only make sense in this project,
   and remove business data, internal names and anything flagged.
2. Show the person the exact title and body, say it goes to a public GitHub issue, and ask.
3. Only with their yes in this conversation, run the same command with `--send`. It uses the
   person's `gh` login and prints the issue's URL.

If they say no, don't ask again for that function. If `share` says sharing is off, say
nothing about sharing at all.

## Opting out

Sharing is on unless someone turns it off. Either one stops `share` before it prepares
anything:

- one person, everywhere: `RECETA_ASSETS_SHARE=off` in their shell profile
- a whole project: `"receta": { "shareAssets": false }` in its `package.json` (any
  `package.json` from the file's folder up to the root counts)

A person can also just say "don't share" in the conversation. Treat that as an opt-out for
the rest of the session.

## What happens next

The Receta team reads each `asset-candidate` issue with `bun scripts/intake.ts <issue>` in
`packages/receta-assets`. That places the file in its category, runs the full asset check
(shape, lint, types and every example claim), and lists the nearest assets. An accepted
candidate ships in the next receta-assets release and turns up in everyone's search.
