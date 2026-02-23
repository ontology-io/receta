# Migration Guide: From Lodash/Vanilla JS to Receta Object

Step-by-step guide to migrating from Lodash or vanilla JavaScript object operations to Receta's Object module.

## Why Migrate?

**Before (Lodash):**
- Manual immutability with `cloneDeep`
- No type safety
- Not composable in pipelines
- No Result/Option integration

**After (Receta):**
- Immutable by default
- Full TypeScript support
- Pipeline-friendly
- Integrated error handling

---

## Migration Steps

### Step 1: Replace Deep Get/Set

```typescript
// ❌ Lodash
import _ from 'lodash'

const value = _.get(obj, 'deeply.nested.value', 'default')
_.set(_.cloneDeep(obj), 'deeply.nested.value', 'new')

// ✅ Receta
import { getPath, setPath } from 'receta/object'

const value = pipe(
  obj,
  getPath(['deeply', 'nested', 'value']),
  unwrapOr('default')
)
const updated = setPath(obj, ['deeply', 'nested', 'value'], 'new')
```

### Step 2: Replace Pick/Omit with Mask

```typescript
// ❌ Lodash
const safe = _.pick(user, ['id', 'email'])

// ✅ Receta (security-focused)
const safe = mask(user, ['id', 'email'])
```

### Step 3: Replace mapKeys/mapValues

```typescript
// ❌ Lodash
_.mapKeys(obj, (value, key) => key.toUpperCase())
_.mapValues(obj, (value) => value * 2)

// ✅ Receta (same API)
mapKeys(obj, (key, value) => key.toUpperCase())
mapValues(obj, (value) => value * 2)
```

### Step 4: Replace Deep Merge

```typescript
// ❌ Lodash
_.merge(_.cloneDeep(obj1), obj2, obj3)

// ✅ Receta
deepMerge([obj1, obj2, obj3])
```

### Step 5: Add Validation

```typescript
// ❌ Lodash (no validation)
const config = _.get(data, 'config', {})
// Hope it's the right shape!

// ✅ Receta (with validation)
const config = pipe(
  data,
  getPath(['config']),
  Option.map((c) => validateShape(c, configSchema)),
  Option.flatMap(Result.toOption),
  unwrapOr(defaultConfig)
)
```

---

## Common Patterns

### Pattern: Nested Updates

```typescript
// ❌ Before
const updated = _.cloneDeep(state)
_.set(updated, 'user.profile.name', 'Alice')
return updated

// ✅ After
return setPath(state, ['user', 'profile', 'name'], 'Alice')
```

### Pattern: Safe Access

```typescript
// ❌ Before
const email = _.get(user, 'profile.contact.email')
if (email) {
  sendEmail(email)
}

// ✅ After
pipe(
  user,
  getPath<string>(['profile', 'contact', 'email']),
  Option.tap(sendEmail)
)
```

### Pattern: Transformation Pipeline

```typescript
// ❌ Before
let result = _.cloneDeep(apiResponse)
result = _.mapKeys(result, (v, k) => _.camelCase(k))
result = _.omit(result, ['_internal', '_cache'])
result = _.mapValues(result, (v) => typeof v === 'string' ? v.trim() : v)

// ✅ After
const result = pipe(
  apiResponse,
  mapKeys((key) => toCamelCase(key)),
  filterKeys((key) => !key.startsWith('_')),
  mapValues((v) => typeof v === 'string' ? v.trim() : v)
)
```

---

## Migration Checklist

- [ ] Replace `_.get` → `getPath` + `unwrapOr`
- [ ] Replace `_.set` → `setPath` (remove `cloneDeep`)
- [ ] Replace `_.pick` → `mask` (when security-focused)
- [ ] Replace `_.mapKeys` → `mapKeys`
- [ ] Replace `_.mapValues` → `mapValues`
- [ ] Replace `_.merge` → `deepMerge` (remove `cloneDeep`)
- [ ] Add validation with `validateShape`
- [ ] Add type annotations
- [ ] Convert to pipelines where appropriate

---

## Performance Notes

- Receta is ~equivalent performance to Lodash
- No `cloneDeep` needed = faster
- Tree-shakeable = smaller bundles
- Type-safe = fewer runtime errors

---

## Next Steps

- **[API Reference](./07-api-reference.md)** - Complete function reference
- **[Patterns](./05-patterns.md)** - More real-world examples
