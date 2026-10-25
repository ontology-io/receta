---
name: readable
description: >-
  Check and fix the readability of Receta/Remeda TypeScript code at five zoom levels (name, line, flow,
  function, module). Use when the user says "make this readable", "is this readable", "clean this up",
  "this pipe is hard to follow", "readability review", "comment this so a new teammate can follow it", or
  asks to polish code before a PR. Also apply it as a self-check whenever you write new Receta code; the
  refactor, generate-module, migrate, explain and review skills run it on the code they produce.
  Complements `review`: review checks that code uses Receta, readable checks that a person can follow it.
tags:
  - readability
  - review
  - refactoring
  - naming
  - clean-code
---

# Receta Readability

Receta removes a class of bugs. It does not make code readable on its own: a pipe of eight anonymous
lambdas can pass every Receta rule and still be impossible to follow. This skill reads code at five zoom
levels, asks each level's question, and fixes the level where the code stops being readable.

The Receta rules (Result over try/catch, Option over null, pipe over method chains) still apply.
Readability decides wherever those rules leave a choice, and it never overrides them.

## The quick test

Pick any zoom level and ask its question. If the reader has to **scroll**, **hold a variable in their
head**, or **read the next level down** to get the answer, that level is where the code stops being
readable.

## The five zoom levels

| Level    | The question                                                     | Fails when                                        |
|----------|------------------------------------------------------------------|---------------------------------------------------|
| Name     | Can you tell what it holds or does without reading its body?     | `proc`, `o`, `t`, `res`, `opt`, `data2`           |
| Line     | Does each line carry one idea?                                   | a pipe stage that filters, multiplies and branches |
| Flow     | Can you read the happy path top to bottom?                       | failures hidden in lambdas, `match` at every step |
| Function | Does it do one thing, and does its name say all of it?           | computes and persists, returns `boolean`          |
| Module   | Can you see the rules and the public surface from the top?       | magic numbers buried, error shapes scattered      |

### 1. Name

- Name values for the domain, not the wrapper: `user`, `parsedConfig`, never `result`, `res`, `opt`.
  When the wrapped and unwrapped value share a scope, qualify the wrapped one (`userResult`).
- Name pipe stages for what they produce or check: `requireItems`, `withTotal`, `toInvoiceLine`. A pipe
  whose stages are names reads as a sentence.
- Lambda parameters are words (`item`, `order`). A single letter is fine only in a one-expression lambda
  where the collection already says what it is: `R.map(users, (u) => u.id)`.
- Predicates follow `is*` / `has*` / `can*`. Error codes are domain words: `EMPTY_ORDER`, not `ERR_1`.

### 2. Line

- One pipe stage, one transformation. A stage whose lambda spans several lines, holds a ternary, or
  nests another pipe gets extracted into a named function.
- Pull magic numbers and sub-expressions into named consts (`discount`, `VIP_DISCOUNT`).
- No inline pipe inside a lambda (`map((x) => R.pipe(x, ...))`): give the inner pipe a name.
- A `where({ ... })` with more than about four keys becomes a named predicate const.

### 3. Flow

- A Result chain *is* the happy path. Stages that can fail use `flatMap`, stages that cannot use `map`,
  and each failure is its own named stage (`requireItems`), not an `if` inside a lambda.
- Unwrap once, at the edge: one `match` / `unwrapOr` where the value leaves Receta. Never
  `isOk` → read `.value` → re-wrap in the middle of a chain.
- Guard clauses for one or two early exits. `cond` / `switchCase` for three or more parallel branches,
  not for a plain if/else.
- A pipe longer than about seven stages splits into named phases.
- Keep nesting inside a function body to two levels.

### 4. Function

- Pure core, effects at the edge. Computing returns a value or `Result`; I/O returns
  `Promise<Result<T, E>>` and its name says so (`save*`, `fetch*`, `send*`).
- No writes hidden in `R.map`, `R.forEach` or `tap`. `tap` is for observing (logs, metrics). A write in
  `tap` is honest only when the enclosing function's name announces it.
- No `unwrap` / `orThrow` mid-function: a hidden throw breaks the promise the `Result` signature makes.
  They belong at the boundary (entry points, tests).
- One level of abstraction per function. Don't mix a pipe of domain stages with index arithmetic.
- The return type tells the whole story. `Result<T, OrderError>` with a union of named failures tells the
  caller *why*; a `boolean` makes them guess which of three checks failed.

### 5. Module

- Business constants live at the top, named, with a comment saying why the value is what it is.
- A newcomer finds the entry point from the top: a file header says what the file owns and which function
  to read first (see [Comments that onboard](#comments-that-onboard)).
- Each error union is declared once (`types.ts` in a Receta module), not rebuilt as literals per call.
- Public function first, helpers below in the order it calls them. This matches Receta's own layout:
  overloads → `purry` → `*Implementation`.
- One import style per file: `import * as R from 'remeda'`, named imports from
  `@ontologyio/receta/<module>`. When `result` and `option` names collide, alias with a module suffix
  (`mapOption`, `unwrapResult`) and use the same aliases everywhere.

## What holds the levels together

- **Comments explain why, and show newcomers where to start.** The code already says what it does. A
  comment is for a business rule, a workaround, a trade-off the code can't express, or for orienting a
  reader who is new to the file (below). JSDoc on exports is the API reference this repo requires, so
  keep it.
- **Locality.** Things that change together sit together. A pipe's stage functions live next to the pipe
  unless something else reuses them. In the library, each function's folder holds its code and tests.
- **Honesty.** A function does what its name says and nothing more: no hidden writes, no surprise
  mutation, no hidden throws. This is where names and functions meet.
- **Consistency.** One pattern used everywhere beats a better pattern used in some places. If a module
  returns `Result`, every fallible function in it does. Each surprise costs the reader a working-memory slot.

## Comments that onboard

A newcomer reads a file top to bottom once, to learn where things are and what they can rely on. Three
comments serve them, each in a fixed place. Any other comment is a why-comment or gets deleted.

| Comment           | Where                    | Says                                                                 | Skip when |
|-------------------|--------------------------|----------------------------------------------------------------------|-----------|
| File header       | first lines of the file  | what the file owns, who calls it, which function to read first      | the path already says it, as in a library `src/<module>/<fn>/index.ts` |
| Entry-point JSDoc | the exported function    | what it does, each failure it can return, what happens on failure   | never: every export gets one (in the library, keep the `@example`) |
| Why-comment       | the line it explains     | the business rule, workaround or trade-off behind that line         | the code already says it |

- Explain what a pattern guarantees in domain words, not how the pattern works. "Nothing is saved when
  either check fails" onboards a reader who has never seen a Result chain; "flatMap short-circuits on Err"
  only helps one who already knows. How Result works lives in the module docs and the `explain` skill.
- Name the failures by their error codes, so a reader can search from a log line straight to the check.
- Never narrate pipe stages (`// filter out gifts`), record history (git has it), or keep commented-out code.

## Receta-specific smells

| Smell              | Looks like                                             | Fix                                              |
|--------------------|--------------------------------------------------------|--------------------------------------------------|
| Lambda soup        | every pipe stage is an anonymous multi-line lambda     | name the stages; the pipe becomes a sentence     |
| Context threading  | `map((x) => ({ x, t }))` carrying a tuple between stages | compute it in a named stage that returns the domain type |
| Nested pipes       | `map((x) => R.pipe(x, ...))` inside a pipe             | extract the inner pipe into a named function     |
| Wrapper ping-pong  | Option → Result → Option, or unwrap then re-wrap       | pick the wrapper once; convert at one boundary   |
| Match everywhere   | `match` after each step to keep going                  | `map` / `flatMap` through; `match` once at the edge |
| Combinator puzzle  | `converge`, `juxt`, `flip` where two lines would say it | write the plain function; use a combinator only when it names the intent |
| Over-extraction    | one-use helpers shorter than their own names           | inline it; one idea on one line needs no name    |

## Worked example

The same logic three ways.

```typescript
// Before: vanilla, every level fails
function proc(o: any) {
  if (o) {
    if (o.items.length > 0) {
      let t = 0
      for (const i of o.items) {
        if (!i.gift) t += i.p * i.q * (o.c?.vip ? 0.9 : 1)
      }
      if (t > 0) {
        db.save({ ...o, total: t })
        return true
      }
    }
  }
  return false
}
```

```typescript
// Before: uses Receta, still unreadable
const proc = (o: any) =>
  R.pipe(
    fromNullable(o),
    filter((x) => x.items.length > 0),
    map((x) => ({ x, t: R.sumBy(R.filter(x.items, (i) => !i.gift), (i) => i.p * i.q * (x.c?.vip ? 0.9 : 1)) })),
    filter(({ t }) => t > 0),
    tap(({ x, t }) => db.save({ ...x, total: t })),
    isSome,
  )
```

```typescript
// After
// Checkout pricing: turns a submitted order into a priced, saved order.
// Called by the checkout handler. Start at saveOrderWithTotal.
import * as R from 'remeda'
import { ok, err, map, flatMap, tap, type Result } from '@ontologyio/receta/result'

// Loyalty program: VIPs pay 90% of list price on every line.
const VIP_DISCOUNT = 0.9

/**
 * Prices an order and saves it.
 *
 * Fails with EMPTY_ORDER when the order has no items, or ZERO_TOTAL when every item is a gift.
 * Nothing is saved when either check fails.
 */
export function saveOrderWithTotal(order: Order): Result<PricedOrder, OrderError> {
  return R.pipe(
    requireItems(order),
    map(withTotal),
    flatMap(requirePositiveTotal),
    tap(orders.save),
  )
}

function requireItems(order: Order): Result<Order, OrderError> {
  return order.items.length > 0
    ? ok(order)
    : err({ code: 'EMPTY_ORDER', message: 'Order has no items', orderId: order.id })
}

function withTotal(order: Order): PricedOrder {
  return { ...order, total: calculateTotal(order) }
}

function requirePositiveTotal(order: PricedOrder): Result<PricedOrder, OrderError> {
  return order.total > 0
    ? ok(order)
    : err({ code: 'ZERO_TOTAL', message: 'Order total is zero', orderId: order.id })
}

function calculateTotal(order: Order): number {
  const discount = order.customer?.isVip ? VIP_DISCOUNT : 1
  return R.pipe(
    order.items,
    R.filter((item) => !item.isGift),
    R.sumBy((item) => item.price * item.quantity * discount),
  )
}
```

What changed at each level:

```
 NAME
 proc, o, x, t, i ──▶ saveOrderWithTotal, order,
                      requireItems, withTotal
        │
        ▼
 LINE
 one stage, five ideas ──▶ discount named; each
                           stage one transformation
        │
        ▼
 FLOW
 failures hidden in ──▶ each failure is a named
 filter lambdas          flatMap stage
        │
        ▼
 FUNCTION
 compute + persist, ──▶ calculateTotal is pure; the write
 returns boolean         is the last stage and the name
                         says it; Result says why it failed
        │
        ▼
 MODULE
 magic 0.9 buried, ──▶ VIP_DISCOUNT named at top,
 errors anonymous,      OrderError declared once,
 no way in              header says where to start
```

Three things the example shows. The `if (o)` guard disappears because `Order` is typed, so the type rules
out the missing order. `(item) => !item.isGift` stays inline: it is already one idea, and naming it would
add a jump without adding meaning. And the comments onboard without narrating: the header says where the
file sits, and the JSDoc names each failure and says nothing is saved when one happens, so a reader new
to Result chains knows the guarantee without knowing the pattern.

## Steps

1. **Read the target** (file, directory, or snippet) plus enough around it to judge names: imports, the
   types it uses, and callers of anything it exports.
2. **Walk the levels in order**, Name → Line → Flow → Function → Module. At each level ask its question.
   For every failure, record the line, the level, and the symptom (scroll / hold a variable / read the
   next level down).
3. **Report** in the format below.
4. **Fix** when the user asks for it, or when the code is your own and you're about to present it. Fixes
   preserve behavior and keep every Receta rule intact. A signature change (`boolean` → `Result`, a
   renamed export) is an API change: list it separately and ask before making it.
5. **Verify** with `bun run typecheck` and `bun test`, or the project's equivalents.

## Report format

```markdown
## Readability: <file>

| Level    | Verdict | Where      |
|----------|---------|------------|
| Name     | ✗       | L12, L30   |
| Line     | ✗       | L18        |
| Flow     | ✓       |            |
| Function | ✗       | L10–L24    |
| Module   | ✓       |            |

### [Line] One stage carries five ideas (L18)
Symptom: the reader holds `t` across three stages.
Current:
  <the offending code>
Suggested:
  <the rewrite>

### API changes (need approval)
- `proc(o): boolean` → `saveOrderWithTotal(order): Result<PricedOrder, OrderError>`
```

For a directory, start with a table of files and the first level each one fails at, worst first, then
give full reports only for files that fail two or more levels.

## Don't

- Don't trade a Receta rule for readability. "A try/catch reads better here" is never the fix.
- Don't add comments that restate the code. If a comment says *what*, rename instead.
- Don't extract what is already one idea on one line.
- Don't rename public exports silently; that breaks callers.
- Don't introduce a second pattern for something the file already does one way, even a better one.
  Propose the change for the whole module instead.
