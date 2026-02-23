# Function: byBoolean()

> **byBoolean**\<`T`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/typed/index.ts:209](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/typed/index.ts#L209)

Creates a comparator for boolean values.

By default, false comes before true (false < true).
Use `reverse()` for true-first sorting.

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `boolean`\>

Function to extract the boolean value

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator for booleans

## Example

```typescript
interface Task {
  title: string
  completed: boolean
  urgent: boolean
}

const tasks = [
  { title: 'Review PR', completed: true, urgent: false },
  { title: 'Fix bug', completed: false, urgent: true },
  { title: 'Write docs', completed: false, urgent: false },
  { title: 'Deploy', completed: true, urgent: true }
]

// Sort by completed (incomplete first)
tasks.sort(byBoolean(t => t.completed))
// => [Fix bug (false), Write docs (false), Review PR (true), Deploy (true)]

// Sort by urgent (urgent first)
tasks.sort(reverse(byBoolean(t => t.urgent)))
// => [Fix bug (true), Deploy (true), Review PR (false), Write docs (false)]

// Multi-level: urgent first, then incomplete first
tasks.sort(
  compose(
    reverse(byBoolean(t => t.urgent)),
    byBoolean(t => t.completed)
  )
)
```

## See

reverse - to sort true values first
