# Lens Module Decision Tree

## When to Use
Composable, immutable updates to nested data structures.

## Function Selection
```
START: What lens operation?
│
├─ CREATE a lens?
│  ├─ For object property ────────────────────────► prop()
│  ├─ For nested path ────────────────────────────► path()
│  ├─ For array index ────────────────────────────► index()
│  ├─ Custom getter/setter ───────────────────────► lens()
│  └─ Optional path (might not exist) ────────────► optional()
│
├─ USE a lens?
│  ├─ Get value ──────────────────────────────────► view()
│  ├─ Set value ──────────────────────────────────► set()
│  └─ Update value (transform) ───────────────────► over()
│
└─ COMPOSE lenses?
    └─ Chain multiple lenses ─────────────────────► compose()
```

## When to Use Lens vs Direct Access
Use Lens when:
- ✅ Deep nesting (3+ levels)
- ✅ Reusable access patterns
- ✅ Compositional updates
- ✅ Type-safe immutable updates

Use direct access when:
- ❌ Shallow updates (1-2 levels)
- ❌ One-off operations
- ❌ Simple destructuring works

## Example
```typescript
const emailLens = compose(
  prop('user'),
  prop('contact'),
  prop('email')
)

view(emailLens, state)           // Get nested email
set(emailLens, 'new@email.com')  // Update immutably
over(emailLens, s => s.toLowerCase())  // Transform
```
