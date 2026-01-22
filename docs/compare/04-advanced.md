# Advanced Comparators

Advanced comparators provide specialized string sorting for case-insensitive and locale-aware scenarios.

## Overview

| Function | Purpose | Use Case |
|----------|---------|----------|
| `caseInsensitive(fn)` | Ignore case when sorting | Filenames, usernames, search results |
| `localeCompare(fn, locale)` | Culture-aware sorting | International names, multilingual content |

## caseInsensitive()

Sorts strings ignoring case differences (Alice = alice = ALICE).

### Signature

```typescript
function caseInsensitive<T>(fn: (value: T) => string): Comparator<T>
```

### The Problem It Solves

Default string sorting is case-sensitive, with uppercase coming before lowercase:

```typescript
// ❌ Case-sensitive (default)
['banana', 'Apple', 'cherry', 'BANANA'].sort()
// => ['BANANA', 'Apple', 'banana', 'cherry']
//     ^ Uppercase first (not intuitive for users)
```

```typescript
// ✅ Case-insensitive
import { caseInsensitive } from 'receta/compare'

['banana', 'Apple', 'cherry', 'BANANA'].sort(caseInsensitive(x => x))
// => ['Apple', 'banana', 'BANANA', 'cherry']
//     ^ Alphabetical regardless of case
```

### Examples

#### File Browser

```typescript
import { caseInsensitive } from 'receta/compare'

const files = [
  'README.md',
  'index.ts',
  'App.tsx',
  'package.json',
  'API.md'
]

// Case-sensitive (default) - uppercase first
files.sort()
// => ['API.md', 'App.tsx', 'README.md', 'index.ts', 'package.json']

// Case-insensitive - truly alphabetical
files.sort(caseInsensitive(x => x))
// => ['API.md', 'App.tsx', 'index.ts', 'package.json', 'README.md']
```

#### User Directory

```typescript
interface User {
  username: string
  displayName: string
}

const users: User[] = [
  { username: 'alice', displayName: 'Alice Smith' },
  { username: 'BOB', displayName: 'Bob Jones' },
  { username: 'Charlie', displayName: 'Charlie Brown' }
]

// Sort by username (case-insensitive)
users.sort(caseInsensitive(u => u.username))
// => [alice, BOB, Charlie] (alphabetical)
```

#### Search Results

```typescript
interface SearchResult {
  title: string
  relevance: number
}

// Sort alphabetically (case-insensitive) after filtering
const results = searchResults
  .filter(r => r.relevance > 0.5)
  .sort(caseInsensitive(r => r.title))
```

#### Tags/Labels

```typescript
interface Tag {
  name: string
  count: number
}

const tags: Tag[] = [
  { name: 'TypeScript', count: 50 },
  { name: 'javascript', count: 100 },
  { name: 'REACT', count: 75 }
]

// Alphabetical tag list (case-insensitive)
tags.sort(caseInsensitive(t => t.name))
// => [javascript, REACT, TypeScript]
```

### Real-World: GitHub Repository List

```typescript
interface Repository {
  name: string
  stars: number
  language: string
}

// Sort repos by name (case-insensitive)
repos.sort(caseInsensitive(r => r.name))

// Multi-level: language (case-insensitive), then stars (descending)
repos.sort(
  compose(
    caseInsensitive(r => r.language),
    descending(r => r.stars)
  )
)
```

### Real-World: Dropdown Options

```typescript
interface SelectOption {
  label: string
  value: string
}

// Sort dropdown options alphabetically (case-insensitive)
options.sort(caseInsensitive(o => o.label))
```

### When to Use

✅ **Use caseInsensitive() when:**
- Sorting user-facing lists (files, usernames, titles)
- Search results should appear alphabetically
- Case doesn't carry meaning (README.md = readme.md)
- Better UX than case-sensitive sorting

❌ **Don't use when:**
- Case distinctions matter (API vs api vs Api might be different)
- Sorting code identifiers (case-sensitive language)
- Performance is critical (slight overhead vs regular sort)

---

## localeCompare()

Sorts strings according to language-specific rules and cultural conventions.

### Signature

```typescript
function localeCompare<T>(
  fn: (value: T) => string,
  locale: string
): Comparator<T>
```

### The Problem It Solves

Different languages have different sorting rules:
- **German**: ä, ö, ü have specific positions
- **French**: accented characters (é, è, ê) sort distinctly
- **Spanish**: ñ comes after n
- **Swedish**: å, ä, ö come AFTER z
- **Japanese**: hiragana has specific ordering

```typescript
// ❌ ASCII sorting (wrong for non-English)
['Zürich', 'Berlin', 'Åarhus'].sort()
// => Depends on implementation, often wrong

// ✅ Locale-aware sorting
import { localeCompare } from 'receta/compare'

['Zürich', 'Berlin', 'Åarhus'].sort(localeCompare(x => x, 'de-DE'))
// => Correct German ordering
```

### Examples

#### German Names

```typescript
import { localeCompare } from 'receta/compare'

const germanCities = [
  'Zürich',
  'Berlin',
  'München',
  'Hamburg'
]

// German locale (handles ü, ö correctly)
germanCities.sort(localeCompare(x => x, 'de-DE'))
// => Correct German alphabetical order
```

#### French Accents

```typescript
const frenchNames = [
  'Étienne',
  'Eric',
  'Émile',
  'Éric'
]

// French locale (handles é, è, ê correctly)
frenchNames.sort(localeCompare(x => x, 'fr-FR'))
// => Correct French ordering (é variations grouped correctly)
```

#### Spanish ñ

```typescript
const spanishWords = [
  'mañana',
  'manana',
  'manzana',
  'mano'
]

// Spanish locale (ñ comes after n)
spanishWords.sort(localeCompare(x => x, 'es-ES'))
// => [mano, manana, manzana, mañana]
```

#### Swedish Å, Ä, Ö

```typescript
const swedishWords = [
  'öga',
  'ärlig',
  'adam',
  'åsa'
]

// Swedish locale (å, ä, ö come after z)
swedishWords.sort(localeCompare(x => x, 'sv-SE'))
// => [adam, åsa, ärlig, öga]
```

#### Japanese Hiragana

```typescript
const japaneseWords = [
  'さくら',  // sakura
  'あさひ',  // asahi
  'たけし'   // takeshi
]

// Japanese locale
japaneseWords.sort(localeCompare(x => x, 'ja-JP'))
// => Correct hiragana ordering
```

### Real-World: International User Directory

```typescript
interface User {
  name: string
  country: string
  locale: string
}

// Sort users by their locale
function sortUsersByLocale(users: User[]): User[] {
  // Group by locale, sort within each group
  const grouped = R.groupBy(users, u => u.locale)

  return Object.entries(grouped).flatMap(([locale, users]) =>
    users.sort(localeCompare(u => u.name, locale))
  )
}
```

### Real-World: Multilingual Product Catalog

```typescript
interface Product {
  name: string
  nameTranslations: Record<string, string>
}

function sortProductsForLocale(
  products: Product[],
  locale: string
): Product[] {
  return products.sort(
    localeCompare(p => p.nameTranslations[locale] || p.name, locale)
  )
}

// German users see German-sorted names
sortProductsForLocale(products, 'de-DE')

// French users see French-sorted names
sortProductsForLocale(products, 'fr-FR')
```

### Real-World: Address Book

```typescript
interface Contact {
  firstName: string
  lastName: string
  country: string
}

function sortContacts(contacts: Contact[], userLocale: string) {
  return contacts.sort(
    compose(
      localeCompare(c => c.lastName, userLocale),
      localeCompare(c => c.firstName, userLocale)
    )
  )
}
```

### Locale Codes

Common BCP 47 language tags:

| Locale | Language | Notes |
|--------|----------|-------|
| `en-US` | English (US) | Default for most apps |
| `en-GB` | English (UK) | Different from US |
| `de-DE` | German (Germany) | Handles ä, ö, ü |
| `fr-FR` | French (France) | Handles accents |
| `es-ES` | Spanish (Spain) | Handles ñ |
| `it-IT` | Italian | |
| `pt-BR` | Portuguese (Brazil) | |
| `zh-CN` | Chinese (Simplified) | |
| `ja-JP` | Japanese | |
| `ko-KR` | Korean | |
| `ar-SA` | Arabic (Saudi Arabia) | Right-to-left |
| `sv-SE` | Swedish | å, ä, ö after z |
| `da-DK` | Danish | |
| `nl-NL` | Dutch | |
| `pl-PL` | Polish | |

### When to Use

✅ **Use localeCompare() when:**
- Building international/multilingual applications
- Sorting user-generated content in their language
- Displaying names, addresses, or text to users
- Correct cultural sorting matters

❌ **Don't use when:**
- All content is ASCII/English only
- Sorting code/technical identifiers
- Performance is critical (locale comparison is slower)
- Default sorting is acceptable

---

## Combining Advanced Comparators

### Example: Multilingual File Browser

```typescript
interface FileEntry {
  name: string
  type: 'directory' | 'file'
  locale: string
}

function sortFiles(files: FileEntry[], userLocale: string) {
  return files.sort(
    compose(
      ascending(f => f.type === 'directory' ? 0 : 1), // Directories first
      localeCompare(f => f.name, userLocale)         // Then locale-aware by name
    )
  )
}
```

### Example: International Leaderboard

```typescript
interface Player {
  name: string
  score: number
  country: string
}

// Sort by score, then name (locale-aware)
function sortLeaderboard(players: Player[], locale: string) {
  return players.sort(
    compose(
      descending(p => p.score),
      localeCompare(p => p.name, locale)
    )
  )
}
```

## Performance Considerations

### Case-Insensitive

```typescript
// caseInsensitive() converts to lowercase internally
// Slight overhead, but usually negligible

// For very large lists, consider:
const normalized = items.map(item => ({
  ...item,
  lowerName: item.name.toLowerCase()
}))
normalized.sort(ascending(x => x.lowerName))
```

### Locale-Aware

```typescript
// localeCompare() is slower than simple string comparison
// Consider caching if sorting frequently:

const collator = new Intl.Collator('de-DE')
items.sort((a, b) => collator.compare(a.name, b.name))

// Or use localeCompare() for clarity (wraps Collator internally)
items.sort(localeCompare(x => x.name, 'de-DE'))
```

## Comparison: When to Use Which

| Scenario | Use | Example |
|----------|-----|---------|
| English filenames | `caseInsensitive()` | README.md, app.tsx |
| International names | `localeCompare()` | Müller, José, 佐藤 |
| Tags/labels (EN) | `caseInsensitive()` | JavaScript, REACT |
| Multilingual content | `localeCompare()` | Product names, addresses |
| User directory (EN) | `caseInsensitive()` | alice, Bob, CHARLIE |
| User directory (i18n) | `localeCompare()` | André, Björn, Željko |

## Next Steps

- **[Patterns & Recipes](./05-patterns.md)** - Real-world solutions and recipes
- **[Migration Guide](./06-migration.md)** - From Array.sort() to Compare
- **[API Reference](./07-api-reference.md)** - Complete function catalog
