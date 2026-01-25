# Extraction Script Examples

Real-world examples of extracting functions from Receta.

## Example 1: Extract Async Utilities

Extract retry and timeout functions for a resilient API client:

```bash
bun scripts/extract-functions.ts retry timeout sleep
```

**Result**: 28 files extracted including:
- `src/async/retry/` - Retry logic with exponential backoff
- `src/async/timeout/` - Timeout wrapper
- `src/result/` - Result type and utilities (auto-included as dependency)
- `src/number/clamp/` - Used by retry for delay clamping

**Usage**:
```typescript
import { retry, timeout } from './src/async/retry/index.js'
import { isOk } from './src/result/guards/index.js'

// Combine retry + timeout for robust API calls
const fetchWithRetry = async (url: string) => {
  return retry(
    async () => {
      const result = await timeout(
        fetch(url),
        { timeoutMs: 5000 }
      )
      if (isOk(result)) {
        return result.value.json()
      }
      throw new Error('Timeout')
    },
    { maxAttempts: 3, delay: 1000 }
  )
}
```

## Example 2: Extract Number Formatting

Extract currency and percentage formatters for a dashboard:

```bash
bun scripts/extract-functions.ts toCurrency toPercent toCompact
```

**Result**: 31 files extracted including:
- `src/number/toCurrency/` - Currency formatting
- `src/number/toPercent/` - Percentage formatting
- `src/number/toCompact/` - Compact notation (1.2K, 1.5M)
- Shared number utilities and types

**Usage**:
```typescript
import { toCurrency } from './src/number/toCurrency/index.js'
import { toPercent } from './src/number/toPercent/index.js'
import { toCompact } from './src/number/toCompact/index.js'

const revenue = 1234567.89
const growth = 0.156
const users = 45672

console.log('Revenue:', toCurrency(revenue, { currency: 'USD' }))
// => "$1,234,567.89"

console.log('Growth:', toPercent(growth))
// => "15.6%"

console.log('Users:', toCompact(users))
// => "45.7K"
```

## Example 3: Extract Validation Utilities

Extract validation and predicate functions for form processing:

```bash
bun scripts/extract-functions.ts where and or gt lt
```

**Result**: Predicate builders and combinators

**Usage**:
```typescript
import { where, and, gt, lt } from './src/predicate/builders/index.js'

const isAdult = where({ age: gt(18) })
const isInRange = where({
  age: and(gt(18), lt(65))
})

const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 15 },
  { name: 'Charlie', age: 70 }
]

console.log(users.filter(isInRange))
// => [{ name: 'Alice', age: 25 }]
```

## Example 4: Extract Collection Utilities

Extract advanced collection operations:

```bash
bun scripts/extract-functions.ts nest groupByPath indexByUnique
```

**Result**: Collection utilities for data transformation

**Usage**:
```typescript
import { nest } from './src/collection/nest/index.js'
import { groupByPath } from './src/collection/groupByPath/index.js'

const tasks = [
  { id: 1, project: 'web', status: 'todo' },
  { id: 2, project: 'web', status: 'done' },
  { id: 3, project: 'api', status: 'todo' }
]

// Nest by multiple levels
const nested = nest(
  tasks,
  ['project', 'status'],
  (items) => items.length
)
// => { web: { todo: 1, done: 1 }, api: { todo: 1 } }
```

## Example 5: Extract String Utilities

Extract string processing functions:

```bash
bun scripts/extract-functions.ts slugify toKebabCase toCamelCase
```

**Result**: String transformation utilities

**Usage**:
```typescript
import { slugify } from './src/string/slugify/index.js'
import { toKebabCase } from './src/string/toKebabCase/index.js'
import { toCamelCase } from './src/string/toCamelCase/index.js'

const title = 'Hello World Example!'

console.log(slugify(title))      // => "hello-world-example"
console.log(toKebabCase(title))  // => "hello-world-example"
console.log(toCamelCase(title))  // => "helloWorldExample"
```

## Example 6: Minimal Result-Only Bundle

Extract just Result utilities for error handling:

```bash
bun scripts/extract-functions.ts ok err isOk isErr map flatMap
```

**Result**: ~10 files, minimal Result implementation

**Usage**:
```typescript
import { ok, err, isOk } from './src/result/constructors/index.js'
import { map } from './src/result/map/index.js'

const parseJSON = (str: string) => {
  try {
    return ok(JSON.parse(str))
  } catch (e) {
    return err(e)
  }
}

const result = parseJSON('{"name":"Alice"}')
const name = map(result, data => data.name)

if (isOk(name)) {
  console.log(name.value) // => "Alice"
}
```

## Example 7: All Async Utilities

Extract the complete async module:

```bash
bun scripts/extract-functions.ts mapAsync filterAsync parallel retry timeout poll batch debounce throttle
```

**Result**: Complete async module with all utilities

Perfect for:
- Building async utility libraries
- Creating standalone async helpers
- Learning async patterns

## Verifying Extractions

After each extraction:

```bash
cd output
bun install
bun run typecheck  # Verify no TypeScript errors
```

Create a test file:
```bash
echo 'import { retry } from "./src/async/retry/index.js"
const result = await retry(() => Promise.resolve("ok"))
console.log(result)' > test.ts

bun run test.ts
```

## Tips

### Find Available Functions

Search module index files to see what's available:

```bash
# List all async functions
cat src/async/index.ts | grep "export {"

# List all number functions
cat src/number/index.ts | grep "export {"

# List all result functions
cat src/result/index.ts | grep "export {"
```

### Check Dependencies

After extraction, see what was included:

```bash
find output/src -name "*.ts" | wc -l  # Count files
find output/src -type d               # List directories
```

### Bundle Size

Compare extraction vs full library:

```bash
# Full library
du -sh .

# Extracted subset
du -sh output
```

## Common Patterns

### Pattern 1: Error Handling Core
```bash
bun scripts/extract-functions.ts ok err isOk isErr map mapErr flatMap
```

### Pattern 2: Async Core
```bash
bun scripts/extract-functions.ts retry mapAsync filterAsync parallel
```

### Pattern 3: Formatting Suite
```bash
bun scripts/extract-functions.ts toCurrency toPercent toBytes format
```

### Pattern 4: Validation Suite
```bash
bun scripts/extract-functions.ts where and or not gt lt eq
```

### Pattern 5: String Processing
```bash
bun scripts/extract-functions.ts slugify template isEmail isUrl
```
