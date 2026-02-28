# prefer-pipe-composition

Prefer `R.pipe()` over method chaining for array transformations.

## Rule Details

This rule enforces using Remeda's `pipe()` function instead of native method chaining for array transformations.

**Why?**

- ✅ Data-first AND data-last — Works seamlessly in pipes
- ✅ Better composition — Easier to refactor and test individual steps
- ✅ Consistent style — All transformations use the same pattern
- ✅ Type inference — Better TypeScript type narrowing
- ✅ Tree-shakeable — Only bundle functions you use

## Examples

### ❌ Incorrect

```typescript
const result = arr
  .filter(x => x > 0)
  .map(x => x * 2)
  .sort()

const names = users
  .filter(u => u.active)
  .map(u => u.name)
  .slice(0, 10)
```

### ✅ Correct

```typescript
import * as R from 'remeda'

const result = R.pipe(
  arr,
  R.filter(x => x > 0),
  R.map(x => x * 2),
  R.sort()
)

const names = R.pipe(
  users,
  R.filter(u => u.active),
  R.map(u => u.name),
  R.take(10)
)
```

## Autofix Behavior

This rule automatically converts method chains to `R.pipe()` composition:

**Before:**

```typescript
const result = data
  .filter(x => x.active)
  .map(x => x.value)
  .reduce((sum, n) => sum + n, 0)
```

**After (autofix):**

```typescript
import * as R from 'remeda'

const result = R.pipe(
  data,
  R.filter(x => x.active),
  R.map(x => x.value),
  R.reduce((sum, n) => sum + n, 0)
)
```

## Benefits of Pipe Composition

### 1. Easier Refactoring

Extract pipeline steps into reusable functions:

```typescript
// Method chaining — hard to extract
const result = data.filter(x => x > 0).map(x => x * 2)

// Pipe — easy to extract
const positiveNumbers = R.filter(x => x > 0)
const double = R.map(x => x * 2)

const result = R.pipe(data, positiveNumbers, double)
```

### 2. Better Testing

Test individual transformations in isolation:

```typescript
import { expect, test } from 'bun:test'

const transformUser = R.map(u => ({ ...u, name: u.name.toUpperCase() }))

test('transformUser uppercases names', () => {
  const input = [{ name: 'alice' }]
  const output = transformUser(input)
  expect(output[0].name).toBe('ALICE')
})
```

### 3. Works with Receta Patterns

Combine with Result/Option seamlessly:

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'

const processUsers = R.pipe(
  users,
  R.filter(u => u.active),
  R.map(u => Result.tryCatch(() => validateUser(u))),
  Result.collect, // Collect all Results
  Result.map(R.map(u => u.name))
)
```

## When Not To Use

This rule triggers on **2 or more** chainable array methods. Single method calls are fine:

```typescript
// OK — Single method call
const doubled = arr.map(x => x * 2)

// Flagged — Multiple methods
const result = arr.map(x => x * 2).filter(x => x > 10)
```

**Exception:** Non-array methods are ignored:

```typescript
// OK — String methods (not array transformation)
const result = str.toUpperCase().trim()
```

## Options

This rule has no options.

## Further Reading

- [Remeda Documentation](https://remedajs.com)
- [Pipe Composition Guide](../../../docs/guides/pipe-composition.md)
- [Receta + Remeda Integration](../../../README.md#receta--remeda-integration)
