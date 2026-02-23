# Function: fromPredicate()

> **fromPredicate**\<`T`, `E`\>(`predicate`, `error`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `E`\>

Defined in: [validation/constructors/index.ts:101](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/constructors/index.ts#L101)

Creates a validator from a predicate function.

If the predicate returns true, returns Valid with the value.
If the predicate returns false, returns Invalid with the error.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### predicate

[`Predicate`](../../../predicate/types/type-aliases/Predicate.md)\<`T`\>

Function that tests the value

### error

`E`

Error to return when predicate fails

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `E`\>

A validator function

## Example

```typescript
import { gt } from 'receta/predicate'

// Simple predicate validator
const isPositive = fromPredicate(
  (n: number) => n > 0,
  'Must be positive'
)
isPositive(5) // => Valid(5)
isPositive(-1) // => Invalid(['Must be positive'])

// Using predicate builders
const isAdult = fromPredicate(
  gt(18),
  'Must be 18 or older'
)

// Real-world: Email validation
const isEmail = fromPredicate(
  (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  'Invalid email format'
)
```

## See

fromPredicateWithError - for dynamic error messages
