# Number Module Decision Tree

## When to Use
Number formatting, validation, calculations, and safe conversions.

## Function Selection
```
START: What number operation?
│
├─ FORMAT for display?
│  ├─ Currency ───────────────────────────────────► toCurrency()
│  ├─ Percentage ─────────────────────────────────► toPercent()
│  ├─ Compact (1K, 1M) ────────────────────────────► toCompact()
│  ├─ Bytes (1.5 MB) ──────────────────────────────► toBytes()
│  ├─ Fixed precision ─────────────────────────────► toPrecision()
│  ├─ Ordinal (1st, 2nd) ──────────────────────────► toOrdinal()
│  └─ Custom format ───────────────────────────────► format()
│
├─ VALIDATE number?
│  ├─ Is integer? ────────────────────────────────► isInteger()
│  ├─ Is finite? ──────────────────────────────────► isFinite()
│  ├─ Is positive? ────────────────────────────────► isPositive()
│  ├─ Is negative? ────────────────────────────────► isNegative()
│  ├─ In range? ───────────────────────────────────► inRange()
│  └─ Clamp to range ──────────────────────────────► clamp()
│
├─ CALCULATE?
│  ├─ Sum array ───────────────────────────────────► sum()
│  ├─ Average ─────────────────────────────────────► average()
│  ├─ Round with precision ────────────────────────► round()
│  ├─ Percentage of total ─────────────────────────► percentage()
│  └─ Ratio ───────────────────────────────────────► ratio()
│
├─ PARSE safely?
│  ├─ From string ─────────────────────────────────► fromString()
│  ├─ From currency string ────────────────────────► fromCurrency()
│  └─ From byte string ────────────────────────────► fromBytes()
│
└─ UTILITIES?
    ├─ Random in range ───────────────────────────► random()
    ├─ Step through range ────────────────────────► step()
    └─ Interpolate ───────────────────────────────► interpolate()
```

## Common Patterns
- **Money**: `toCurrency(1234.56, { currency: 'USD' })`
- **File sizes**: `toBytes(1048576)` → `"1.00 MB"`
- **Stats**: `percentage(correct, total)`
- **Safe parsing**: `fromString("123.45")` returns `Result<number, ParseError>`
