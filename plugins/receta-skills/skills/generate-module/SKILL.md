---
name: generate-module
description: Scaffold a new Receta-style module with types, constructors, guards, transformers, tests, and barrel export
tags:
  - scaffold
  - module
  - generator
  - boilerplate
---

# Receta Module Generator

You are a code generator that scaffolds new Receta-style modules following the exact patterns established in the existing codebase.

## Instructions

When the user invokes this skill, they will provide:
- A module name (e.g., "state", "stream", "cache")
- A brief description of what the module does
- Optionally, a list of functions the module should include

### Step 1: Gather Requirements

If not already provided, ask the user for:
1. **Module name** (lowercase, single word or kebab-case)
2. **Core type** — the primary discriminated union type the module operates on (like `Result<T, E>` or `Option<T>`)
3. **Variant names** — the tag names for the union (like `Ok`/`Err` or `Some`/`None`)
4. **Key operations** — list of functions (e.g., map, flatMap, filter, match, unwrap)
5. **Target directory** — defaults to `src/<module-name>/`

### Step 2: Generate the Module Structure

Create the following files:

```
<module-name>/
  types.ts
  constructors.ts
  guards.ts
  <operation>/index.ts     (one per operation)
  index.ts
  __tests__/
    constructors.test.ts
    guards.test.ts
    transformers.test.ts
```

### Step 3: File Templates

#### types.ts

```typescript
/**
 * <ModuleName> type - <description>.
 *
 * Uses a discriminated union with `_tag` for type narrowing.
 *
 * @example
 * ```typescript
 * import type { <TypeName> } from '@ontologyio/receta/<module-name>'
 *
 * const value: <TypeName><number, string> = { _tag: '<VariantA>', value: 42 }
 * ```
 */

export interface <VariantA><T> {
  readonly _tag: '<VariantA>'
  readonly value: T
}

export interface <VariantB><E> {
  readonly _tag: '<VariantB>'
  readonly error: E
}

export type <TypeName><T, E> = <VariantA><T> | <VariantB><E>
```

#### constructors.ts

```typescript
import type { <VariantA>, <VariantB> } from './types'

/**
 * Creates a <VariantA> instance.
 *
 * @example
 * ```typescript
 * <variantA>(42) // => { _tag: '<VariantA>', value: 42 }
 * ```
 */
export function <variantA><T>(value: T): <VariantA><T> {
  return { _tag: '<VariantA>', value }
}

/**
 * Creates a <VariantB> instance.
 *
 * @example
 * ```typescript
 * <variantB>('error') // => { _tag: '<VariantB>', error: 'error' }
 * ```
 */
export function <variantB><E>(error: E): <VariantB><E> {
  return { _tag: '<VariantB>', error }
}
```

#### guards.ts

```typescript
import type { <TypeName>, <VariantA>, <VariantB> } from './types'

/**
 * Type guard for <VariantA>.
 */
export function is<VariantA><T, E>(value: <TypeName><T, E>): value is <VariantA><T> {
  return value._tag === '<VariantA>'
}

/**
 * Type guard for <VariantB>.
 */
export function is<VariantB><T, E>(value: <TypeName><T, E>): value is <VariantB><E> {
  return value._tag === '<VariantB>'
}
```

#### Transformer template (e.g., map/index.ts)

Each transformer gets its own directory with an `index.ts`:

```typescript
import { purry } from '../../utils/purry'
import type { <TypeName> } from '../types'
import { is<VariantA> } from '../guards'
import { <variantA> } from '../constructors'

/**
 * Maps over the <VariantA> value of a <TypeName>.
 *
 * @example
 * ```typescript
 * // Data-first
 * map(<variantA>(5), x => x * 2) // => <VariantA>(10)
 * map(<variantB>('fail'), x => x * 2) // => <VariantB>('fail')
 *
 * // Data-last (in pipe)
 * pipe(
 *   <variantA>(5),
 *   map(x => x * 2)
 * ) // => <VariantA>(10)
 * ```
 */
export function map<T, U, E>(value: <TypeName><T, E>, fn: (v: T) => U): <TypeName><U, E>
export function map<T, U>(fn: (v: T) => U): <E>(value: <TypeName><T, E>) => <TypeName><U, E>
export function map(...args: unknown[]): unknown {
  return purry(mapImpl, args)
}

function mapImpl<T, U, E>(value: <TypeName><T, E>, fn: (v: T) => U): <TypeName><U, E> {
  return is<VariantA>(value) ? <variantA>(fn(value.value)) : value
}
```

#### index.ts (barrel export)

```typescript
/**
 * <ModuleName> module - <description>
 *
 * @module <module-name>
 */

// Types
export type { <TypeName>, <VariantA>, <VariantB> } from './types'

// Constructors
export { <variantA>, <variantB> } from './constructors'

// Type guards
export { is<VariantA>, is<VariantB> } from './guards'

// Transformers
export { map } from './map'
export { flatMap } from './flatMap'
export { match } from './match'
export { unwrap } from './unwrap'
// ... add more as needed
```

#### Test template (__tests__/constructors.test.ts)

```typescript
import { describe, it, expect } from 'vitest'
import { <variantA>, <variantB> } from '../index'

describe('<ModuleName> constructors', () => {
  describe('<variantA>', () => {
    it('creates a <VariantA> with the given value', () => {
      const result = <variantA>(42)
      expect(result).toEqual({ _tag: '<VariantA>', value: 42 })
    })

    it('preserves the value type', () => {
      const result = <variantA>('hello')
      expect(result.value).toBe('hello')
    })
  })

  describe('<variantB>', () => {
    it('creates a <VariantB> with the given error', () => {
      const result = <variantB>('something went wrong')
      expect(result).toEqual({ _tag: '<VariantB>', error: 'something went wrong' })
    })
  })
})
```

#### Test template (__tests__/transformers.test.ts)

```typescript
import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { <variantA>, <variantB>, map, is<VariantA> } from '../index'

describe('<ModuleName>.map', () => {
  describe('data-first', () => {
    it('transforms <VariantA> value', () => {
      expect(map(<variantA>(5), x => x * 2)).toEqual(<variantA>(10))
    })

    it('passes through <VariantB> unchanged', () => {
      expect(map(<variantB>('fail'), x => x * 2)).toEqual(<variantB>('fail'))
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(<variantA>(5), map(x => x * 2))
      expect(result).toEqual(<variantA>(10))
    })
  })
})
```

### Step 4: Post-Generation Checklist

After generating the module, remind the user to:

1. Add the export path to `package.json` under `"exports"`:
   ```json
   "./<module-name>": {
     "import": "./dist/<module-name>/index.js",
     "types": "./dist/<module-name>/index.d.ts"
   }
   ```

2. Run verification:
   ```bash
   bun test
   bun run typecheck
   bun run build
   ```

3. Add documentation in `docs/<module-name>/`

### Naming Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| Type guards | `is*` | `isOk`, `isSome` |
| Constructors | noun (lowercase) | `ok`, `err`, `some`, `none` |
| Transformers | verb | `map`, `flatMap`, `filter` |
| Extractors | `unwrap*` | `unwrap`, `unwrapOr`, `unwrapOrElse` |
| Converters | `to*`, `from*` | `toOption`, `fromNullable` |
| Pattern matching | `match` | `match(value, { VariantA: ..., VariantB: ... })` |
| Collectors | `collect` | `collect(items)` — aggregate array of types |
| Partitioners | `partition` | `partition(items)` — split into [A[], B[]] |

### Key Patterns to Follow

1. **Always use `purry`** for data-first/data-last support
2. **Always use `_tag` discriminant** for type narrowing
3. **Always use `readonly` fields** in type definitions
4. **One file per operation** in its own directory with `index.ts`
5. **JSDoc with `@example`** on every exported function
6. **Both data-first and data-last** tests for every transformer
