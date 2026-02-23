# Function: byDate()

> **byDate**\<`T`\>(`fn`): [`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

Defined in: [compare/typed/index.ts:38](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/compare/typed/index.ts#L38)

Creates a comparator for date values.

Sorts dates chronologically (earliest to latest by default).
Handles Date objects correctly for temporal sorting.

## Type Parameters

### T

`T`

## Parameters

### fn

[`ComparableExtractor`](../../types/type-aliases/ComparableExtractor.md)\<`T`, `Date`\>

Function to extract the date value

## Returns

[`Comparator`](../../types/type-aliases/Comparator.md)\<`T`\>

A comparator for dates

## Example

```typescript
interface Event {
  name: string
  occurredAt: Date
  scheduledFor: Date
}

const events = [
  { name: 'Meeting', occurredAt: new Date('2024-01-15'), scheduledFor: new Date('2024-02-01') },
  { name: 'Launch', occurredAt: new Date('2024-01-10'), scheduledFor: new Date('2024-03-01') },
  { name: 'Review', occurredAt: new Date('2024-01-20'), scheduledFor: new Date('2024-02-15') }
]

// Sort by occurred date (earliest first)
events.sort(byDate(e => e.occurredAt))
// => [Launch (Jan 10), Meeting (Jan 15), Review (Jan 20)]

// Sort by scheduled date descending (latest first)
events.sort(reverse(byDate(e => e.scheduledFor)))
// => [Launch (Mar 1), Review (Feb 15), Meeting (Feb 1)]
```

## See

 - ascending - for generic ascending sort
 - descending - for generic descending sort
