# Variable: isBoolean

> `const` **isBoolean**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `boolean`\>

Defined in: [predicate/guards/index.ts:137](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L137)

Type guard that checks if a value is a boolean.

Narrows the type to `boolean` in TypeScript.

## Param

The value to check

## Returns

True if value is a boolean

## Example

```typescript
import * as R from 'remeda'
import { isBoolean } from 'receta/predicate'

const mixed: unknown[] = [true, 1, false, 'yes']
const booleans = R.filter(mixed, isBoolean) // type: boolean[]
// => [true, false]
```

## See

 - isString - for string type guard
 - isNumber - for number type guard
