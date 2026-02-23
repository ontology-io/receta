# Variable: isObject

> `const` **isObject**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `Record`\<`string`, `unknown`\>\>

Defined in: [predicate/guards/index.ts:273](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/guards/index.ts#L273)

Type guard that checks if a value is a plain object.

Returns false for arrays, functions, null, and other non-plain objects.

## Param

The value to check

## Returns

True if value is a plain object

## Example

```typescript
import { isObject } from 'receta/predicate'

isObject({}) // => true
isObject({ a: 1 }) // => true
isObject([]) // => false
isObject(null) // => false
isObject(() => {}) // => false
```

## See

 - isArray - for array type guard
 - isFunction - for function type guard
