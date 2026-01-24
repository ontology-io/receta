# Decision Trees System

This directory contains decision trees for every Receta function. These decision trees help developers (and LLMs) select the right function for any task.

## Purpose

The decision tree system serves two audiences:

1. **Human Developers**: Quick reference to find the right function
2. **LLMs (AI Assistants)**: Systematic guidance for code generation and recommendations

## Structure

```
decision-trees/
├── README.md                    # This file
├── 00-root.md                   # Root decision tree (module selection)
├── result/
│   ├── _module.md              # Result module decision tree
│   ├── ok.md                   # Individual function trees
│   ├── err.md
│   ├── map.md
│   └── ...
├── option/
│   ├── _module.md
│   └── ...
├── async/
├── predicate/
├── validation/
├── collection/
├── object/
├── string/
├── number/
├── memo/
├── lens/
├── compare/
└── function/
```

## File Naming Conventions

- `00-root.md` - Root module selection tree (always first)
- `_module.md` - Module-level decision tree (one per module)
- `<functionName>.md` - Individual function decision trees

## Decision Tree Format

Each function decision tree follows this template:

```markdown
# Function: functionName

## When to Use
[1-2 sentence use case]

## Decision Tree
[ASCII tree diagram with questions and branches]

## Examples
[Code examples showing typical usage]

## Related Functions
- **Alternative**: [function] - when [condition]
- **Complement**: [function] - use together for [pattern]

## Type Signature (optional)
[TypeScript signature]

## Common Mistakes (optional)
[Anti-patterns and corrections]
```

## Generating llm.txt

The decision trees are compiled into a single `llm.txt` file for LLM consumption:

```bash
# Generate llm.txt from all decision trees
bun run generate-llm

# The script:
# 1. Reads all .md files from docs/decision-trees/
# 2. Sorts them (root → modules → functions)
# 3. Combines into llm.txt with separators
# 4. Adds table of contents and metadata
```

**Output**: `llm.txt` in project root

## Maintenance Workflow

### Adding a New Function

1. **Create decision tree file**:
   ```bash
   # In appropriate module directory
   touch docs/decision-trees/result/newFunction.md
   ```

2. **Write the decision tree** using the template above

3. **Regenerate llm.txt**:
   ```bash
   bun run generate-llm
   ```

4. **Commit all changes**:
   ```bash
   git add docs/decision-trees/result/newFunction.md llm.txt
   git commit -m "docs: add decision tree for newFunction"
   ```

### Adding a New Module

1. **Create module directory**:
   ```bash
   mkdir docs/decision-trees/new-module
   ```

2. **Create module decision tree**:
   ```bash
   touch docs/decision-trees/new-module/_module.md
   ```

3. **Create function decision trees** for each exported function

4. **Update root decision tree** (`00-root.md`) to include new module

5. **Regenerate llm.txt**:
   ```bash
   bun run generate-llm
   ```

### Updating Existing Trees

1. Edit the relevant `.md` file directly
2. Regenerate: `bun run generate-llm`
3. Commit changes

## Writing Good Decision Trees

### 1. Start with Clear Use Cases

❌ **Bad**:
```
## When to Use
Transforms values
```

✅ **Good**:
```
## When to Use
Transform the success value inside a Result without changing the Result type (Ok/Err).
```

### 2. Use Question-Based Trees

❌ **Bad**:
```
- Use map for transformations
- Use flatMap for chaining
```

✅ **Good**:
```
Do you need to transform a Result?
│
├─ Simple transformation? ─────────► map()
└─ Returns another Result? ────────► flatMap()
```

### 3. Show Concrete Examples

❌ **Bad**:
```typescript
map(result, fn)
```

✅ **Good**:
```typescript
// Transform user object
pipe(
  fetchUser(id),
  map(user => user.email),
  map(email => email.toLowerCase())
)  // => Result<string, Error>
```

### 4. Highlight Related Functions

Always provide:
- **Alternatives**: When to use a different function instead
- **Complements**: Functions that work well together
- **Conversions**: How to convert between types

Example:
```markdown
## Related Functions
- **Alternative**: `flatMap()` - when fn returns Result
- **Transform error**: `mapErr()` - to transform Err value
- **Side effects**: `tap()` - when you don't need to transform
```

### 5. Include Common Mistakes

Help users avoid pitfalls:

```markdown
## Common Mistakes

❌ **Nested Results**
```typescript
map(ok(5), x => ok(x * 2))  // => Ok(Ok(10)) ❌
```

✅ **Use flatMap for Result-returning functions**
```typescript
flatMap(ok(5), x => ok(x * 2))  // => Ok(10) ✅
```
```

## Decision Tree Depth Guidelines

### Module-Level Trees
- **Depth**: 2-3 levels
- **Purpose**: Direct to right function category
- **Example**: "Create → Transform → Extract"

### Function-Level Trees
- **Depth**: 1-2 levels
- **Purpose**: When to use THIS function vs alternatives
- **Keep it simple**: Don't nest too deep

### Root Tree
- **Depth**: 2-3 levels
- **Purpose**: Module selection
- **Coverage**: All 13 modules

## ASCII Tree Style Guide

Use consistent symbols:

```
└─  Last item in list
├─  Middle item in list
│   Vertical continuation
─►  Points to result/function
```

Example:
```
Do you need to do X?
│
├─ Case A? ─────────────────────► use_function_a()
│
├─ Case B? ─────────────────────► use_function_b()
│
└─ Case C? ─────────────────────► use_function_c()
```

## Status

**Current Coverage**:
- ✅ Root decision tree
- ✅ Result module (complete: 19 functions)
- ✅ Option module (started: module tree only)
- ✅ Predicate module (started: module tree only)
- ⏳ Async module (pending)
- ⏳ Validation module (pending)
- ⏳ Collection module (pending)
- ⏳ Object module (pending)
- ⏳ String module (pending)
- ⏳ Number module (pending)
- ⏳ Memo module (pending)
- ⏳ Lens module (pending)
- ⏳ Compare module (pending)
- ⏳ Function module (pending)

**Total Functions to Document**: ~150+

## Benefits of This System

1. **Maintainable**: Each tree is a small, focused file
2. **Version Control Friendly**: Small diffs, easy reviews
3. **Extensible**: Easy to add new modules/functions
4. **Single Source of Truth**: Decision trees drive llm.txt generation
5. **Developer Friendly**: Can read individual files without processing
6. **LLM Optimized**: Generated llm.txt is perfect for AI consumption

## Contributing

When adding or updating decision trees:

1. Follow the template format
2. Keep language clear and concise
3. Include realistic examples
4. Cross-reference related functions
5. Test the generated llm.txt: `bun run generate-llm`
6. Ensure ASCII trees render correctly in plaintext

## Tools

### Generation Script
- **Location**: `scripts/generate-llm-txt.ts`
- **Language**: TypeScript (Bun)
- **Function**: Collects all decision trees into llm.txt
- **Usage**: `bun run generate-llm`

### File Watching (Future)
Consider adding a file watcher to auto-regenerate:
```bash
bun --watch scripts/generate-llm-txt.ts
```

## Examples

### Good Module Tree

See [result/_module.md](result/_module.md) for a complete example.

### Good Function Tree

See [result/map.md](result/map.md) for a complete example.

---

**Last Updated**: 2026-01-23
**Maintained By**: Receta contributors
