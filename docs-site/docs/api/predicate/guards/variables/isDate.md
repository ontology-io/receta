# Variable: isDate

> `const` **isDate**: [`TypePredicate`](../../types/type-aliases/TypePredicate.md)\<`unknown`, `Date`\>

Defined in: [predicate/guards/index.ts:314](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/predicate/guards/index.ts#L314)

Type guard that checks if a value is a Date instance.

## Param

The value to check

## Returns

True if value is a Date

## Example

```typescript
import { isDate } from 'receta/predicate'

isDate(new Date()) // => true
isDate('2024-01-01') // => false
isDate(Date.now()) // => false
```
