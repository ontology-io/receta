# Variable: isRegExp

> `const` **isRegExp**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `RegExp`\>

Defined in: [predicate/guards/index.ts:332](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/guards/index.ts#L332)

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
