# Variable: isString

> `const` **isString**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `string`\>

Defined in: [predicate/guards/index.ts:36](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/guards/index.ts#L36)

Type guard that checks if a value is a string.

Narrows the type to `string` in TypeScript.

## Param

The value to check

## Returns

True if value is a string

## Example

```typescript
import * as R from 'remeda'
import { isString } from 'receta/predicate'

const mixed: unknown[] = ['hello', 42, 'world', true]
const strings = R.filter(mixed, isString) // type: string[]
// => ['hello', 'world']

// Type narrowing in conditionals
const value: unknown = 'test'
if (isString(value)) {
  console.log(value.toUpperCase()) // TypeScript knows value is string
}
```

## See

 - isNumber - for number type guard
 - isBoolean - for boolean type guard
