# Variable: isArray

> `const` **isArray**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `unknown`[]\>

Defined in: [predicate/guards/index.ts:248](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L248)

Type guard that checks if a value is an array.

## Param

The value to check

## Returns

True if value is an array

## Example

```typescript
import { isArray } from 'receta/predicate'

const value: unknown = [1, 2, 3]
if (isArray(value)) {
  console.log(value.length) // TypeScript knows value is array
}
```

## See

 - isObject - for object type guard
 - isFunction - for function type guard
