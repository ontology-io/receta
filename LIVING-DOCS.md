# Living Documentation System

This project uses **living documentation** — API reference docs that automatically update when JSDoc comments in the source code change.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  src/result/map/index.ts  (JSDoc comments)                  │
│                              ↓                               │
│  bun run docs:generate   (TypeDoc + script)                 │
│                              ↓                               │
│  docs-website/src/content/api/result/map.mdx (auto-generated)│
│                              ↓                               │
│  Nextra renders on docs website                             │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Source of Truth: JSDoc Comments

Write comprehensive JSDoc in your source files:

```typescript
/**
 * Maps over the Ok value of a Result.
 *
 * If the Result is Ok, applies the function to its value and returns a new Ok.
 * If the Result is Err, returns the Err unchanged.
 *
 * @param result - The Result to map over
 * @param fn - Function to transform the Ok value
 * @returns A new Result with the transformed value
 *
 * @example
 * ```typescript
 * // Data-first
 * map(ok(5), x => x * 2) // => Ok(10)
 * ```
 *
 * @see mapErr - for transforming the error value
 * @see flatMap - for chaining Results
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>
```

### 2. Generation Script

Run the generator to extract docs:

```bash
bun run docs:generate
```

This script:
1. Runs TypeDoc to extract JSDoc from all `src/` modules
2. Converts TypeDoc markdown to Nextra-compatible MDX
3. Outputs to `docs-website/src/content/api/`

### 3. Auto-Generated MDX

The script generates:
- **Module overviews** (`api/result.mdx`) - Index of all exports
- **Function details** (`api/result/map.mdx`) - Full documentation with:
  - Type signatures (both data-first and data-last)
  - Parameter descriptions
  - Return types
  - Examples
  - Cross-references

### 4. Nextra Renders the Docs

The MDX files are automatically picked up by Nextra and rendered on the documentation website.

## Commands

### Generate Docs

```bash
bun run docs:generate
```

Regenerate all API documentation from current source code.

### Watch Mode (Future Enhancement)

```bash
bun run docs:watch
```

Currently just runs the generator. Future enhancement: watch `src/` and regenerate on changes.

## Workflow

### When Changing Source Code

1. **Edit JSDoc** in source files (`src/result/map/index.ts`)
2. **Run generator**: `bun run docs:generate`
3. **Review changes**: Check the generated MDX in `docs-website/src/content/api/`
4. **Commit both**: Commit source changes AND generated MDX files

### Example Git Workflow

```bash
# 1. Make changes to source code
vim src/result/map/index.ts

# 2. Regenerate docs
bun run docs:generate

# 3. Check what changed
git diff docs-website/src/content/api/result/map.mdx

# 4. Commit both
git add src/result/map/index.ts docs-website/src/content/api/result/
git commit -m "feat(result): improve map() documentation with more examples"
```

## File Structure

```
receta/
├── src/                          # Source code with JSDoc
│   ├── result/
│   │   ├── map/
│   │   │   └── index.ts         # ← Edit JSDoc here
│   │   └── index.ts
│   └── ...
├── docs-website/
│   └── src/content/
│       ├── index.mdx            # Manual: Why Receta?
│       └── api/                 # Auto-generated API reference
│           ├── README.md        # ← Read this!
│           ├── _meta.js         # Auto-generated sidebar
│           ├── result.mdx       # Auto-generated module overview
│           └── result/          # Auto-generated function docs
│               ├── map.mdx
│               ├── flatMap.mdx
│               └── ...
├── scripts/
│   └── generate-docs.ts         # Generation script
├── typedoc.json                 # TypeDoc configuration
└── LIVING-DOCS.md               # This file
```

## Configuration

### TypeDoc Configuration

See [typedoc.json](./typedoc.json):
- Entry points: `src/`
- Output: `docs-temp/` (temporary, gitignored)
- Plugin: `typedoc-plugin-markdown`
- Excludes: tests, node_modules, dist

### Generator Script

See [scripts/generate-docs.ts](./scripts/generate-docs.ts):
- Reads TypeDoc markdown from `docs-temp/`
- Converts to Nextra-compatible MDX
- Adds frontmatter and metadata
- Outputs to `docs-website/src/content/api/`

## Best Practices

### Writing Good JSDoc

✅ **DO:**
- Include `@param` for all parameters
- Include `@returns` describing return value
- Add `@example` with runnable code
- Use `@see` for related functions
- Write clear descriptions explaining behavior

❌ **DON'T:**
- Skip parameter descriptions
- Forget to document error cases
- Use generic examples
- Leave `@example` blocks empty

### Example: Good JSDoc

```typescript
/**
 * Retries an async operation with exponential backoff.
 *
 * Attempts the operation up to `maxAttempts` times, waiting `delay` ms
 * between attempts. If all attempts fail, returns the last error.
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @param options.maxAttempts - Max retry attempts (default: 3)
 * @param options.delay - Initial delay in ms (default: 1000)
 * @returns Result with value or RetryError
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   { maxAttempts: 5, delay: 2000 }
 * )
 *
 * if (isOk(result)) {
 *   console.log('Success:', result.value)
 * } else {
 *   console.error('Failed after retries:', result.error)
 * }
 * ```
 *
 * @see mapAsync - for retry with concurrency control
 */
```

## Troubleshooting

### TypeDoc Warnings

TypeDoc may warn about unresolved links. To fix:

```typescript
// ❌ Unresolved
* @see parseNumber

// ✅ Resolved
* @see {@link parseNumber}
```

### Broken Links in MDX

If links are broken, check:
1. Relative paths in `scripts/generate-docs.ts` conversion logic
2. TypeDoc output structure has changed
3. Module names match between source and output

### Docs Not Updating

1. Delete `docs-temp/` and regenerate
2. Check TypeDoc output: `bunx typedoc`
3. Verify script runs without errors: `bun run docs:generate`

## CI/CD Integration

### Option 1: Commit Generated Docs (Current)

Generated MDX files are committed to git. Pros:
- ✅ Simple workflow
- ✅ Docs always in sync with code
- ✅ No build step needed for docs site

Cons:
- ⚠️ Larger commits
- ⚠️ Potential merge conflicts in generated files

### Option 2: Generate in CI (Future)

Add to CI pipeline:
```yaml
- name: Generate docs
  run: bun run docs:generate

- name: Commit docs
  run: |
    git add docs-website/src/content/api/
    git commit -m "docs: regenerate API reference [skip ci]"
    git push
```

## Future Enhancements

1. **Watch mode**: Auto-regenerate on file changes
2. **Incremental generation**: Only regenerate changed modules
3. **Validation**: Check JSDoc completeness
4. **Preview**: Show docs preview in PR comments
5. **Search indexing**: Index generated docs for search

## Technical Details

- **TypeDoc version**: `^0.28.17`
- **Plugin**: `typedoc-plugin-markdown` `^4.10.0`
- **Output format**: Markdown → MDX
- **Docs framework**: Nextra (Next.js)

## Questions?

- **How to add a new module?** Add to `MODULES` array in `scripts/generate-docs.ts`
- **How to exclude a function?** Add `@internal` JSDoc tag
- **How to customize output?** Edit `scripts/generate-docs.ts` conversion logic

---

**Remember**: Documentation is code. Keep it up to date!
