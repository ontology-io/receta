# Variable: isUndefined

> `const` **isUndefined**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `undefined`\>

Defined in: [predicate/guards/index.ts:180](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L180)

Type guard that checks if a value is undefined.

## Param

The value to check

## Returns

True if value is undefined

## Example

```typescript
import * as R from 'remeda'
import { isUndefined } from 'receta/predicate'

const values: unknown[] = [null, undefined, 0, '']
R.filter(values, isUndefined) // => [undefined]
```

## See

 - isNull - for null check
 - isNullish - for null or undefined check
 - isDefined - for non-nullish check
