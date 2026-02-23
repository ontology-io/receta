# Variable: isNullish

> `const` **isNullish**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `null` \| `undefined`\>

Defined in: [predicate/guards/index.ts:203](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L203)

Type guard that checks if a value is null or undefined.

## Param

The value to check

## Returns

True if value is null or undefined

## Example

```typescript
import * as R from 'remeda'
import { isNullish, not } from 'receta/predicate'

const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]
R.filter(values, not(isNullish)) // type: string[]
// => ['hello', 'world']
```

## See

 - isDefined - for the inverse
 - isNull - for null-only check
 - isUndefined - for undefined-only check
