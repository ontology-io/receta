# Function: compose()

> **compose**\<`T`\>(...`comparators`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/combinators/index.ts:43](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/combinators/index.ts#L43)

Composes multiple comparators into a single comparator with priority ordering.

Applies comparators in order: if the first comparator returns 0 (equal),
tries the second, and so on. This enables multi-level sorting like
"sort by status, then by priority, then by date".

## Type Parameters

### T

`T`

## Parameters

### comparators

...[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>[]

Comparators in priority order (first = highest priority)

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A composed comparator

## Example

```typescript
interface Issue {
  status: 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

const issues: Issue[] = [
  { status: 'open', priority: 'high', createdAt: new Date('2024-01-03') },
  { status: 'open', priority: 'low', createdAt: new Date('2024-01-01') },
  { status: 'closed', priority: 'high', createdAt: new Date('2024-01-02') },
  { status: 'open', priority: 'high', createdAt: new Date('2024-01-04') }
]

// Sort by: status (open first), then priority (high first), then date (oldest first)
const priorityOrder = { high: 0, medium: 1, low: 2 }
const statusOrder = { open: 0, closed: 1 }

issues.sort(
  compose(
    ascending(i => statusOrder[i.status]),
    ascending(i => priorityOrder[i.priority]),
    ascending(i => i.createdAt)
  )
)
```

## See

withTiebreaker - for explicit two-level sorting
