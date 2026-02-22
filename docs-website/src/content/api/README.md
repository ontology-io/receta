# API Reference (Auto-Generated)

⚠️ **DO NOT EDIT FILES IN THIS DIRECTORY MANUALLY**

This directory contains auto-generated API documentation extracted from JSDoc comments in the source code.

## How It Works

1. **Source of Truth**: JSDoc comments in `src/` modules (e.g., `src/result/map/index.ts`)
2. **Generation**: Run `bun run docs:generate` to extract docs using TypeDoc
3. **Output**: MDX files are generated in this directory for Nextra to render

## Updating Documentation

To update API documentation:

1. **Edit JSDoc comments** in the source files (`src/*/`)
2. **Run the generator**:
   ```bash
   bun run docs:generate
   ```
3. **Commit both** source changes and generated MDX files

## Development Workflow

### Watch Mode
For live updates while editing JSDoc:
```bash
bun run docs:watch
```

### Manual Generation
```bash
bun run docs:generate
```

## File Structure

```
api/
├── README.md          # This file
├── _meta.js           # Auto-generated sidebar navigation
├── result.mdx         # Module overview (auto-generated)
├── result/            # Detailed function docs (auto-generated)
│   ├── map.mdx
│   ├── flatMap.mdx
│   └── ...
├── option.mdx
├── option/
│   └── ...
└── ... (other modules)
```

## What Gets Generated

- **Module overviews** (`result.mdx`, `option.mdx`, etc.) - List of exported functions/types
- **Function details** (`result/map.mdx`) - Full JSDoc with:
  - Type signatures (data-first and data-last)
  - Parameter descriptions
  - Return type
  - Examples from `@example` tags
  - Cross-references from `@see` tags

## Technical Details

- **Generator**: [scripts/generate-docs.ts](../../../../scripts/generate-docs.ts)
- **Tool**: TypeDoc with `typedoc-plugin-markdown`
- **Config**: [typedoc.json](../../../../typedoc.json)
- **Last generated**: Check the comment at the top of each `.mdx` file

---

**Remember**: The documentation is only as good as the JSDoc comments in the source code!
