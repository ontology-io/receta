# eslint-plugin-receta

ESLint plugin to enforce **Receta/Remeda-first** functional programming patterns with autofix support.

## Installation

```bash
npm install --save-dev eslint-plugin-receta
# or
pnpm add -D eslint-plugin-receta
# or
bun add -D eslint-plugin-receta
```

## Usage

### Flat Config (ESLint 9+)

```javascript
// eslint.config.mjs
import receta from 'eslint-plugin-receta'

export default [
  {
    plugins: {
      receta,
    },
    rules: {
      ...receta.configs.recommended.rules,
    },
  },
]
```

### Legacy Config (.eslintrc)

```json
{
  "plugins": ["receta"],
  "extends": ["plugin:receta/recommended"]
}
```

## Configurations

### `recommended`

Enables all rules with warnings. Safe for gradual adoption.

```javascript
{
  "receta/prefer-result-over-try-catch": "warn",
  "receta/prefer-option-over-null": "warn",
  "receta/prefer-pipe-composition": "warn"
}
```

### `strict`

All rules set to error. Use for new projects or strict enforcement.

```javascript
{
  "receta/prefer-result-over-try-catch": "error",
  "receta/prefer-option-over-null": "error",
  "receta/prefer-pipe-composition": "error"
}
```

## Rules

### ✅ `prefer-result-over-try-catch` 🔧

Enforces using `Result.tryCatch()` instead of try-catch blocks for error handling.

**❌ Bad:**

```typescript
function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    throw e
  }
}
```

**✅ Good:**

```typescript
import { Result } from 'receta/result'

function parseJSON(str: string): Result<any, SyntaxError> {
  return Result.tryCatch(() => JSON.parse(str))
}
```

**Autofix:** Converts simple try-catch blocks to `Result.tryCatch()` and adds necessary imports.

---

### ✅ `prefer-option-over-null` 🔧

Enforces using `Option<T>` instead of `T | null | undefined`.

**❌ Bad:**

```typescript
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}
```

**✅ Good:**

```typescript
import { Option, fromNullable } from 'receta/option'

function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}
```

**Autofix:** Updates return types to `Option<T>` and wraps returns with `fromNullable()`.

---

### ✅ `prefer-pipe-composition` 🔧

Enforces using `R.pipe()` instead of method chaining for array transformations.

**❌ Bad:**

```typescript
const result = arr
  .filter(x => x > 0)
  .map(x => x * 2)
  .sort()
```

**✅ Good:**

```typescript
import * as R from 'remeda'

const result = R.pipe(
  arr,
  R.filter(x => x > 0),
  R.map(x => x * 2),
  R.sort()
)
```

**Autofix:** Converts method chains to `R.pipe()` composition and adds Remeda import.

---

## Philosophy

This plugin enforces the **Receta/Remeda-first** principle:

1. **Check Receta first** — Use Receta modules for error handling, async, validation
2. **Check Remeda second** — Use Remeda for array/object utilities
3. **Vanilla JS/TS last** — Only when Receta/Remeda don't provide the functionality

**Why?**

- **Explicit error handling** — Errors as values, not exceptions
- **Type-safe nullability** — Option eliminates null/undefined bugs
- **Composable transformations** — Pipe for readable data flows
- **Consistent patterns** — Team-wide functional programming standards

## Autofix Safety

All autofixes are designed to be **safe** and **non-breaking**:

- ✅ Preserves existing functionality
- ✅ Adds missing imports automatically
- ✅ Only converts simple patterns (complex cases require manual refactoring)
- ✅ Tested with comprehensive test suites

**Run autofix:**

```bash
npx eslint --fix .
```

## Integration with `eslint-plugin-remeda`

This plugin complements [`eslint-plugin-remeda`](https://github.com/AndreaPontrandolfo/eslint-plugin-remeda):

```javascript
// eslint.config.mjs
import remeda from 'eslint-plugin-remeda'
import receta from 'eslint-plugin-receta'

export default [
  {
    plugins: { remeda, receta },
    rules: {
      ...remeda.configs.recommended.rules,
      ...receta.configs.recommended.rules,
    },
  },
]
```

**Combined coverage:**

- `eslint-plugin-remeda` — Enforces Remeda over vanilla array methods
- `eslint-plugin-receta` — Enforces Result/Option patterns and composition

## Examples

### Refactoring Vanilla Code

**Before:**

```typescript
async function processUsers(ids: string[]) {
  const results = []
  for (const id of ids) {
    try {
      const user = await fetchUser(id)
      if (user && user.age >= 18) {
        results.push(user.name.toUpperCase())
      }
    } catch (e) {
      console.error(e)
    }
  }
  return results
}
```

**After (with autofix):**

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { Option, fromNullable } from 'receta/option'
import { mapAsync } from 'receta/async'

async function processUsers(ids: string[]): Promise<Result<string[], Error>> {
  return R.pipe(
    await mapAsync(ids, id => Result.tryCatch(() => fetchUser(id))),
    Result.collect,
    Result.map(
      R.pipe(
        R.map(fromNullable),
        Option.collect,
        R.filter(u => u.age >= 18),
        R.map(u => u.name.toUpperCase())
      )
    )
  )
}
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [Khaled Maher](https://github.com/ontology-io)
