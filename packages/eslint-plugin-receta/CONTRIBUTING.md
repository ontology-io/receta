# Contributing to eslint-plugin-receta

Thank you for your interest in contributing! This guide will help you add new rules or improve existing ones.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/ontology-io/receta.git
cd receta/packages/eslint-plugin-receta

# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

## Project Structure

```
packages/eslint-plugin-receta/
├── src/
│   ├── rules/              # ESLint rule implementations
│   │   ├── prefer-result-over-try-catch.ts
│   │   ├── prefer-option-over-null.ts
│   │   └── prefer-pipe-composition.ts
│   ├── utils/              # Shared AST helpers
│   │   └── ast-helpers.ts
│   ├── configs/            # Preset configurations
│   └── index.ts            # Plugin entry point
├── tests/
│   └── rules/              # Rule test files
│       ├── prefer-result-over-try-catch.test.ts
│       ├── prefer-option-over-null.test.ts
│       └── prefer-pipe-composition.test.ts
├── docs/
│   └── rules/              # Rule documentation
│       ├── prefer-result-over-try-catch.md
│       ├── prefer-option-over-null.md
│       └── prefer-pipe-composition.md
└── README.md
```

## Adding a New Rule

### 1. Create the Rule File

Create `src/rules/your-rule-name.ts`:

```typescript
import { ESLintUtils } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/ontology-io/receta/blob/main/packages/eslint-plugin-receta/docs/rules/${name}.md`
)

type MessageIds = 'yourMessageId'

export default createRule<[], MessageIds>({
  name: 'your-rule-name',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Brief description of what the rule does',
    },
    messages: {
      yourMessageId: 'Error message shown to users',
    },
    fixable: 'code', // Include if rule supports autofix
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode

    return {
      // AST node visitor
      CallExpression(node: TSESTree.CallExpression) {
        // Your rule logic here
        context.report({
          node,
          messageId: 'yourMessageId',
          fix(fixer) {
            // Autofix logic (optional)
            return fixer.replaceText(node, 'fixed code')
          },
        })
      },
    }
  },
})
```

### 2. Add Tests

Create `tests/rules/your-rule-name.test.ts`:

```typescript
import { RuleTester } from '@typescript-eslint/rule-tester'
import rule from '../../src/rules/your-rule-name'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
})

ruleTester.run('your-rule-name', rule, {
  valid: [
    {
      name: 'Valid case description',
      code: `/* code that should pass */`,
    },
  ],
  invalid: [
    {
      name: 'Invalid case description',
      code: `/* code that should fail */`,
      errors: [{ messageId: 'yourMessageId' }],
      output: `/* expected autofix output */`,
    },
  ],
})
```

### 3. Register the Rule

Add to `src/index.ts`:

```typescript
import yourRuleName from './rules/your-rule-name'

const plugin = {
  // ...
  rules: {
    // ...existing rules
    'your-rule-name': yourRuleName,
  },
}
```

Add to recommended config:

```typescript
plugin.configs = {
  recommended: {
    rules: {
      // ...existing rules
      'receta/your-rule-name': 'warn',
    },
  },
}
```

### 4. Document the Rule

Create `docs/rules/your-rule-name.md`:

```markdown
# your-rule-name

Brief description of the rule.

## Rule Details

Detailed explanation...

## Examples

### ❌ Incorrect

\`\`\`typescript
// Bad code example
\`\`\`

### ✅ Correct

\`\`\`typescript
// Good code example
\`\`\`

## Options

This rule has no options.

## Further Reading

- Related docs...
```

## AST Exploration

Use [AST Explorer](https://astexplorer.net/) to understand TypeScript AST structure:

1. Select **TypeScript** as the language
2. Select **@typescript-eslint/parser** as the parser
3. Paste your code and explore the AST nodes

**Example:** Finding a try-catch statement

```typescript
// Your code
try {
  doSomething()
} catch (e) {
  console.error(e)
}

// AST structure
{
  type: 'TryStatement',
  block: { type: 'BlockStatement', body: [...] },
  handler: { type: 'CatchClause', param: ..., body: ... }
}
```

## Testing Best Practices

### 1. Test Both Data-First and Data-Last

```typescript
{
  valid: [
    { code: `R.map(arr, x => x * 2)` }, // data-first
    { code: `R.pipe(arr, R.map(x => x * 2))` }, // data-last
  ],
}
```

### 2. Test Edge Cases

- Empty arrays/objects
- Nested structures
- Multiple arguments
- Generic types
- Complex type unions

### 3. Test Autofix Safety

```typescript
{
  invalid: [
    {
      code: 'original code',
      output: 'expected fixed code',
      errors: [{ messageId: 'yourError' }],
    },
  ],
}
```

## Autofix Guidelines

### Safe Autofixes

✅ **Do:**

- Convert simple patterns with clear 1:1 mapping
- Add missing imports
- Preserve existing formatting where possible
- Only autofix when behavior is guaranteed unchanged

❌ **Don't:**

- Autofix complex logic that requires human judgment
- Remove code that might have side effects
- Change semantics (even if it's "better")
- Auto-fix when types can't be inferred

### Example: Safe vs Unsafe

**Safe:**

```typescript
// Simple conversion
arr.filter(x => x > 0).map(x => x * 2)
// → R.pipe(arr, R.filter(x => x > 0), R.map(x => x * 2))
```

**Unsafe (skip autofix):**

```typescript
// Side effects in chain
arr
  .map(x => {
    log(x) // Side effect!
    return x * 2
  })
  .filter(x => x > 0)
// Don't autofix — user needs to handle side effects manually
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/rules/prefer-result-over-try-catch.test.ts

# Watch mode
bun test --watch
```

## Building

```bash
# Type check
bun run typecheck

# Build
bun run build

# Clean
bun run clean
```

## Pull Request Process

1. **Fork the repo** and create a feature branch
2. **Write tests** for your changes (aim for 100% coverage)
3. **Run tests** and ensure they pass
4. **Document** your rule in `docs/rules/`
5. **Update README** if adding new rules
6. **Submit PR** with clear description

### PR Checklist

- [ ] Tests added and passing
- [ ] Documentation written
- [ ] TypeScript compiles without errors
- [ ] Autofix is safe and tested
- [ ] Examples include both ❌ Incorrect and ✅ Correct

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments for exported functions
- Keep functions small and focused

## Questions?

Open an issue or discussion in the [Receta repo](https://github.com/ontology-io/receta).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
