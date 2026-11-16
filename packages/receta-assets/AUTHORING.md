# Writing an asset

An asset is one exported function in one file, built from Receta and Remeda, with a comment
that tells an agent everything it needs to use the function without reading its body.
`bun scripts/check.ts` enforces every rule marked **checked**. The four assets to copy from:

| Asset | Shows |
| --- | --- |
| [`text/uniqueSlug`](src/text/uniqueSlug.ts) | data-first and data-last with `R.purry`, predicates in a pipe |
| [`parse/parsePort`](src/parse/parsePort.ts) | a `Result` with a typed error, `mapErr` then `flatMap` |
| [`collection/totalsBy`](src/collection/totalsBy.ts) | a pipe that reshapes data, drawn as a step table |
| [`async/retryWithTimeout`](src/async/retryWithTimeout.ts) | async composition with branching, drawn as a flow |

## The file

- **Checked.** `src/<category>/<name>.ts`, with `<name>` in camelCase and the same as the function.
- **Checked.** It exports that one function, plus the types its signature needs. Start each
  type's name with the asset's name, like `ParsePortError` or `RetryWithTimeoutOptions`: the
  category's `index.ts` re-exports everything, and two assets exporting `Options` would clash.
- **Checked.** It imports from `remeda` and `@ontologyio/receta/<module>` only. No other assets,
  no relative paths, no Node or browser modules. An agent copies one file into a project and it
  works.
- **Checked.** It uses at least one Receta function. If Remeda alone does the job, it isn't an
  asset.
- **Checked.** It passes the docs lint: no `try`/`catch` (use `tryCatch`), no native `.map`,
  `.filter`, `.reduce`, `.sort`, `.join` and friends (use `R.*`), no loops, no `Promise.all`
  (use `mapAsync` or `parallel`), no inline comparisons inside `R.filter` or `R.find` (use
  `where`, `eq`, `gt`, `oneOf`, …), no `JSON.parse` (use `parseJSON`), no `Object.keys` and
  friends (use `R.keys`). `throw` is legal only to ask `retry` for another attempt.
- **Checked.** It compiles under the repository's strict settings: `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, no `any`.
- Something that can fail returns `Result`. Something that may be missing returns `Option`.
  Validation that should report every problem at once returns `Validation`. Formatting and
  pure transforms return plain values.
- An error is an object with a `code` from a string union, a `message` a person can read, and
  the input or context that explains it: `{ code: 'OUT_OF_RANGE', input, message }`.
- When the function takes data plus settings, accept both forms with `R.purry`: data first,
  `name(data, settings)`, and data last, `name(settings)` for `R.pipe`. A function with one
  argument, a factory that returns a function, or an async runner doesn't need it.
- Pure: no logging, no globals, no clocks. A function that needs the time takes `now` as an
  argument.

## The comment

It sits right above the first signature, and every part has a job:

````ts
/**
 * One sentence on what it does, under 140 characters. The catalog shows it.
 *
 * Use when: the situation an agent is in when it should reach for this asset. Then
 * anything a caller must know: what comes back on failure, edge cases, what it won't do.
 *
 * ```text
 * a diagram, only when the function needs one (see below)
 * ```
 *
 * @example
 * ```ts
 * nameOfAsset(input)
 * // => expected value
 * ```
 *
 * @tags words, an agent, might, search, for
 * @see receta function - @ontologyio/receta/<module>, how it relates
 */
````

- **Checked.** A summary, a paragraph starting `Use when:`, an `@example` with a ` ```ts `
  fence and an `@tags` line.
- Tags are the words someone would search with, including synonyms: `slug, url, permalink`.

## Examples are tests

The check runs every example and compares each `// => value` with what came back, by deep
equality. The comment can't drift from the code.

- **Checked.** At least two claims: the usual case, and an edge or failure case.
- **Checked.** Claims are values: `Ok(3)`, `Err({ code: 'X', input: 'a', message: '…' })`,
  `Some(1)`, `None`, `Valid(x)`, `Invalid(['…'])`, plain literals, arrays and objects. Never
  words like `// => the user's name`.
- A claim belongs to the statement right above it: an expression, or a `const` whose value it
  checks. `await task() // => Ok(1)` works.
- The example uses the asset and `R` without importing them. Import anything else it uses.
- **Checked.** The example compiles under the strict settings and passes the same lint.
- Keep it fast. Use delays of 1 to 10 ms. Receta's `timeout` doesn't clear its timer, so a long
  limit keeps the example running until it fires, and examples are stopped after 5 seconds.
- No network, files or real clocks. Pass a stub function, as `retryWithTimeout` does.
- Errors that are class instances, like `TimeoutError`, don't compare well. Project them first:
  `R.pipe(result, mapErr((error) => error.attempts)) // => Err(2)`.

## When to draw

Draw a diagram when someone can't predict the behavior from the signature, the summary and
the example: branching such as retries, fallbacks or routing; several stages where the data
changes shape; a state machine. Don't draw a three-step pipe.

Follow the visual-communicator rules:

- **Checked.** At most 80 columns.
- At most 12 nodes, one flow direction, every edge labeled.
- Shapes keep one meaning: `┌─┐` is a step, `╭─╮` an outcome such as `Ok` or `Err`, `⟨ ⟩` a
  decision.
- A pipe that reshapes data is a table of `STEP` against `DATA AFTER IT`, like `totalsBy`.
- Branching is boxes and labeled arrows, like `retryWithTimeout`.
- Put it in a ` ```text ` fence after the `Use when:` paragraph and before `@example`.

## Families of variants

One idea usually wants several assets that differ in a single policy, each with its own name:

- outcome: `Result` with a reason, or `Option` when the reason doesn't matter
  (`parsePort`, `parsePortOption`)
- strictness: fail on the first problem, or report them all (`parseIdList`, `validateIdList`)
- shape: one value, a list, or a record (`maskEmail`, `maskEmails`, `maskEmailFields`)
- policy: which one wins (`dedupeByKeepFirst`, `dedupeByKeepLast`)
- timing: sync or async (`retryWithTimeout`, `retryWithFallback`)

Name the variant by what differs, and point to its siblings with `@see`.

## Receta traps

These Receta functions misbehave in Receta 0.4.4. The assets that touch them work around
each one with a comment, so look there first.

| Function | What goes wrong | Instead |
| --- | --- | --- |
| `cond` (function) | no match returns the `none` function, not `None` | `switchCase`, or `R.find` over rules |
| `parseInt` (result) | `'12abc'` is `Ok(12)`, `'1e3'` is `Ok(1)` | test `matches(/^-?\d+$/)` first |
| `getPath` (object) | finds inherited members: `['toString']` is `Some` | look up own keys with `R.entries` |
| `parseFormattedNumber` (number) | `'12,50 €'` is 1250, `'1,5'` is 15 | `parse/parseMoneyCents` |
| `titleCase`, `camelCase` (string) | `MaríA`, `Don'T`; `camelCase('firstName')` is `firstname` | `capitalize` per word |
| `transformKeys` (object) | `userID` becomes `user_i_d`, `_id` becomes `id` | `object/toSnakeCaseKeys` |
| `deepMerge` (object) | an explicit `undefined` overwrites a value | `stripUndefined` first |
| `highlight` (string) | matches inside `&amp;` | `text/searchHighlight` |
| `round`, `roundTo` (number) | `round(1.005, 2)` is 1; `roundTo(1.15, 0.05)` keeps float noise | `number/roundPrice` |
| `timeout` (async) | never clears its timer | keep limits short in examples |
| `retry` (async) | retries only on throw, never on `Err` | `async/retryResult` |
| `windowSliding` (collection) | `step: 0` never returns | guard the step |
| `removeAtIndex`, `updateAt` (collection) | `-1` means the last item, so a failed `findIndex` hits it | the `*ById` assets |

## Commands

```bash
bun scripts/check.ts text            # a word is a whole category or asset name
bun scripts/check.ts maskEmail       # so this checks one asset
bun scripts/check.ts parse/parse     # with a slash, it's part of a path
bun scripts/check.ts                 # everything
bun scripts/catalog.ts               # rebuild catalog.json, CATALOG.md and each index.ts
bun run typecheck                    # also catches two assets exporting the same name
bun scripts/intake.ts 123            # place and check the candidate from issue #123
```

`catalog.json`, `CATALOG.md` and `src/<category>/index.ts` are generated. Never edit them.

## Categories

| Category | What belongs there | Mostly built from |
| --- | --- | --- |
| `async` | retries, time limits, batching, polling, fallbacks | async, result |
| `cache` | memoized loaders, expiry, size limits, invalidation | memo |
| `collection` | dedupe, top-N, totals, diffs, upserts, trees, pages | collection, Remeda, compare, predicate |
| `control` | classify a value, route it, guard it | function |
| `filter` | ready predicates and builders for search and facets | predicate |
| `number` | money, percentages, sizes, rounding, small statistics | number |
| `object` | redact, rename, defaults, flatten, strip, pick | object |
| `parse` | untrusted text or unknown values into typed values | result, option, number, string |
| `result` | combine, recover, convert and collect Results and Options | result, option |
| `sort` | multi-key, priority, natural and nullable orders | compare |
| `state` | immutable updates deep inside state | lens |
| `text` | slugs, excerpts, masks, names, case, highlighting | string |
| `validate` | field, form and payload checks that report every error | validation, predicate |

A new category goes in `CATEGORIES` in `scripts/assets.ts`, in the table in
`scripts/catalog.ts` and in `package.json`'s `exports`.
