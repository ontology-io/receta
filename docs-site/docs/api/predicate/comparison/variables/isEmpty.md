# Variable: isEmpty

> `const` **isEmpty**: [`Predicate`](../../types/type-aliases/Predicate.md)\<`string` \| readonly `unknown`[] \| `Record`\<`string`, `unknown`\>\>

Defined in: [predicate/comparison/index.ts:314](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L314)

Creates a predicate that tests if a value is empty.

Works with strings, arrays, and objects.
- Strings: empty if length === 0
- Arrays: empty if length === 0
- Objects: empty if has no own properties

## Returns

A predicate that returns true if value is empty

## Example

```typescript
import * as R from 'remeda'

R.filter(['', 'hello', '', 'world'], isEmpty) // => ['', '']
R.filter([[], [1, 2], []], isEmpty) // => [[], []]
R.filter([{}, { a: 1 }, {}], isEmpty) // => [{}, {}]

// Real-world: Remove empty form fields
const formData = { name: 'Alice', email: '', bio: 'Developer' }
R.pipe(
  R.entries(formData),
  R.filter(([_, value]) => !isEmpty(value)),
  R.fromEntries
) // => { name: 'Alice', bio: 'Developer' }
```

## See

isNotEmpty - for the inverse
