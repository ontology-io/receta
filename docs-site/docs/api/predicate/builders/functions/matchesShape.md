# Function: matchesShape()

> **matchesShape**\<`T`\>(`pattern`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

Defined in: [predicate/builders/index.ts:196](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/builders/index.ts#L196)

Creates a predicate that tests if an object has a specific shape.

Similar to `where`, but returns true only if the object has exactly
the properties specified in the pattern (strict matching).

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### pattern

`Partial`\<`T`\>

The pattern object to match against

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`T`\>

A predicate that tests if value matches the pattern

## Example

```typescript
import * as R from 'remeda'
import { matchesShape } from 'receta/predicate'

const events = [
  { type: 'click', x: 100, y: 200 },
  { type: 'keypress', key: 'Enter' },
  { type: 'click', x: 150, y: 250 }
]

// Find click events
R.filter(events, matchesShape({ type: 'click' }))
// => click events

// Real-world: Pattern matching on API responses
const responses = [
  { status: 'success', data: { id: 1 } },
  { status: 'error', message: 'Not found' },
  { status: 'success', data: { id: 2 } }
]
R.filter(responses, matchesShape({ status: 'success' }))
// => success responses
```

## See

 - where - for predicate-based matching
 - eq - for equality comparison
