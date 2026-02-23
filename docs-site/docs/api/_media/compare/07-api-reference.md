# API Reference & Quick Lookup

Complete catalog of all Compare module functions with signatures and quick examples.

## Decision Tree: Which Function Do I Need?

```
What do you want to sort?

├─ Single field, one direction
│  ├─ Numbers, low→high ............... ascending(fn)
│  ├─ Numbers, high→low ............... descending(fn)
│  ├─ Dates, oldest→newest ............ byDate(fn)
│  ├─ Strings, A→Z .................... ascending(fn)
│  ├─ Strings with numbers ............ natural(fn)
│  ├─ Boolean, false→true ............. byBoolean(fn)
│  └─ Object property directly ........ byKey(key)
│
├─ Multiple fields (multi-level)
│  ├─ 2 levels ........................ withTiebreaker(primary, secondary)
│  └─ 3+ levels ....................... compose(first, second, third, ...)
│
├─ String handling
│  ├─ Case-insensitive ................ caseInsensitive(fn)
│  └─ Locale-aware (i18n) ............. localeCompare(fn, locale)
│
├─ Null handling
│  ├─ Nulls at start .................. nullsFirst(comparator)
│  └─ Nulls at end .................... nullsLast(comparator)
│
└─ Modify existing comparator
   └─ Reverse direction ............... reverse(comparator)
```

## Type Definitions

```typescript
// Core comparator type
type Comparator<T> = (a: T, b: T) => number

// String comparison options
interface StringCompareOptions {
  caseSensitive?: boolean  // default: true
  locale?: string          // default: undefined
}

// Helper types
type Nullable<T> = T | null | undefined
type ComparableExtractor<T, C> = (value: T) => C
```

## Basic Comparators

### ascending()

Sort values in ascending order (low to high).

**Signature:**
```typescript
function ascending<T, C extends number | string | Date>(
  fn: (value: T) => C
): Comparator<T>
```

**Example:**
```typescript
products.sort(ascending(p => p.price))
// => [25, 80, 120, 300]
```

**Use for:** Numbers (low→high), strings (A→Z), dates (oldest→newest)

---

### descending()

Sort values in descending order (high to low).

**Signature:**
```typescript
function descending<T, C extends number | string | Date>(
  fn: (value: T) => C
): Comparator<T>
```

**Example:**
```typescript
products.sort(descending(p => p.price))
// => [300, 120, 80, 25]
```

**Use for:** Numbers (high→low), strings (Z→A), dates (newest→oldest)

---

### natural()

Sort strings naturally, handling embedded numbers correctly.

**Signature:**
```typescript
function natural<T>(fn: (value: T) => string): Comparator<T>
```

**Example:**
```typescript
files.sort(natural(f => f.name))
// => ['file1.txt', 'file2.txt', 'file10.txt']
//    (not 'file1.txt', 'file10.txt', 'file2.txt')
```

**Use for:** File names, version numbers, invoice IDs

---

### byKey()

Sort objects by a property key.

**Signature:**
```typescript
function byKey<T, K extends keyof T>(key: K): Comparator<T>
```

**Example:**
```typescript
products.sort(byKey('price'))
// Equivalent to: ascending(p => p.price)
```

**Use for:** Quick property-based sorting

---

## Combinators

### compose()

Combine multiple comparators for multi-level sorting.

**Signature:**
```typescript
function compose<T>(...comparators: Comparator<T>[]): Comparator<T>
```

**Example:**
```typescript
issues.sort(
  compose(
    ascending(i => i.status),
    descending(i => i.priority),
    byDate(i => i.createdAt)
  )
)
```

**Use for:** 3+ level sorting, complex business logic

---

### reverse()

Reverse the order of any comparator.

**Signature:**
```typescript
function reverse<T>(comparator: Comparator<T>): Comparator<T>
```

**Example:**
```typescript
const oldestFirst = byDate(e => e.date)
const newestFirst = reverse(oldestFirst)
```

**Use for:** Toggle asc/desc, invert existing comparator

---

### nullsFirst()

Place null/undefined values at the beginning.

**Signature:**
```typescript
function nullsFirst<T>(
  comparator: Comparator<Nullable<T>>
): Comparator<Nullable<T>>
```

**Example:**
```typescript
tasks.sort(nullsFirst(ascending(t => t.assignee ?? '')))
// => [null, null, 'alice', 'bob']
```

**Use for:** Unassigned items first, missing data needs attention

---

### nullsLast()

Place null/undefined values at the end.

**Signature:**
```typescript
function nullsLast<T>(
  comparator: Comparator<Nullable<T>>
): Comparator<Nullable<T>>
```

**Example:**
```typescript
users.sort(nullsLast(ascending(u => u.lastLogin ?? new Date(0))))
// => [active users..., null, null]
```

**Use for:** Active/valid items before inactive/invalid

---

### withTiebreaker()

Explicit two-level sorting.

**Signature:**
```typescript
function withTiebreaker<T>(
  primary: Comparator<T>,
  tiebreaker: Comparator<T>
): Comparator<T>
```

**Example:**
```typescript
players.sort(
  withTiebreaker(
    descending(p => p.score),
    ascending(p => p.completionTime)
  )
)
```

**Use for:** Exactly 2 levels (more explicit than compose)

---

## Type-Specific Comparators

### byDate()

Sort Date objects chronologically.

**Signature:**
```typescript
function byDate<T>(fn: (value: T) => Date): Comparator<T>
```

**Example:**
```typescript
events.sort(byDate(e => e.occurredAt))
// => Oldest to newest
```

**Use for:** Timestamps, event timelines, logs

---

### byNumber()

Sort numbers with NaN/Infinity handling.

**Signature:**
```typescript
function byNumber<T>(fn: (value: T) => number): Comparator<T>
```

**Example:**
```typescript
metrics.sort(byNumber(m => m.value))
// NaN sorted to end, Infinity as largest
```

**Use for:** Metrics, scores, prices (when NaN possible)

---

### byString()

Sort strings with case/locale options.

**Signature:**
```typescript
function byString<T>(
  fn: (value: T) => string,
  options?: StringCompareOptions
): Comparator<T>
```

**Example:**
```typescript
// Case-insensitive
users.sort(byString(u => u.name, { caseSensitive: false }))

// Locale-aware
cities.sort(byString(c => c.name, { locale: 'de-DE' }))
```

**Use for:** Names, titles (when case/locale matters)

---

### byBoolean()

Sort boolean values (false < true).

**Signature:**
```typescript
function byBoolean<T>(fn: (value: T) => boolean): Comparator<T>
```

**Example:**
```typescript
tasks.sort(byBoolean(t => t.completed))
// => [incomplete..., complete...]

// Reverse for complete first
tasks.sort(reverse(byBoolean(t => t.completed)))
```

**Use for:** Flags, toggles, binary states

---

## Advanced Comparators

### caseInsensitive()

Case-insensitive string sorting.

**Signature:**
```typescript
function caseInsensitive<T>(fn: (value: T) => string): Comparator<T>
```

**Example:**
```typescript
files.sort(caseInsensitive(f => f.name))
// 'App.tsx' and 'app.tsx' treated equally
```

**Use for:** Filenames, usernames, tags

---

### localeCompare()

Locale-aware string sorting.

**Signature:**
```typescript
function localeCompare<T>(
  fn: (value: T) => string,
  locale: string
): Comparator<T>
```

**Example:**
```typescript
names.sort(localeCompare(n => n, 'de-DE'))
// Correctly handles ä, ö, ü
```

**Use for:** Internationalized content, multilingual apps

---

## Cheat Sheet

### I want to...

| Task | Use |
|------|-----|
| Sort numbers low→high | `ascending(x => x)` |
| Sort numbers high→low | `descending(x => x)` |
| Sort dates oldest→newest | `byDate(x => x.date)` |
| Sort dates newest→oldest | `reverse(byDate(x => x.date))` |
| Sort strings A→Z | `ascending(x => x)` |
| Sort strings case-insensitive | `caseInsensitive(x => x)` |
| Sort file names (file2 before file10) | `natural(x => x.name)` |
| Sort by property | `byKey('propertyName')` |
| Sort by multiple fields | `compose(first, second, third)` |
| Reverse any sort | `reverse(comparator)` |
| Nulls at start | `nullsFirst(comparator)` |
| Nulls at end | `nullsLast(comparator)` |
| Incomplete tasks first | `byBoolean(t => t.completed)` |
| Completed tasks first | `reverse(byBoolean(t => t.completed))` |
| German/French names correctly | `localeCompare(x => x, 'de-DE')` |

### Common Combinations

```typescript
// Status → Priority → Date
compose(
  ascending(x => x.status),
  descending(x => x.priority),
  byDate(x => x.createdAt)
)

// Unassigned first → Priority
compose(
  nullsFirst(ascending(x => x.assignee ?? '')),
  descending(x => x.priority)
)

// Active first → Recent
compose(
  reverse(byBoolean(x => x.isActive)),
  descending(x => x.lastActivity)
)

// Category → Case-insensitive name
compose(
  ascending(x => x.category),
  caseInsensitive(x => x.name)
)
```

## Quick Reference

### Signatures at a Glance

```typescript
// Basic
ascending<T>(fn: (v: T) => number | string | Date): Comparator<T>
descending<T>(fn: (v: T) => number | string | Date): Comparator<T>
natural<T>(fn: (v: T) => string): Comparator<T>
byKey<T, K extends keyof T>(key: K): Comparator<T>

// Combinators
compose<T>(...comparators: Comparator<T>[]): Comparator<T>
reverse<T>(comparator: Comparator<T>): Comparator<T>
nullsFirst<T>(comparator: Comparator<Nullable<T>>): Comparator<Nullable<T>>
nullsLast<T>(comparator: Comparator<Nullable<T>>): Comparator<Nullable<T>>
withTiebreaker<T>(primary: Comparator<T>, tiebreaker: Comparator<T>): Comparator<T>

// Type-specific
byDate<T>(fn: (v: T) => Date): Comparator<T>
byNumber<T>(fn: (v: T) => number): Comparator<T>
byString<T>(fn: (v: T) => string, options?: StringCompareOptions): Comparator<T>
byBoolean<T>(fn: (v: T) => boolean): Comparator<T>

// Advanced
caseInsensitive<T>(fn: (v: T) => string): Comparator<T>
localeCompare<T>(fn: (v: T) => string, locale: string): Comparator<T>
```

## Related Docs

- **[Overview](./00-overview.md)** - Why Compare? When to use?
- **[Basic Comparators](./01-basic-comparators.md)** - ascending, descending, natural
- **[Combinators](./02-combinators.md)** - compose, reverse, nulls
- **[Type-Specific](./03-type-specific.md)** - byDate, byNumber, byString, byBoolean
- **[Advanced](./04-advanced.md)** - caseInsensitive, localeCompare
- **[Patterns](./05-patterns.md)** - Real-world recipes
- **[Migration](./06-migration.md)** - From Array.sort()
