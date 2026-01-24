# Validation Module Decision Tree

## When to Use
Multi-field validation with error accumulation (collect ALL errors, not just first).

## Function Selection
```
START: What validation do you need?
│
├─ SINGLE field with multiple rules?
│  └─ Use: validate(value, [rule1, rule2, ...])
│
├─ MULTIPLE fields (form/object)?
│  └─ Use: schema({ field1: rules, field2: rules })
│
├─ Array of validations?
│  └─ Use: validateAll([val1, val2, ...])
│
├─ BUILD validators?
│  ├─ From predicate ─────────────────────────────► fromPredicate()
│  ├─ String validators ──────────────────────────► required, email, url
│  ├─ Number validators ──────────────────────────► min, max, positive
│  └─ Custom logic ───────────────────────────────► fromPredicateWithError()
│
└─ CONVERT to/from Result?
    └─ Use: toResult(), fromResult()
```

## Key Difference from Result
- **Result**: Fails fast (stops at first error)
- **Validation**: Accumulates errors (collects all errors)

Use Validation for: forms, multi-field validation, user input
Use Result for: API calls, file operations, parsing
