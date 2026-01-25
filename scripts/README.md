# Function Extraction Script

Extract specific functions from the Receta library along with all their dependencies, maintaining the original file structure to preserve working imports.

## Usage

```bash
bun scripts/extract-functions.ts <function-name> [<function-name> ...]
```

## Examples

### Extract a single function

```bash
bun scripts/extract-functions.ts retry
```

This will extract the `retry` function along with all its dependencies (Result types, constructors, guards, `sleep` helper, `clamp` utility, etc.)

### Extract multiple functions

```bash
bun scripts/extract-functions.ts retry mapAsync timeout
```

Extract multiple functions at once. The script will automatically resolve shared dependencies and avoid duplicates.

### Extract with specific utilities

```bash
bun scripts/extract-functions.ts clamp round toCurrency
```

Extract number utilities and their dependencies.

## Output Structure

The script creates an `output/` directory with:

```
output/
├── package.json          # Minimal package.json with dependencies
├── tsconfig.json         # TypeScript configuration
└── src/                  # Extracted source code
    ├── async/            # Async module (if extracted)
    │   ├── retry/
    │   ├── types.ts
    │   └── index.ts
    ├── result/           # Result module (if needed)
    │   ├── types.ts
    │   ├── constructors/
    │   └── ...
    └── ...
```

The file structure exactly mirrors the original library, ensuring imports work without modification.

## How It Works

1. **Function Discovery**: Searches module index files to locate the requested functions
2. **Dependency Analysis**: Parses TypeScript imports and re-exports using regex
3. **Recursive Collection**: Follows the import chain to gather all dependencies
4. **File Copying**: Maintains the exact directory structure in the output
5. **Package Setup**: Creates a minimal package.json and copies tsconfig.json

## Features

- ✅ Follows re-exports (e.g., `export { retry } from './retry'`)
- ✅ Resolves relative imports (e.g., `import { ok } from '../../result'`)
- ✅ Handles type-only imports
- ✅ Skips external dependencies (like `remeda`) but includes them in package.json
- ✅ Prevents circular dependencies with visited file tracking
- ✅ Maintains exact file structure for working imports

## Verifying the Output

After extraction, verify the code works:

```bash
cd output
bun install       # Install dependencies
bun run typecheck # Verify TypeScript types
```

Create a test file to verify functionality:

```typescript
import { retry } from './src/async/retry/index.js'
import { isOk } from './src/result/guards/index.js'

const result = await retry(async () => {
  return 'success'
})

console.log(isOk(result) ? 'Works!' : 'Failed')
```

## Use Cases

### 1. Minimal Bundle
Extract only the functions you need for a smaller bundle size:

```bash
bun scripts/extract-functions.ts mapAsync filterAsync
```

### 2. Documentation Examples
Extract specific functions to create standalone examples:

```bash
bun scripts/extract-functions.ts retry timeout poll
```

### 3. Function Analysis
Study a function and its dependencies in isolation:

```bash
bun scripts/extract-functions.ts flatMap
```

### 4. Testing
Create a minimal test environment for specific utilities:

```bash
bun scripts/extract-functions.ts clamp inRange percentage
```

## Limitations

- Only extracts TypeScript files (`.ts`), not tests or markdown docs
- Doesn't extract runtime dependencies beyond what's imported
- Requires Bun runtime (uses Bun-specific features)
- Regex-based parsing (doesn't use full TypeScript AST)

## Advanced Usage

The script automatically:
- Resolves both `./relative` and `receta/module` style imports
- Handles barrel exports (index.ts re-exports)
- Tracks visited files to prevent infinite loops
- Preserves the exact import structure

No configuration needed - just specify the functions you want!
