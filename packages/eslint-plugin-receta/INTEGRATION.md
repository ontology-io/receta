# Integration Guide: Using eslint-plugin-receta in Your Project

This guide shows how to integrate `eslint-plugin-receta` into your TypeScript/JavaScript project to enforce Receta/Remeda-first patterns.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Gradual Adoption Strategy](#gradual-adoption-strategy)
3. [CI/CD Integration](#cicd-integration)
4. [IDE Setup](#ide-setup)
5. [Team Onboarding](#team-onboarding)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
# Install ESLint plugin
npm install --save-dev eslint-plugin-receta

# Install Receta and Remeda (if not already installed)
npm install receta remeda
```

### 2. Configure ESLint

**For ESLint 9+ (Flat Config):**

```javascript
// eslint.config.mjs
import receta from 'eslint-plugin-receta'

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      receta,
    },
    rules: {
      ...receta.configs.recommended.rules,
    },
  },
]
```

**For ESLint 8 (Legacy Config):**

```json
// .eslintrc.json
{
  "plugins": ["receta"],
  "extends": ["plugin:receta/recommended"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  }
}
```

### 3. Run Autofix

```bash
# Check for violations
npx eslint .

# Auto-fix safe transformations
npx eslint --fix .
```

---

## Gradual Adoption Strategy

### Phase 1: Warnings Only (Week 1-2)

Start with warnings to identify how much code needs refactoring:

```javascript
// eslint.config.mjs
export default [
  {
    plugins: { receta },
    rules: {
      'receta/prefer-result-over-try-catch': 'warn',
      'receta/prefer-option-over-null': 'warn',
      'receta/prefer-pipe-composition': 'warn',
    },
  },
]
```

**Actions:**
- Run `npx eslint .` to see violations
- Review output to estimate refactoring effort
- Share report with team

**Example output:**
```
src/api/users.ts
  12:3  warning  Use Result.tryCatch() instead of try-catch  receta/prefer-result-over-try-catch
  45:8  warning  Use Option<T> instead of T | null          receta/prefer-option-over-null

src/utils/transform.ts
  23:5  warning  Use R.pipe() instead of method chaining    receta/prefer-pipe-composition

✖ 3 problems (0 errors, 3 warnings)
  3 warnings potentially fixable with the `--fix` option
```

### Phase 2: Auto-fix Low-Risk Files (Week 3)

Fix utility files and modules with good test coverage:

```bash
# Fix specific directories
npx eslint --fix src/utils/
npx eslint --fix src/helpers/

# Or fix by file pattern
npx eslint --fix "src/**/*.utils.ts"
```

**Verification:**
```bash
# Run tests after each fix
npm test

# Check git diff to review changes
git diff
```

### Phase 3: Manual Refactor Complex Cases (Week 4-5)

Handle files that can't be auto-fixed (complex error handling, etc.):

1. Identify files with warnings still present
2. Manually refactor using [examples/before-after.md](./examples/before-after.md)
3. Add tests if coverage is low
4. Review with team

### Phase 4: Enforce Errors (Week 6+)

Once most code is compliant, enforce errors:

```javascript
// eslint.config.mjs
export default [
  {
    plugins: { receta },
    rules: {
      ...receta.configs.strict.rules,  // All rules as errors
    },
  },
]
```

**Result:** New code MUST follow Receta/Remeda patterns

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run eslint .
```

### Pre-commit Hook (Husky)

```bash
# Install husky
npm install --save-dev husky lint-staged

# Initialize husky
npx husky init

# Add pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

**Workflow:**
1. Developer commits code
2. Husky runs `lint-staged`
3. ESLint auto-fixes violations
4. Fixed files are added to commit
5. If errors remain, commit is blocked

### GitLab CI

```yaml
# .gitlab-ci.yml
lint:
  stage: test
  script:
    - npm install
    - npm run eslint
  only:
    - merge_requests
    - main
```

---

## IDE Setup

### VS Code

**Install Extensions:**

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) (optional, shows errors inline)

**Configure auto-fix on save:**

```json
// .vscode/settings.json
{
  "eslint.enable": true,
  "eslint.validate": ["typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.rules.customizations": [
    {
      "rule": "receta/*",
      "severity": "warn"  // or "error"
    }
  ]
}
```

**Result:** Every save auto-fixes Receta violations

### WebStorm / IntelliJ

1. Go to **Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint**
2. Check **Automatic ESLint configuration**
3. Check **Run eslint --fix on save**

### Neovim

```lua
-- Using nvim-lspconfig
require('lspconfig').eslint.setup({
  on_attach = function(client, bufnr)
    vim.api.nvim_create_autocmd("BufWritePre", {
      buffer = bufnr,
      command = "EslintFixAll",
    })
  end,
})
```

---

## Team Onboarding

### 1. Documentation

Share these resources with your team:

- **[README.md](./README.md)** — Quick overview and installation
- **[examples/before-after.md](./examples/before-after.md)** — Real-world examples
- **[Receta docs](../../../README.md)** — Full Receta library reference

### 2. Onboarding Checklist

Create a checklist for new team members:

```markdown
## Receta/Remeda Onboarding

- [ ] Install `eslint-plugin-receta` in local dev environment
- [ ] Configure IDE for auto-fix on save
- [ ] Read examples/before-after.md (15 min)
- [ ] Review Receta Result module (10 min)
- [ ] Review Receta Option module (10 min)
- [ ] Review Remeda pipe patterns (10 min)
- [ ] Pair program on refactoring 1 file from vanilla → Receta
- [ ] Review team's coding standards document
```

### 3. Pair Programming Session

Schedule 1-hour pairing session:

**Agenda:**
1. Show ESLint violations in existing code (10 min)
2. Run `--fix` and review changes (15 min)
3. Manually refactor complex case together (20 min)
4. Q&A (15 min)

### 4. Code Review Guidelines

Update code review checklist:

```markdown
## Code Review Checklist

- [ ] No ESLint `receta/*` violations
- [ ] Try-catch converted to Result.tryCatch()
- [ ] Nullable returns use Option<T>
- [ ] Array transformations use R.pipe()
- [ ] Error types are explicit (Result<T, E>)
- [ ] Tests updated for new patterns
```

---

## Troubleshooting

### Issue 1: "Cannot find module 'eslint-plugin-receta'"

**Cause:** Package not installed or wrong import path

**Solution:**
```bash
# Verify installation
npm list eslint-plugin-receta

# Reinstall if missing
npm install --save-dev eslint-plugin-receta

# Check import path in config
import receta from 'eslint-plugin-receta'  // ✅ Correct
```

### Issue 2: Autofix breaks code

**Cause:** Complex code patterns that autofix can't safely transform

**Solution:**
1. Review the diff: `git diff`
2. Manually refactor if needed
3. Disable rule for specific cases:

```typescript
// eslint-disable-next-line receta/prefer-result-over-try-catch
try {
  // Complex error handling logic
  // that requires manual refactoring
} catch (e) {
  // ...
}
```

### Issue 3: Too many violations in existing codebase

**Cause:** Large legacy codebase

**Solution:**
Use `.eslintignore` to gradually adopt:

```
# .eslintignore
# Legacy code (to be refactored gradually)
src/legacy/**
src/old-api/**

# External/generated code
src/generated/**
```

Then refactor directory by directory:
```bash
# Remove from .eslintignore one at a time
# src/utils/**  ← Start here

npx eslint --fix src/utils/
npm test
git commit -m "refactor(utils): migrate to Receta patterns"
```

### Issue 4: Performance issues with large codebases

**Cause:** ESLint processing too many files

**Solution:**
1. Add `.eslintcache` to `.gitignore`
2. Use `--cache` flag:

```json
// package.json
{
  "scripts": {
    "lint": "eslint --cache --cache-location .eslintcache ."
  }
}
```

3. Exclude `node_modules` and build artifacts:

```javascript
// eslint.config.mjs
export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**']
  }
]
```

### Issue 5: Conflicts with existing ESLint rules

**Cause:** Multiple plugins with overlapping rules

**Solution:**
Prioritize Receta rules:

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      // Other plugins
      ...otherPlugin.configs.recommended.rules,

      // Receta rules (override conflicts)
      ...receta.configs.recommended.rules,

      // Manual overrides
      'receta/prefer-pipe-composition': 'error',
      'other-plugin/conflicting-rule': 'off',
    },
  },
]
```

---

## Advanced Configuration

### Customize Rule Severity

```javascript
// eslint.config.mjs
export default [
  {
    plugins: { receta },
    rules: {
      // Enforce Result pattern strictly
      'receta/prefer-result-over-try-catch': 'error',

      // Option is recommended but not required yet
      'receta/prefer-option-over-null': 'warn',

      // Pipe is optional (team prefers method chaining)
      'receta/prefer-pipe-composition': 'off',
    },
  },
]
```

### Different Rules for Tests vs Source

```javascript
// eslint.config.mjs
export default [
  {
    // Strict rules for source code
    files: ['src/**/*.ts'],
    rules: {
      ...receta.configs.strict.rules,
    },
  },
  {
    // Relaxed rules for tests
    files: ['tests/**/*.ts', '**/*.test.ts'],
    rules: {
      'receta/prefer-result-over-try-catch': 'warn',
      'receta/prefer-option-over-null': 'off',
      'receta/prefer-pipe-composition': 'off',
    },
  },
]
```

### Combine with eslint-plugin-remeda

```javascript
// eslint.config.mjs
import remeda from 'eslint-plugin-remeda'
import receta from 'eslint-plugin-receta'

export default [
  {
    plugins: { remeda, receta },
    rules: {
      // Remeda-specific rules
      ...remeda.configs.recommended.rules,

      // Receta patterns
      ...receta.configs.recommended.rules,
    },
  },
]
```

---

## Metrics & Monitoring

Track adoption progress:

```bash
# Count violations before fix
npx eslint . --format json > before.json

# Run autofix
npx eslint --fix .

# Count violations after fix
npx eslint . --format json > after.json

# Compare
node scripts/compare-eslint-reports.js before.json after.json
```

**Example comparison script:**

```typescript
// scripts/compare-eslint-reports.ts
import fs from 'fs'

const before = JSON.parse(fs.readFileSync('before.json', 'utf-8'))
const after = JSON.parse(fs.readFileSync('after.json', 'utf-8'))

const beforeCount = before.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0)
const afterCount = after.reduce((sum, file) => sum + file.errorCount + file.warningCount, 0)

console.log(`Violations before: ${beforeCount}`)
console.log(`Violations after: ${afterCount}`)
console.log(`Fixed: ${beforeCount - afterCount} (${((beforeCount - afterCount) / beforeCount * 100).toFixed(1)}%)`)
```

---

## Next Steps

After successful integration:

1. ✅ Monitor CI/CD for violations
2. ✅ Update team docs with Receta patterns
3. ✅ Schedule quarterly reviews to ensure compliance
4. ✅ Contribute improvements back to [Receta repo](https://github.com/ontology-io/receta)

---

## Support

- **GitHub Issues:** https://github.com/ontology-io/receta/issues
- **Receta Docs:** https://github.com/ontology-io/receta#readme
- **Remeda Docs:** https://remedajs.com

Happy refactoring! 🚀
