# Receta assets

Ready-made functions for agents to pick up instead of writing them again. Each one is a
single file holding one function built from [Receta](../receta) and Remeda, with a comment
that says when to use it and examples that are run on every check, so the comment can't lie.

## Find one

- [`CATALOG.md`](CATALOG.md) lists every asset by category with a one-line summary and the
  Receta functions it is built from. Search it: `grep -i "slug" CATALOG.md`.
- [`catalog.json`](catalog.json) holds the same list for tools, with each asset's signatures,
  its "Use when" line and its search tags.
- Then read the asset's file. The comment above the function is the whole manual: what it
  does, when to use it, a diagram when the behavior isn't obvious, and checked examples.

## Use one

Import it by category, or by file when you want only that one:

```ts
import { uniqueSlug } from '@ontologyio/receta-assets/text'
import { retryWithTimeout } from '@ontologyio/receta-assets/async/retryWithTimeout'
```

Or copy the file. An asset imports only from `remeda` and `@ontologyio/receta/*`, so it works
anywhere those two are installed.

## Add one

[`AUTHORING.md`](AUTHORING.md) is the contract: the file, the comment, the examples and when
to draw a diagram. Then:

```bash
bun scripts/check.ts <category>   # shape, lint, types, and every example claim
bun scripts/catalog.ts            # rebuild the catalog and each category's index.ts
```

The package is private for now and isn't part of the release.
