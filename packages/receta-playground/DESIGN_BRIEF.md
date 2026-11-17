# Receta Playground — Design Brief

> **Audience:** a design-focused Claude agent (or human designer).
> **Purpose:** this document tells you *what to design*. It defines the product, the
> constraints, the visual language, the component inventory, the states, and the motion —
> then lists concrete deliverables. Engineering will build against your output, not invent
> the look itself. The architecture is already decided (see
> `/root/.claude/plans/imagine-it-with-ascii-gentle-naur.md`); your job is the experience.

---

## 1. What this product is

**Receta Playground** is an in-browser sandbox for *visualizing functional pipelines* built
from the Receta library. A user drags functions onto a canvas, wires them left-to-right into
a pipeline, feeds an input, hits Run, and **watches the value flow through the pipeline along
a railway** — staying on the `Ok` rail or dropping to the `Err` rail (and `Some`/`None` for
Option) and short-circuiting the rest.

It is **not** Scratch (no imperative block-snapping) and **not** a generic node editor. The
signature, must-nail-it moment is the **railway**: making functional error-handling *visible
and beautiful*. Design everything in service of that moment.

It ships two ways, so design for both:
- **Standalone app** — full three-pane workspace.
- **Embedded widget** — a single live pipeline inside a Docusaurus docs page (read-mostly,
  smaller, the-aware light/dark).

---

## 2. Audience & tone

- Developers learning FP / Receta — many are *skeptical of FP jargon* (per the library's
  docs philosophy: "no FP jargon, practical terms").
- Tone: **precise, calm, confident, a little playful in motion.** Think "developer tool that
  respects your intelligence," not "kids' coding toy." Closer to Linear / Raycast / Vercel
  than to Scratch's primary-color blocks.

---

## 3. Hard constraints (do not fight these)

1. **Metaphor is dataflow nodes** — horizontal, wired ports, left → right. No vertical
   snap-stack.
2. **Three-pane layout**: Palette (left) · Canvas (center) · Inspector (right). The embedded
   widget collapses to canvas-only with an optional slide-in inspector.
3. **14 module categories** must be visually distinguishable: `result, option, async,
   predicate, validation, collection, object, string, number, memo, lens, compare, function`
   (+ a `core/input` pseudo-category). Design a color system that scales to ~15 hues and
   still reads in light AND dark mode.
4. **Light + dark themes** — the embedded mode inherits Docusaurus's theme, so both are
   first-class, not an afterthought.
5. **Accessibility**: rail state must never be conveyed by color alone (color-blind safe).
   Pair every rail/state with a shape, icon, or label. Target WCAG AA contrast.
6. **Type-aware ports**: ports carry types; compatible/incompatible wires must be legible at
   a glance (and again — not by hue alone).

---

## 4. Layout — the workspace

```
┌─ TOPBAR ───────────────────────────────────────────────────────────────────────┐
│  receta playground      [▶ Run]  [⟳ Replay]  [</> Code]  [Share]      ☼/☾ theme  │
├──────────────┬──────────────────────────────────────────────┬───────────────────┤
│  PALETTE     │  CANVAS                                       │  INSPECTOR        │
│              │                                               │                   │
│  ⌕ search    │     ┌─────┐    ┌──────────┐    ┌─────────┐    │  ▸ selected node  │
│              │     │INPUT│●──▶ │ tryCatch │●─▶ │   map   │●   │  ▸ live trace     │
│  ▾ result    │     └─────┘    └──────────┘    └─────────┘    │  ▸ value preview  │
│   • ok       │                                               │  ▸ type signature │
│   • err      │           (Ok 42)        (Ok 84)              │                   │
│   • map      │                                               │  [ view as TS ]   │
│   • flatMap  │                                               │                   │
│  ▾ option …  │     · grid background · pan/zoom · minimap ·  │                   │
└──────────────┴──────────────────────────────────────────────┴───────────────────┘
```

Design each pane's: spacing scale, default/resized widths, empty states, scroll behavior,
and how they reflow at tablet width. Phone is out of scope (note it, don't design it).

---

## 5. THE hero — the railway

This is the centerpiece. Design it as a **first-class visual layer over the wires**, not just
edge coloring. Two parallel rails run through the whole pipeline; the live value is a
**traveling token** that rides the top (`Ok`/`Some`) rail and, on failure, visibly *drops* to
the bottom (`Err`/`None`) rail, after which downstream nodes are **dimmed/skipped**.

Happy path:
```
        tryCatch        map           flatMap        unwrapOr
 Ok ●━━━━━━━━━━●━━━━━━━━━━━●━━━━━━━━━━━━━●━━━━━━━━━━━━━━●──▶  Ok(user)
 Err ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄▶  (idle / faint)
```

Failure / short-circuit:
```
        tryCatch        map           flatMap        unwrapOr
 Ok ●━━━━━━━━━━●          ░░░░░          ░░░░░          ░░░░░
              ┃ ✗
              ▼
 Err ┄┄┄┄┄┄┄┄┄●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶  Err(ParseError)
            "Unexpected token }"      (downstream dimmed)
```

**Design the full spec for this**, including:
- Visual treatment of the two rails (idle vs. active vs. the "live" one).
- The traveling value token (shape, label chip showing the current value).
- The **drop moment**: how the token transitions Ok→Err. This should feel like a satisfying,
  legible *fall*, not a glitch. Define the motion curve and duration.
- The **short-circuit state** for skipped downstream nodes (dim level, optional hatch/“skipped”
  badge — not color-only).
- The **Option** variant (`Some`/`None`) — same system, distinct enough to tell apart from
  Result at a glance.
- The **async** variant — a pending/loading state on a node while a promise resolves (the
  rails gain a "waiting" treatment; design it).

---

## 6. The node

```
        ┌─────────────────────────────────┐
  in  ──●│  ◆ result · flatMap             │●── out
 Result  │  ─────────────────────────────  │  Result
 <num,E> │  (n) => n>0 ? ok(n) : err(…)    │  <num,E>
         │  ⓘ data-last · short-circuits   │
         └─────────────────────────────────┘
```

Design the node as a small system with these parts and states:
- **Header**: category glyph + `module · fnName`, colored by category.
- **Body**: the bound argument(s) — a code-ish slot the user edits (function literal, value).
  Define how a multi-arg function looks vs. a single-arg one.
- **Ports**: input (left) / output (right), each typed. Define compatible-wire vs.
  incompatible-wire vs. unconnected affordances.
- **Badges**: `data-first`/`data-last`, "short-circuits the Err rail," "async."
- **States**: default · hover · selected · running (this node currently executing) · success
  (produced Ok/Some) · error (produced Err/None) · skipped (short-circuited) · invalid
  (bad arg / type mismatch).
- The **INPUT** node and a terminal **OUTPUT/result** node are special — design them distinctly
  from function nodes.

---

## 7. Palette & Inspector

**Palette** — the function registry as a searchable, categorized list.
- Collapsible category sections, each with its category color.
- Each entry: name, one-line description, tiny type hint, drag handle.
- Search/filter; "recently used"; design the empty/no-results state.
- Define the drag-preview (ghost) that follows the cursor onto the canvas.

**Inspector** — context for the selected node + the run trace.
- **Node detail**: full signature, JSDoc summary, current bound args, `@see` links.
- **Trace table** (after Run): step · node · rail · value, with the short-circuit row marked.
```
 step  node            rail    value
  1    INPUT           ──      '{"age":17}'
  2    tryCatch        Ok ✓    { age: 17 }
  3    map(.age)       Ok ✓    17
  4    flatMap(adult)  Err ✗   {code:'TOO_YOUNG'}   ◀ short-circuit
  5    unwrapOr        ──      (skipped)
 ───────────────────────────────────────────────
 result ▸  Err({ code: 'TOO_YOUNG' })
```
- **Value preview**: how do we render an `Ok({...})`, an `Err`, a `Some`, a `None`, a long
  string, a nested object? Design a compact value-chip + expandable view.

---

## 8. "View as TS" — code round-trip

A panel/drawer that shows the canvas graph as real Receta code, syntax-highlighted, copyable:
```ts
pipe(
  '{"age":17}',
  tryCatch(s => JSON.parse(s)),
  map(o => o.age),
  flatMap(adultOnly),
  unwrapOr('denied'),
)
```
Design the panel (drawer vs. modal vs. bottom-sheet), the highlight theme (light+dark), and
how the currently-selected node maps to a highlighted line.

---

## 9. Visual language to define (design tokens)

Deliver an actual token set, not just vibes:
- **Color**: neutral/surface ramp (light+dark); the ~15 category hues with AA-safe text-on-fill;
  semantic rail colors for Ok/Err/Some/None/pending that are also color-blind distinguishable;
  wire colors (valid/invalid/active).
- **Type**: font family (assume a clean sans for UI + a mono for code/values), the scale,
  and weights. Pick something that fits the Docusaurus embed without clashing.
- **Spacing / radius / elevation**: a small scale; node corner radius; canvas grid spacing;
  shadow/elevation for nodes vs. panels.
- **Iconography**: category glyphs, rail/state icons (✓ / ✗ / ⟳ / ⊘ skipped), port shapes.
- **Motion**: durations + easing for token travel, the Ok→Err drop, node run-pulse,
  panel transitions. Specify a "reduced motion" fallback.

---

## 10. Key flows to storyboard

Provide before→after frames for each:
1. **Cold start** — empty canvas, how a first-timer knows to drag from the palette.
2. **Build a pipeline** — drag INPUT → tryCatch → map → unwrapOr, wiring ports.
3. **Run (happy path)** — token travels the Ok rail to a green result.
4. **Run (failure)** — token drops to Err at `flatMap`, downstream dims, Err result shown.
5. **Fix & replay** — user edits an arg, hits Replay, sees it now pass.
6. **Embedded doc example** — the same pipeline, read-mostly, inside an MDX page, theme-matched.

---

## 11. Deliverables (what to hand back)

1. **High-fidelity mockups** of: full workspace (light + dark), the railway in happy/failure/
   async states, a node in all its states, palette, inspector w/ trace, and the embedded widget.
2. **The railway motion spec** — frames or a written timeline for the Ok→Err drop and the
   token travel (durations, easing, reduced-motion variant).
3. **Design tokens** — color/type/space/radius/motion as a structured list (ready to become
   CSS variables / a theme file).
4. **Component inventory** — every component with its states enumerated (the engineering team
   will map these to React components).
5. **Accessibility notes** — how each state is conveyed without relying on color; focus order;
   keyboard story for canvas (stretch).
6. A short **rationale** doc tying the choices back to the "make the railway the hero" goal.

Format: Markdown spec + ASCII/wireframe sketches are acceptable and encouraged; if producing
images, keep them theme-paired (light+dark). Anchor everything to the constraints in §3.

---

## 12. Out of scope (don't design)

Phone layout, account/auth, multi-pipeline projects/tabs, real-time collaboration, the
Scratch snap-stack renderer, and any backend — execution is fully client-side.
