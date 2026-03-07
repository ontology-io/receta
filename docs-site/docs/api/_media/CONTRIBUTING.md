# Contributing to Receta

Thank you for your interest in contributing to Receta! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Module Development](#module-development)
- [Testing Guidelines](#testing-guidelines)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Project Principles](#project-principles)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- **Bun** >= 1.0 (recommended) or **Node.js** >= 18.0
- **TypeScript** >= 5.0
- Familiarity with functional programming concepts

### Installation

```bash
# Clone the repository
git clone https://github.com/ontology-io/receta.git
cd receta

# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Build
bun run build
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

Follow the [Module Development Guide](./docs/module-development-guide.md) for implementing new modules or features.

### 3. Run Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/result/__tests__/constructors.test.ts
```

### 4. Type Check

```bash
bun run typecheck
```

### 5. Build

```bash
bun run build
```

### 6. Commit Your Changes

See [Commit Conventions](#commit-conventions) below.

### 7. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub following the [Pull Request Process](#pull-request-process).

---

## Module Development

When adding a new module or extending an existing one, follow these steps:

### 1. Review the Module Development Guide

Read [docs/module-development-guide.md](./docs/module-development-guide.md) for the complete workflow, including:
- Module structure and organization
- Testing patterns and coverage requirements
- Documentation standards
- Real-world examples

### 2. Follow Existing Patterns

Use the `result` module as a reference implementation:
- **File structure**: `src/result/`
- **Tests**: `src/result/__tests__/`
- **Documentation**: `docs/result/`

### 3. Key Module Structure

```
src/your-module/
├── types.ts           # Type definitions only
├── constructors.ts    # Creating instances
├── guards.ts          # Type guards (is*)
├── map.ts            # Individual function files
├── flatMap.ts
├── index.ts          # Barrel export
└── __tests__/        # Test suite
    ├── constructors.test.ts
    ├── transformers.test.ts
    └── ...
```

### 4. Testing Requirements

- **90%+ code coverage** required
- Test both **data-first** and **data-last** signatures (via `purry`)
- Include **edge cases** and **error scenarios**
- Use **descriptive test names**

Example:
```typescript
describe('Result.map', () => {
  describe('data-first', () => {
    it('transforms Ok value', () => {
      expect(map(ok(5), x => x * 2)).toEqual(ok(10))
    })

    it('passes through Err unchanged', () => {
      expect(map(err('fail'), x => x * 2)).toEqual(err('fail'))
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(ok(5), map(x => x * 2))
      expect(result).toEqual(ok(10))
    })
  })
})
```

### 5. Documentation Requirements

Each module needs **8 documentation files** (see `docs/result/` for examples):
1. `00-overview.md` — High-level introduction
2. `01-constructors.md` — Creating instances
3. `02-transformers.md` — Transforming values
4. `03-extractors.md` — Getting values out
5. `04-combinators.md` — Combining multiple values
6. `05-patterns.md` — Real-world usage patterns
7. `06-migration.md` — Migration from vanilla patterns
8. `07-api-reference.md` — Complete API reference
9. `README.md` — Module landing page

---

## Testing Guidelines

### Running Tests

```bash
# All tests
bun test

# Watch mode
bun test --watch

# Specific file
bun test src/result/__tests__/constructors.test.ts
```

### Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { yourFunction } from '../index'

describe('yourFunction', () => {
  describe('data-first', () => {
    it('does something', () => {
      expect(yourFunction(input, arg)).toEqual(expected)
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(input, yourFunction(arg))
      expect(result).toEqual(expected)
    })
  })

  describe('edge cases', () => {
    it('handles empty input', () => {
      expect(yourFunction([], arg)).toEqual(expected)
    })
  })
})
```

### Coverage Requirements

- **90%+ overall coverage**
- All exported functions must be tested
- Edge cases and error paths must be covered

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(result): add parseJSON utility

Add safe JSON parsing that returns Result<T, SyntaxError>
instead of throwing exceptions.

# Bug fix
fix(async): correct retry backoff calculation

Exponential backoff was using wrong formula. Changed from
delay * attempt to delay * (2 ** (attempt - 1)).

# Documentation
docs(option): add migration guide examples

Added 5 real-world examples showing how to migrate from
null/undefined to Option pattern.

# Test
test(validation): add edge cases for combine()

Added tests for empty validators, nested objects, and
error message formatting.
```

### Scope

The scope should be the module name:
- `result`, `option`, `async`, `predicate`, etc.
- Use `core` for changes affecting multiple modules
- Omit scope for project-wide changes (e.g., `docs: update README`)

---

## Pull Request Process

### 1. Before Submitting

- ✅ All tests pass (`bun test`)
- ✅ Type check passes (`bun run typecheck`)
- ✅ Build succeeds (`bun run build`)
- ✅ Code follows existing style
- ✅ Documentation updated (if applicable)
- ✅ CHANGELOG.md updated (for user-facing changes)

### 2. PR Title Format

Follow the same convention as commits:

```
feat(result): add parseJSON utility
fix(async): correct retry backoff calculation
docs(option): improve migration guide
```

### 3. PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- List of specific changes made
- Include breaking changes if any

## Testing
How was this tested? Include test scenarios.

## Checklist
- [ ] Tests added/updated
- [ ] Documentation added/updated
- [ ] Types are correct
- [ ] Build passes
- [ ] CHANGELOG.md updated (if user-facing)
```

### 4. Review Process

1. Maintainers will review your PR
2. Address feedback and push updates
3. Once approved, a maintainer will merge

### 5. After Merge

Your changes will be included in the next release. Thank you for contributing!

---

## Project Principles

When contributing, please adhere to Receta's design principles:

### 1. Compositional Architecture
- Build functions from other functions
- No duplicate implementations
- Single source of truth for each behavior

### 2. Remeda as Infrastructure
- Use Remeda internally
- Follow Remeda's data-first/data-last pattern via `purry`
- Never reimplement what Remeda provides

### 3. Result-First Error Handling
- Functions return `Result<T, E>` by default
- Errors as values, not exceptions
- Only throw when absolutely necessary

### 4. Type Safety First
- All functions fully typed
- No `any` types
- Leverage TypeScript's type system

### 5. Practical Over Academic
- Solve real problems
- API should read like intent
- Optimize for the 90% use case

### 6. Tree-Shakeable
- Independent module imports
- No side effects
- Dead code elimination friendly

---

## Implementation Priority Rules

**ALWAYS USE RECETA/REMEDA FIRST** when implementing functionality:

1. **Check Receta first** — Use existing utilities
2. **Check Remeda second** — Use Remeda for arrays/objects/functions
3. **Vanilla JS/TS last** — Only when neither provides the functionality

### Examples

```typescript
// ✅ CORRECT: Use Result for error handling
import { Result, tryCatch } from 'receta/result'

function parseJSON<T>(str: string): Result<T, SyntaxError> {
  return tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )
}

// ❌ WRONG: Never use try/catch directly
function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    throw e
  }
}

// ✅ CORRECT: Use Remeda's pipe
import * as R from 'remeda'

const result = R.pipe(
  data,
  R.filter(x => x.active),
  R.map(x => x.value)
)

// ❌ WRONG: Never chain native methods
const result = data
  .filter(x => x.active)
  .map(x => x.value)
```

---

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/ontology-io/receta/discussions)
- **Bug reports** Open a [GitHub Issue](https://github.com/ontology-io/receta/issues)
- **Feature requests** Open a [GitHub Issue](https://github.com/ontology-io/receta/issues) with `[Feature Request]` prefix

---

## Resources

- [Module Development Guide](./docs/module-development-guide.md) — Complete workflow for new modules
- [Remeda Documentation](https://remedajs.com) — Learn about the underlying library
- [Why Receta?](./WHY-RECETA.md) — Philosophy and real-world examples
- [CLAUDE.md](./CLAUDE.md) — Comprehensive project documentation

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Thank you for contributing to Receta! 🎉
