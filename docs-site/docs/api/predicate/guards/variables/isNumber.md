# Variable: isNumber

> `const` **isNumber**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `number`\>

Defined in: [predicate/guards/index.ts:68](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L68)

Type guard that checks if a value is a number.

Narrows the type to `number` in TypeScript.
Returns false for NaN (use `isFiniteNumber` to include NaN).

## Param

The value to check

## Returns

True if value is a number and not NaN

## Example

```typescript
import * as R from 'remeda'
import { isNumber } from 'receta/predicate'

const mixed: unknown[] = [42, 'hello', 100, null]
const numbers = R.filter(mixed, isNumber) // type: number[]
// => [42, 100]

// Type narrowing
const value: unknown = 42
if (isNumber(value)) {
  console.log(value * 2) // TypeScript knows value is number
}
```

## See

 - isFiniteNumber - to allow NaN
 - isInteger - for integer type guard
 - isString - for string type guard
