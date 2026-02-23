# Variable: isRegExp

> `const` **isRegExp**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `RegExp`\>

Defined in: [predicate/guards/index.ts:332](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L332)

Type guard that checks if a value is a RegExp instance.

## Param

The value to check

## Returns

True if value is a RegExp

## Example

```typescript
import { isRegExp } from 'receta/predicate'

isRegExp(/test/) // => true
isRegExp(new RegExp('test')) // => true
isRegExp('/test/') // => false
```
