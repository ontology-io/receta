# Decision Trees Implementation Notes

## What Was Built

A complete decision tree system for helping LLMs (and humans) select the right Receta function for any task.

### Structure Created

```
docs/decision-trees/
├── README.md                         # System documentation
├── 00-root.md                        # Root decision tree (module selection)
├── result/                           # ✅ COMPLETE (19 functions)
│   ├── _module.md                   # Module-level decision tree
│   ├── ok.md                        # Individual function decision trees
│   ├── err.md
│   ├── map.md
│   ├── flatMap.md
│   ├── tryCatch.md
│   ├── tryCatchAsync.md
│   ├── unwrap.md
│   ├── unwrapOr.md
│   ├── unwrapOrElse.md
│   ├── match.md
│   ├── collect.md
│   ├── partition.md
│   ├── isOk.md
│   ├── isErr.md
│   ├── mapErr.md
│   ├── tap.md
│   ├── tapErr.md
│   ├── flatten.md
│   └── fromNullable.md
├── option/                          # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── async/                           # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── predicate/                       # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── validation/                      # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── collection/                      # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── object/                          # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── string/                          # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── number/                          # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── memo/                            # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── lens/                            # ⚠️ MODULE TREE ONLY
│   └── _module.md
├── compare/                         # ⚠️ MODULE TREE ONLY
│   └── _module.md
└── function/                        # ⚠️ MODULE TREE ONLY
    └── _module.md

scripts/
└── generate-llm-txt.ts              # ✅ Generation script

llm.txt                              # ✅ Generated output (65KB)
```

## Current Status

### ✅ Completed
1. **Root Decision Tree** - Module selection guide
2. **Result Module** - Complete with all 19 functions
3. **Module Trees** - All 13 modules have module-level decision trees
4. **Generation Script** - Fully functional TypeScript script
5. **Package Script** - `bun run generate-llm` command
6. **Documentation** - Complete README and this notes file

### ⚠️ TODO: Function-Level Trees

The following modules have module-level trees but need individual function trees (estimated ~130 more files):

**Option Module** (~12 functions):
- some, none, fromNullable, fromResult, tryCatch
- isSome, isNone
- map, flatMap, filter, flatten
- unwrap, unwrapOr, unwrapOrElse, match
- tap, tapNone
- collect, partition
- toResult, toNullable

**Async Module** (~12 functions):
- mapAsync, filterAsync, parallel, sequential
- retry, timeout, sleep
- poll, batch
- debounce, throttle

**Predicate Module** (~30+ functions):
- Comparison: gt, gte, lt, lte, eq, neq, between, startsWith, endsWith, includes, matches, isEmpty, isNotEmpty
- Combinators: and, or, not, xor, always, never
- Builders: where, oneOf, prop, matchesShape, hasProperty, satisfies, by
- Guards: isString, isNumber, isBoolean, isArray, isObject, etc.

**Validation Module** (~20+ functions):
- Constructors: valid, invalid, fromPredicate, fromResult, tryCatch
- Transformers: map, mapInvalid, flatMap, flatten
- Combinators: validate, validateAll, schema, collectErrors
- Validators: required, email, url, min, max, between, etc.
- Conversions: toResult

**Collection Module** (~8 functions):
- nest, groupByPath
- diff
- paginate, paginateCursor
- indexByUnique
- union, intersect, symmetricDiff

**Object Module** (~15 functions):
- flatten, unflatten
- getPath, setPath, updatePath
- validateShape, stripUndefined, compact
- rename, mask, deepMerge
- mapKeys, mapValues, filterKeys, filterValues

**String Module** (~20+ functions):
- Transformers: slugify, kebabCase, camelCase, snakeCase, pascalCase, capitalize, titleCase, truncate
- Validators: isEmpty, isBlank, isEmail, isUrl, isAlphanumeric, isNumeric, isHexColor
- Sanitizers: stripHtml, escapeHtml, unescapeHtml, trim, trimStart, trimEnd
- Extractors: words, lines, between, extract
- Template: template, parseTemplate

**Number Module** (~20+ functions):
- Validation: isInteger, isFinite, isPositive, isNegative, inRange, clamp
- Formatting: format, toCurrency, toPercent, toCompact, toBytes, toPrecision, toOrdinal
- Calculations: sum, average, round, percentage, ratio
- Conversions: fromString, fromCurrency, fromBytes
- Utilities: random, step, interpolate

**Memo Module** (~8 functions):
- memoize, memoizeBy, memoizeAsync
- ttlCache, lruCache, weakCache
- clearCache, invalidateMany, invalidateWhere, invalidateAll

**Lens Module** (~8 functions):
- lens, prop, path, index, optional
- view, set, over
- compose

**Compare Module** (~12 functions):
- ascending, descending, natural, byKey
- compose, reverse, nullsFirst, nullsLast, withTiebreaker
- byDate, byNumber, byString, byBoolean
- caseInsensitive, localeCompare

**Function Module** (~15 functions):
- Conditionals: ifElse, when, unless, cond
- Composition: compose, converge, juxt, ap
- Partial: partial, partialRight, flip, unary, binary, nAry
- Control: tap, tryCatch, memoize

**Total Estimated**: ~130 additional function decision trees needed

## How to Complete

### For Each Module

1. **Reference the source code**: Check `src/<module>/index.ts` for exported functions
2. **Create function file**: `docs/decision-trees/<module>/<function>.md`
3. **Follow the template** (see README.md)
4. **Regenerate**: `bun run generate-llm`
5. **Commit**: Include both `.md` file and updated `llm.txt`

### Example Workflow

```bash
# 1. Create new function tree
vim docs/decision-trees/option/some.md

# 2. Write decision tree following template

# 3. Regenerate llm.txt
bun run generate-llm

# 4. Verify output
git diff llm.txt

# 5. Commit
git add docs/decision-trees/option/some.md llm.txt
git commit -m "docs: add decision tree for Option.some"
```

### Batch Creation Strategy

For maximum efficiency when completing a module:

1. **Read all function implementations** in `src/<module>/`
2. **Create all `.md` files** for the module at once
3. **Regenerate once**: `bun run generate-llm`
4. **Single commit** per module

## Benefits Delivered

1. **LLM-Optimized**: `llm.txt` is perfect for AI assistants to understand when to use each function
2. **Human-Readable**: Decision trees are intuitive visual guides
3. **Maintainable**: Each tree is a small, focused file
4. **Automated**: Script ensures consistency and ease of updates
5. **Extensible**: Easy to add new functions and modules
6. **Version Controlled**: Small, reviewable diffs

## Files Modified

- Created: `docs/decision-trees/` directory with 34 files
- Created: `scripts/generate-llm-txt.ts`
- Modified: `package.json` (added `generate-llm` script)
- Generated: `llm.txt` (65KB, 2387 lines)

## Current llm.txt Stats

- **Size**: 65.72 KB
- **Lines**: 2,387
- **Functions Documented**: 19 (Result module)
- **Modules**: 13 (all with module trees)
- **Completion**: ~12% (19 of ~150 functions)

## Priority for Completion

Based on usage frequency, suggest this order:

1. **Option** (commonly used, pairs with Result)
2. **Async** (real-world async patterns)
3. **Predicate** (filtering is common)
4. **Validation** (forms and data validation)
5. **Object** (nested data manipulation)
6. **String** (formatting and validation)
7. **Number** (formatting and calculations)
8. **Collection** (advanced operations)
9. **Function** (advanced FP patterns)
10. **Lens** (advanced immutable updates)
11. **Compare** (complex sorting)
12. **Memo** (performance optimization)

## Usage Examples

### For Developers
```bash
# Quick lookup
cat docs/decision-trees/result/map.md

# Full reference
cat llm.txt | less
```

### For LLMs (AI Assistants)
The `llm.txt` file can be provided to LLMs as context for:
- Code generation
- Function recommendations
- API guidance
- Pattern suggestions

Example prompt:
> "Using the Receta decision trees, help me choose the right function to safely parse JSON and transform the result."

The LLM can then walk the decision tree to recommend:
`Result.tryCatch(() => JSON.parse(str))` → `map(transform)` → `unwrapOr(default)`

## Conclusion

The decision tree system is **functional and proven** with the Result module as a complete reference implementation. The remaining work is primarily mechanical: creating 130 more function-level decision trees following the established pattern.

**Next Steps**:
1. Complete Option module (highest priority)
2. Complete Async module
3. Continue through remaining modules by priority
4. Consider automation for generating initial templates from source code

---

**Created**: 2026-01-23
**Status**: Foundation Complete, Expansion In Progress
