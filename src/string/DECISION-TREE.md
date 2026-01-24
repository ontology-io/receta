# String Module Decision Tree

## When to Use
String formatting, validation, sanitization, and transformation.

## Function Selection
```
START: What string operation?
│
├─ TRANSFORM format?
│  ├─ URL-friendly slug ──────────────────────────► slugify()
│  ├─ Case conversion ─────────────────────────────► kebabCase, camelCase, etc.
│  ├─ Truncate with ellipsis ──────────────────────► truncate()
│  └─ Template interpolation ──────────────────────► template()
│
├─ VALIDATE string?
│  ├─ Email format ────────────────────────────────► isEmail()
│  ├─ URL format ──────────────────────────────────► isUrl()
│  ├─ Alphanumeric ────────────────────────────────► isAlphanumeric()
│  ├─ Numeric ─────────────────────────────────────► isNumeric()
│  ├─ Hex color ───────────────────────────────────► isHexColor()
│  └─ Empty checks ────────────────────────────────► isEmpty(), isBlank()
│
├─ SANITIZE string?
│  ├─ Remove HTML tags ────────────────────────────► stripHtml()
│  ├─ Escape HTML entities ────────────────────────► escapeHtml()
│  ├─ Unescape HTML ───────────────────────────────► unescapeHtml()
│  └─ Trim whitespace ─────────────────────────────► trim(), trimStart(), trimEnd()
│
└─ EXTRACT parts?
    ├─ Split into words ──────────────────────────► words()
    ├─ Split into lines ──────────────────────────► lines()
    ├─ Extract between delimiters ────────────────► between()
    └─ Custom extraction ─────────────────────────► extract()
```

## Common Use Cases
- **URLs**: `slugify('Hello World')` → `'hello-world'`
- **Display**: `truncate(longText, { length: 100 })`
- **Security**: `escapeHtml(userInput)`
- **Forms**: `isEmail(input)`, `isUrl(input)`
