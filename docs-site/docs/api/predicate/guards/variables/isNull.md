# Variable: isNull

> `const` **isNull**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `null`\>

Defined in: [predicate/guards/index.ts:159](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L159)

Type guard that checks if a value is null.

## Param

The value to check

## Returns

True if value is null

## Example

```typescript
import * as R from 'remeda'
import { isNull } from 'receta/predicate'

const values: unknown[] = [null, undefined, 0, '']
R.filter(values, isNull) // => [null]
```

## See

 - isUndefined - for undefined check
 - isNullish - for null or undefined check
 - isDefined - for non-nullish check
