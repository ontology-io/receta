# Variable: isInteger

> `const` **isInteger**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `number`\>

Defined in: [predicate/guards/index.ts:113](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/guards/index.ts#L113)

Type guard that checks if a value is an integer.

## Param

The value to check

## Returns

True if value is an integer

## Example

```typescript
import * as R from 'remeda'
import { isInteger } from 'receta/predicate'

const numbers = [1, 1.5, 2, 2.5, 3]
R.filter(numbers, isInteger) // => [1, 2, 3]
```

## See

 - isNumber - for general number check
 - isFiniteNumber - for finite number check
