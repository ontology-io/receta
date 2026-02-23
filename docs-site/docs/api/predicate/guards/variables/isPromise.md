# Variable: isPromise

> `const` **isPromise**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `Promise`\<`unknown`\>\>

Defined in: [predicate/guards/index.ts:368](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/guards/index.ts#L368)

Type guard that checks if a value is a Promise.

## Param

The value to check

## Returns

True if value is a Promise

## Example

```typescript
import { isPromise } from 'receta/predicate'

isPromise(Promise.resolve(42)) // => true
isPromise(async () => {}) // => false (it's a function)
await isPromise((async () => {})()) // => true (result of calling it)
```
