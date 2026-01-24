# Object Module Decision Tree

## When to Use
Safe nested access, flattening, validation, and transformation of objects.

## Function Selection
```
START: What object operation?
│
├─ FLATTEN/UNFLATTEN?
│  ├─ Nested object → flat keys ──────────────────► flatten()
│  └─ Flat keys → nested object ──────────────────► unflatten()
│
├─ SAFE ACCESS to nested paths?
│  ├─ Get nested value safely ────────────────────► getPath()
│  ├─ Set nested value ────────────────────────────► setPath()
│  └─ Update nested value ─────────────────────────► updatePath()
│
├─ VALIDATION?
│  ├─ Validate object shape ───────────────────────► validateShape()
│  ├─ Strip undefined values ──────────────────────► stripUndefined()
│  └─ Remove nullish values ────────────────────────► compact()
│
├─ TRANSFORMATION?
│  ├─ Rename keys ─────────────────────────────────► rename()
│  ├─ Mask sensitive fields ────────────────────────► mask()
│  ├─ Deep merge objects ───────────────────────────► deepMerge()
│  ├─ Transform keys ───────────────────────────────► mapKeys()
│  ├─ Transform values ─────────────────────────────► mapValues()
│  ├─ Filter by keys ───────────────────────────────► filterKeys()
│  └─ Filter by values ─────────────────────────────► filterValues()
│
└─ Simple pick/omit/mapValues?
    └─ Use Remeda directly (not this module)
```

## Common Patterns
- **Config access**: `getPath(config, ['database', 'host'])`
- **API response flattening**: `flatten(nestedApiResponse)`
- **Sensitive data**: `mask(user, ['password', 'ssn'])`
