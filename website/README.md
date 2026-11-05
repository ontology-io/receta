# Receta website

The site at receta.dev. The page is a pipe: the full stop in the first sentence is a value, and scrolling carries it down one rail through every idea until it lands as the last full stop. The design lives in [`design/receta-website.pen`](../design/receta-website.pen).

```bash
bun install
bun run dev        # http://localhost:3000
bun test src       # the page's claims and the motion maths
bun run typecheck
bun run build      # static site in out/
```

## Three layers, each composing the one below

```
screens      arrange containers in page order
containers   own the outside world: scroll, clipboard, files, content
components   pure: props in, structure out
```

A component never imports from `content/`, never reads scroll and never touches the browser. Words reach it as props, so `src/components` has no copy and no effects. Only two files are client code: the scroll stage and the copy button.

## Motion never re-renders React

`useScrollStage` is the only code that touches scroll. Each frame it asks the pure functions in `lib/motion` what a block should show, and writes the answer as CSS variables. Components just read those variables, and each falls back to its rest value. That one choice gives three behaviours for free:

- With JavaScript off, or reduced motion on, the page shows its rest frames with nothing pinned.
- Below 1152px there is no scroll code at all. The rail and value are plain CSS.
- A timeline is a pure function of progress, so it has ordinary unit tests.

To change how a scene moves, edit its timeline in `lib/motion/timelines.ts` and the utility it feeds in `app/globals.css`.

## Design pixels are the unit

`--spacing` is one design pixel, so `left-710` in code is `x: 710` in Pen. The root font size scales the 1440 by 900 stage to the window, so every length scales with it.

Newsreader must load with its `opsz` axis and `font-optical-sizing: none`. At `auto`, display type sets 11% wider than the design and the value misses the full stop, because rail coordinates assume these exact text widths.

## Code on the page is real

Samples are files in `src/samples`, marked with `// #region sample`. They compile against the published package, and `samples.test.ts` checks every result the page claims. A broken sample fails the build, not the reader.

## The docs

The docs are the same Next app at `/docs`, built with [Fumadocs](https://fumadocs.dev). They have their own root layout and stylesheet in `app/docs`, because the site's design-pixel `--spacing` would shrink Fumadocs' spacing to a quarter. Moving between the site and the docs is a full page load for the same reason.

- **Guides** are in `content/docs`. The order comes from each folder's `meta.json`.
- **Reference** pages are generated from the JSDoc in `packages/receta/src` by `scripts/generate-reference.ts`. They aren't in git, so edit the source.
- **Agent files** (`/llms.txt`, `/llms-full.txt` and a `.md` beside every page) are written into `public/` by `scripts/export-markdown.ts`.

### Examples are checked

`bun run check:examples` compiles every example in the docs and the READMEs against the published package, then runs the ones with no imaginary helpers and compares each `// => value` with what came back. CI fails on any problem.

Examples can be fragments. A name nobody declared resolves to an earlier import on the page, then the module the page teaches, then any Receta module, and anything else becomes `any`. Use `ts nocheck` only for code that is deliberately wrong, and `title="Signature"` for a signature with no body.

## Deploying

The export lives in the `receta-website` R2 bucket on Cloudflare. A bucket can't answer `/` with `index.html` or `/docs/result` with its page, so a small Worker (`worker/index.ts`) maps URLs to objects, and serves a docs page as markdown to a reader that sends `Accept: text/markdown`. `src/lib/hosting/objects.ts` holds the rules both sides share: content types, cache lifetimes and the URL mapping.

```bash
bunx wrangler login   # once
bun run deploy        # build, upload to R2, deploy the Worker
```

Hashed files upload first and pages last, so a page never points at a file that isn't there yet. Old hashed files stay in the bucket, so a tab that's already open keeps working. A new file type fails the deploy until it's added to `CONTENT_TYPES`.
