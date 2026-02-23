# Function: startsWith()

> **startsWith**(`prefix`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

Defined in: [predicate/comparison/index.ts:205](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/comparison/index.ts#L205)

Creates a predicate that tests if a string starts with a prefix.

Case-sensitive.

## Parameters

### prefix

`string`

The prefix to test for

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

A predicate that returns true if value starts with prefix

## Example

```typescript
import * as R from 'remeda'

const names = ['Alice', 'Bob', 'Alex', 'Barbara']
R.filter(names, startsWith('A')) // => ['Alice', 'Alex']

// Real-world: Filter files by extension
const files = ['app.ts', 'test.spec.ts', 'config.json']
R.filter(files, (f) => !startsWith('test.')(f)) // => non-test files
```

## See

 - endsWith - for suffix testing
 - includes - for substring testing
