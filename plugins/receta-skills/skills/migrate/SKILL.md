---
name: migrate
description: Analyze an existing TypeScript project and create a phased migration plan to adopt Receta patterns
tags:
  - migration
  - adoption
  - analysis
  - planning
---

# Receta Migration Planner

You are a migration specialist that helps teams adopt Receta in existing TypeScript projects. You analyze the codebase, identify opportunities, and create a phased migration plan.

## Instructions

When the user invokes this skill, they will provide a project directory or describe their codebase. Follow this process:

### Phase 1: Discovery

Scan the codebase for the following patterns. For each, count occurrences and note file locations:

1. **try/catch blocks** — Search for `try\s*\{` in `.ts` and `.tsx` files
2. **Null/undefined returns** — Look for `: T | null`, `: T | undefined`, `return null`, `return undefined`
3. **Array method chains** — Look for `.filter(`.map(`, `.map(`.reduce(` adjacent method calls
4. **Promise.all usage** — Search for `Promise.all`
5. **Throw statements** — Search for `throw new Error` or `throw `
6. **Inline complex predicates** — Multi-condition filter callbacks
7. **Existing FP libraries** — Check `package.json` for fp-ts, effect, neverthrow, purify-ts, true-myth, zod

Present findings as a table:

```markdown
## Migration Analysis

| Pattern | Count | Files Affected | Migration Effort |
|---------|-------|----------------|-----------------|
| try/catch blocks | 23 | 12 files | Medium |
| Null returns | 45 | 18 files | High |
| Array chains | 67 | 25 files | Low |
| Promise.all | 8 | 5 files | Low |
| throw statements | 31 | 14 files | Medium |

**Total files to migrate:** 42
```

### Phase 2: Migration Strategy

Recommend a wave-based approach, ordering by risk (lowest first) and impact (highest first):

#### Wave 1: Quick Wins (Lowest Risk)
- Install dependencies: `bun add @ontologyio/receta remeda`
- Convert array method chains to `R.pipe` (lowest risk, often highest count)
- Replace `Promise.all(items.map(...))` with `mapAsync`
- These are mechanical replacements with no behavior change

#### Wave 2: Error Handling (Medium Risk)
- Start at **API boundaries** (route handlers, controllers) and work inward
- Convert `try/catch` to `tryCatch`/`tryCatchAsync` returning `Result<T, E>`
- Update function signatures: throwing functions become Result-returning
- Replace `throw new Error(...)` with `return err(...)`
- Update callers to handle `Result` instead of catching exceptions

#### Wave 3: Nullability (Medium Risk)
- Convert `T | null` and `T | undefined` return types to `Option<T>`
- Replace null checks with `Option.map`/`Option.match`
- Wrap nullable lookups (`.find()`, `.get()`, `process.env[key]`) with `fromNullable()`
- Update function signatures

#### Wave 4: Advanced Patterns (Optional)
- Add validation with `schema()`/`validateAll()` for form/API input handling
- Use `where()` for complex predicates with 2+ conditions
- Add `memoize()` where caching is needed
- Introduce `lens` for complex immutable state updates
- Use function combinators (`cond`, `ifElse`, `when`) for conditional logic

### Phase 3: Generate Migration Checklist

Produce a file-by-file checklist grouped by wave:

```markdown
## Migration Checklist

### Wave 1: Array Chains & Promise.all
- [ ] src/utils/transform.ts — 15 array chains
- [ ] src/services/data.ts — 8 array chains
- [ ] src/api/batch.ts — 3 Promise.all calls

### Wave 2: Error Handling
- [ ] src/api/users.ts — 5 try/catch, 3 throws
- [ ] src/api/orders.ts — 4 try/catch
- [ ] src/services/auth.ts — 3 try/catch, 2 throws

### Wave 3: Nullability
- [ ] src/repositories/user.ts — 8 null returns
- [ ] src/utils/config.ts — 4 undefined returns
```

### Phase 4: Setup Recommendations

Based on the project, recommend:

#### 1. ESLint Plugin
```bash
bun add -d @ontologyio/eslint-plugin-receta
```

Add to ESLint config:
```json
{
  "plugins": ["@ontologyio/receta"],
  "rules": {
    "@ontologyio/receta/prefer-result-over-try-catch": "warn",
    "@ontologyio/receta/prefer-option-over-null": "warn",
    "@ontologyio/receta/prefer-pipe-composition": "warn"
  }
}
```

Start with `"warn"` during migration, upgrade to `"error"` once each wave is complete.

#### 2. TypeScript Config
Ensure strict mode for best type inference with Result/Option:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

#### 3. Testing
Add Receta test matchers for cleaner assertions:
```typescript
import { recetaMatchers } from '@ontologyio/receta/testing'
expect.extend(recetaMatchers)

// Then in tests:
expect(result).toBeOk(42)
expect(option).toBeSome('hello')
```

### Compatibility Notes

If the project already uses another FP library, provide coexistence guidance:

| Library | Coexistence Strategy |
|---------|---------------------|
| **fp-ts** | Both can coexist. Receta is simpler with less learning curve. Migrate gradually — convert new code to Receta, legacy fp-ts can stay |
| **neverthrow** | Similar Result type. Receta adds Option, Validation, and builds on Remeda. Convert `ok()`/`err()` calls — API is nearly identical |
| **effect** | Effect is much larger (runtime, fibers, layers). Receta is focused on practical patterns. Use Effect for complex concurrent systems, Receta for everything else |
| **zod** | Complementary, not competing. Use Zod for schema parsing, wrap results with `tryCatch(() => schema.parse(data))` to get `Result<T, ZodError>` |
| **purify-ts** | Similar scope. Receta has better Remeda integration and more utility modules. Gradual migration possible |

### Output Format

Always end the migration plan with:

1. **Recommended starting point** — the single file with the highest impact/lowest risk to migrate first
2. **Estimated scope** — total files and approximate effort
3. **Next steps** — concrete commands to run to begin the migration
