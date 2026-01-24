# Function Module Decision Tree

## When to Use
Transform, compose, and control function behavior.

## Function Selection
```
START: What function operation?
│
├─ CONDITIONAL logic?
│  ├─ If-then-else ───────────────────────────────► ifElse()
│  ├─ If-then (no else) ──────────────────────────► when()
│  ├─ If-not-then ────────────────────────────────► unless()
│  └─ Switch-case style ──────────────────────────► cond()
│
├─ COMPOSITION?
│  ├─ Compose functions (right-to-left) ──────────► compose()
│  ├─ Apply args to multiple fns (fan-out) ───────► converge()
│  ├─ Apply args to array of fns ─────────────────► juxt()
│  └─ Apply function to array of args ────────────► ap()
│
├─ PARTIAL APPLICATION?
│  ├─ Fix leftmost args ──────────────────────────► partial()
│  ├─ Fix rightmost args ─────────────────────────► partialRight()
│  ├─ Flip first two args ────────────────────────► flip()
│  ├─ Force to 1 arg ──────────────────────────────► unary()
│  ├─ Force to 2 args ─────────────────────────────► binary()
│  └─ Force to N args ─────────────────────────────► nAry()
│
└─ CONTROL FLOW?
    ├─ Side effect in chain ──────────────────────► tap()
    ├─ Wrap with try/catch ───────────────────────► tryCatch()
    └─ Cache results ─────────────────────────────► memoize()
```

## Common Patterns
- **Replace switch**: `cond([[pred1, fn1], [pred2, fn2]])`
- **Data pipelines**: `compose(parse, validate, transform)`
- **API adapters**: `partial(fetchUrl, baseUrl)`
