# Function: symmetricDiff

## When to Use
Find elements that exist in either collection but not both (XOR operation). Useful for detecting discrepancies, finding unique items, and identifying one-sided differences.

## Decision Tree
```
Need to find differences?
│
├─ Items unique to EACH (XOR) ──────────────────────► symmetricDiff()
│
├─ Items in BOTH collections ───────────────────────► intersect()
│
├─ Categorize all changes ──────────────────────────► diff()
│
└─ Merge collections ────────────────────────────────► union()
```

## Examples
```typescript
// Basic symmetric difference
symmetricDiff([1, 2, 3], [2, 3, 4])
// => [1, 4] // 1 only in first, 4 only in second

// Find discrepancies between planned and actual
const planned = [{ id: 1 }, { id: 2 }]
const actual = [{ id: 2 }, { id: 3 }]

symmetricDiff(planned, actual, (a, b) => a.id === b.id)
// => [{ id: 1 }, { id: 3 }]
// id 1 was planned but not executed
// id 3 was executed but not planned

// Compare configurations
const devConfig = ['feature-a', 'feature-b', 'debug-mode']
const prodConfig = ['feature-a', 'feature-b', 'analytics']

const differences = symmetricDiff(devConfig, prodConfig)
// => ['debug-mode', 'analytics']
// Shows features that differ between environments

// Find unsynced data
const localItems = [
  { id: 'a', synced: false },
  { id: 'b', synced: true }
]
const remoteItems = [
  { id: 'b', synced: true },
  { id: 'c', synced: true }
]

const needsSync = pipe(
  localItems,
  symmetricDiff(remoteItems, (a, b) => a.id === b.id)
)
// => [
//   { id: 'a', synced: false }, // local only
//   { id: 'c', synced: true }   // remote only
// ]

// Compare file lists for sync
const localFiles = ['README.md', 'src/index.ts', 'package.json']
const remoteFiles = ['README.md', 'src/index.ts', 'package-lock.json']

const changedFiles = symmetricDiff(localFiles, remoteFiles)
// => ['package.json', 'package-lock.json']
// Files that need to be synced

// Find mismatched permissions
const role1Permissions = ['read', 'write', 'delete']
const role2Permissions = ['read', 'write', 'admin']

const uniquePermissions = symmetricDiff(role1Permissions, role2Permissions)
// => ['delete', 'admin']

// Compare user preferences
const defaultSettings = [
  { key: 'theme', value: 'light' },
  { key: 'notifications', value: true }
]
const userSettings = [
  { key: 'theme', value: 'light' },
  { key: 'language', value: 'en' }
]

const customized = symmetricDiff(
  defaultSettings,
  userSettings,
  (a, b) => a.key === b.key
)
// => [
//   { key: 'notifications', value: true }, // default only
//   { key: 'language', value: 'en' }       // user only
// ]

// Audit trail - find changes
const beforeUpdate = ['admin', 'editor', 'viewer']
const afterUpdate = ['admin', 'editor', 'contributor']

const changes = symmetricDiff(beforeUpdate, afterUpdate)
// => ['viewer', 'contributor']
// viewer was removed, contributor was added
```

## Related Functions
- **Full categorization**: `diff()` - added/updated/removed/unchanged
- **Common only**: `intersect()` - items in both
- **Merge**: `union()` - combine without duplicates
