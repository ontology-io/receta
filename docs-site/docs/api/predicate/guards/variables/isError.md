# Variable: isError

> `const` **isError**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `Error`\>

Defined in: [predicate/guards/index.ts:350](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L350)

Type guard that checks if a value is an Error instance.

## Param

The value to check

## Returns

True if value is an Error

## Example

```typescript
import { isError } from 'receta/predicate'

isError(new Error('fail')) // => true
isError(new TypeError('invalid')) // => true
isError('error message') // => false
```
