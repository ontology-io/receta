# Receta Cookbook — Visualization Plan

> A plan for visualizing Receta pipes as editable "recipe cards" so developers can read, modify, and learn from FP code without leaving their editor.

## Status

**Stage**: Proposal / not yet scheduled
**Owner**: TBD
**Branch**: `claude/receta-n8n-nodes-eAlQd`

---

## Motivation

Receta's name is Spanish for "recipe", and `R.pipe(data, step1, step2, ...)` already reads like a recipe — input → step → step → output. But that structure is invisible in plain code: a 6-step pipe looks like one expression, the data shape between steps is hidden behind type inference, and rearranging steps means manual cut-and-paste.

We want to make that structure **visible and directly manipulable** without forcing users into a separate runtime, file format, or workflow tool.

---

## Approaches Considered

| Approach                           | Verdict | Reason                                                            |
|------------------------------------|:-------:|-------------------------------------------------------------------|
| n8n custom nodes                   | ❌      | Workflow runtime, not a code editor. Loses type inference.        |
| Node-RED / Flowise                 | ❌      | Same problem as n8n.                                              |
| Blockly / Scratch-style blocks     | ❌      | Wrong audience — TypeScript devs find it patronizing.             |
| Observable notebook integration    | ⚠️      | Strong cell-as-step fit, but locks code into Observable runtime.  |
| Storybook-style recipe gallery     | ⚠️      | Good for docs, but read-only. No editing round-trip.              |
| **VS Code extension (bidirectional)** | ✅   | Lives where devs work; round-trips with real source files.        |

The VS Code path is the only one where the visualization edits **the actual `.ts` file**, so there is no separate format to keep in sync, no runtime lock-in, and existing tests/types/builds keep working.

---

## Concept: The Cookbook Editor

A VS Code panel that shows any `R.pipe(...)` call as a vertical stack of recipe cards. Editing the cards rewrites the pipe; editing the pipe re-renders the cards.

```
src/users.ts                          │  🍳 Recipe View
─────────────────────────────────────────────────────────────────────
import * as R from 'remeda'           │  ┌─ Recipe: processUsers ──┐
import { mapAsync } from              │  │                          │
       'receta/async'                 │  │  📥 INPUT  string[] (ids)│
                                      │  │      │                   │
export async function processUsers(   │  │      ▼                   │
  ids: string[]                       │  │  ┌────────────────────┐  │
) {                                   │  │  │ ⇶  mapAsync         │  │
  return R.pipe(                      │  │  │   fetchUser         │  │
    await mapAsync(                   │  │  │   concurrency: 5    │  │
      ids,                            │  │  └─────────┬──────────┘  │
      fetchUser,                      │  │            │ User[]      │
      { concurrency: 5 }              │  │            ▼             │
    ),                                │  │  ┌────────────────────┐  │
    R.filter(where({                  │  │  │ ✓  filter           │  │
      age: gt(18)                     │  │  │   age > 18          │  │
    })),                              │  │  └─────────┬──────────┘  │
    R.map(u => u.name),               │  │            │ User[]      │
    R.unique()                        │  │            ▼             │
  )                                   │  │  ┌────────────────────┐  │
}                                     │  │  │ 𝑓  map              │  │
                                      │  │  │   u => u.name       │  │
                                      │  │  └─────────┬──────────┘  │
                                      │  │            │ string[]    │
                                      │  │            ▼             │
                                      │  │  ┌────────────────────┐  │
                                      │  │  │ ⊕  unique           │  │
                                      │  │  └─────────┬──────────┘  │
                                      │  │            │             │
                                      │  │  📤 OUTPUT  string[]     │
                                      │  │                          │
                                      │  │  [+ step]  [⇅ reorder]  │
                                      │  └──────────────────────────┘
```

### Pillars

1. **Bidirectional** — code is the source of truth; the view is a projection.
2. **Type-aware** — every step shows the inferred type at that point.
3. **Sample-aware** — when a test or example provides input, render the actual data shape between steps.
4. **Drag-and-drop** — reorder, duplicate, delete steps; the AST rewrite preserves comments and formatting.
5. **Branding** — Result's `Ok | Err` and Option's `Some | None` render as visual forks, making FP control flow obvious.

---

## Key Interactions

### Hover a step → see the data shape at that point

```
  ┌────────────────────┐
  │ ✓  filter          │ ◀── hover
  │   age > 18         │
  └────────────────────┘
       │
       ▼
  ╔═══════════════════════════════════╗
  ║ Type at this step:                ║
  ║   User[]                          ║
  ║                                   ║
  ║ Sample (3 of 47 items):           ║
  ║   [{ id: "u_1", age: 24, ... },   ║
  ║    { id: "u_3", age: 31, ... },   ║
  ║    { id: "u_7", age: 19, ... }]   ║
  ╚═══════════════════════════════════╝
```

### Sidebar pantry — drag to add a step

```
┌─ 🥫 Pantry ──────────────┐
│ 🔍 search...             │
├──────────────────────────┤
│ ▼ result                 │
│   ?  tryCatch            │
│   ✓  map        [drag]   │
│   ⤳  flatMap             │
│   ⊕  collect             │
│                          │
│ ▼ async         ★ used   │
│   ⇶  mapAsync   ✓        │
│   ⟳  retry               │
│   ⏱  timeout             │
│                          │
│ ▼ predicate              │
│   ⊜  where               │
│   ▸  gt, lt, between     │
│   ∈  oneOf               │
└──────────────────────────┘
```

### Result/Option render as forks

```
   ┌──────────────────┐
   │ ?  tryCatch      │
   │   JSON.parse     │
   └────┬─────────┬───┘
        │ Ok      │ Err
        ▼         ▼
   ┌─────────┐  ┌──────────────┐
   │ ✓ Valid-│  │ 📋 Log error │
   │   ate   │  │   → fallback │
   └─────────┘  └──────────────┘
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  VS Code Extension                                          │
│                                                             │
│  ┌──────────────────────┐      ┌─────────────────────────┐ │
│  │ Source file (.ts)    │◀────▶│  AST adapter            │ │
│  │  R.pipe(a, b, c, d)  │      │  (ts-morph)             │ │
│  └──────────────────────┘      │  - parse pipe call      │ │
│                                │  - rewrite on edit      │ │
│                                │  - preserve trivia      │ │
│                                └────────────┬────────────┘ │
│                                             │              │
│                                             ▼              │
│                                ┌─────────────────────────┐ │
│                                │  Recipe model (JSON)    │ │
│                                │  { steps: [...],        │ │
│                                │    types: [...] }       │ │
│                                └────────────┬────────────┘ │
│                                             │              │
│                                             ▼              │
│                                ┌─────────────────────────┐ │
│                                │  Webview UI             │ │
│                                │  (React + DnD)          │ │
│                                └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Why `ts-morph`?

- Round-trips real TypeScript without losing comments or formatting.
- Same library many other refactoring tools rely on; mature.
- Gives us type info via the underlying TypeScript compiler API for the "type at this step" feature.

---

## Phased Delivery

### Phase 1 — Read-only viewer (weekend prototype)

**Goal**: Prove the AST round-trip works.

- Command: `Receta: Show recipe at cursor`
- Parse the `R.pipe(...)` enclosing the cursor
- Render each argument as a static card in a webview
- No editing yet

**Done when**: opening the panel on any pipe in this repo's `examples/` folder shows the steps correctly.

### Phase 2 — Edit operations

- Reorder steps (drag handle)
- Delete a step
- Duplicate a step
- Rewrite back to the source file with `ts-morph`

**Done when**: reordering steps in the UI updates the file and tests still pass.

### Phase 3 — Pantry + type previews

- Sidebar listing all Receta + Remeda functions
- Drag a function from the pantry onto the recipe to add a step
- Show the inferred TypeScript type between steps using the compiler API

### Phase 4 — Sample data preview

- If a test or example file invokes the pipe with concrete input, capture intermediate values during a debug run
- Render samples between steps on hover

### Phase 5 — Result/Option fork rendering

- Detect steps that return `Result` or `Option`
- Render as a two-output card with `Ok`/`Err` (or `Some`/`None`) branches
- Allow attaching follow-up steps to either branch

---

## Smallest Viable First Cut

```
Command: receta.cookbook.preview
  1. Get the cursor position
  2. Walk up the AST to the enclosing R.pipe(...) CallExpression
  3. For each argument, extract:
     - function name (e.g. "R.filter", "R.map")
     - source text of the argument
  4. Open a webview, render the steps as a vertical list
  5. Provide buttons for: move-up, move-down, delete
  6. On any action, mutate the AST node order via ts-morph
     and write the file back
```

This is the minimum that proves the concept. No drag-and-drop, no pantry, no type previews — just "your pipe, visualized and reorderable."

---

## Open Questions

1. **Multi-pipe files** — show all pipes in a file as separate recipes, or just the one at the cursor?
2. **Custom helpers** — if a user writes `const myStep = R.map(...)` and uses `myStep` in a pipe, do we recurse into it?
3. **Async pipes** — `pipeAsync` and `await` inside `R.pipe` need careful handling; possibly defer to Phase 2+.
4. **Non-pipe usage** — should standalone `Result.map(...)` calls also be visualizable, or are we strictly pipe-focused?
5. **Distribution** — VS Code Marketplace under `receta-cookbook`, or bundled with the npm package as an opt-in extension?

---

## Non-Goals

- A separate file format (e.g. `.recipe.json`) — the source `.ts` file stays the source of truth.
- A runtime — we don't execute the pipe; we visualize and edit it.
- Replacing the editor — cards live alongside code, not instead of it.
- Supporting non-Receta/Remeda pipelines — out of scope for v1.

---

## Comparison Table

| Property                       | Cookbook editor | n8n | Notebook | Blockly |
|--------------------------------|:---------------:|:---:|:--------:|:-------:|
| Round-trips with real code     | ✅              | ❌  | ⚠️       | ❌      |
| Lives in your editor           | ✅              | ❌  | ❌       | ❌      |
| Type inference at every step   | ✅              | ❌  | ⚠️       | ❌      |
| Brand fit ("recipe" metaphor)  | ★★★             | ★   | ★        | ★       |
| Effort to ship MVP             | medium          | —   | low      | high    |

---

## Next Steps

1. Decide whether to schedule this work or keep it as a community-contribution-friendly proposal.
2. If scheduled: start with Phase 1 read-only viewer on a feature branch.
3. If not scheduled: link this document from the project README under "Future ideas" so contributors can pick it up.
