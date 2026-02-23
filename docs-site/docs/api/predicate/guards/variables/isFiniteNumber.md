# Variable: isFiniteNumber

> `const` **isFiniteNumber**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `number`\>

Defined in: [predicate/guards/index.ts:92](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L92)

Type guard that checks if a value is a finite number.

Returns false for Infinity, -Infinity, and NaN.

## Param

The value to check

## Returns

True if value is a finite number

## Example

```typescript
import { isFiniteNumber } from 'receta/predicate'

isFiniteNumber(42) // => true
isFiniteNumber(Infinity) // => false
isFiniteNumber(-Infinity) // => false
isFiniteNumber(NaN) // => false
```

## See

 - isNumber - for basic number check
 - isInteger - for integer check
