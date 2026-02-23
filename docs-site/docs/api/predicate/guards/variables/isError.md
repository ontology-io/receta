# Variable: isError

> `const` **isError**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `Error`\>

Defined in: [predicate/guards/index.ts:350](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/guards/index.ts#L350)

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
