# Variable: isFunction

> `const` **isFunction**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `Function`\>

Defined in: [predicate/guards/index.ts:296](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L296)

Type guard that checks if a value is a function.

## Param

The value to check

## Returns

True if value is a function

## Example

```typescript
import * as R from 'remeda'
import { isFunction } from 'receta/predicate'

const mixed: unknown[] = [() => {}, 42, function() {}, 'test']
R.filter(mixed, isFunction) // type: Function[]
```

## See

 - isObject - for object type guard
 - isArray - for array type guard
