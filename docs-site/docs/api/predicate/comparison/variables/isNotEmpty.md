# Variable: isNotEmpty

> `const` **isNotEmpty**: [`Predicate`](../../types/type-aliases/Predicate.md)\<`string` \| readonly `unknown`[] \| `Record`\<`string`, `unknown`\>\>

Defined in: [predicate/comparison/index.ts:339](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/comparison/index.ts#L339)

Creates a predicate that tests if a value is not empty.

The inverse of `isEmpty`.

## Returns

A predicate that returns true if value is not empty

## Example

```typescript
import * as R from 'remeda'

R.filter(['', 'hello', '', 'world'], isNotEmpty) // => ['hello', 'world']
```

## See

isEmpty - for the inverse
