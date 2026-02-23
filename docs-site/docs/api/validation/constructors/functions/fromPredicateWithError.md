# Function: fromPredicateWithError()

> **fromPredicateWithError**\<`T`, `E`\>(`predicate`, `getError`): [`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `E`\>

Defined in: [validation/constructors/index.ts:139](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/constructors/index.ts#L139)

Creates a validator from a predicate with a dynamic error function.

Like fromPredicate, but allows the error message to depend on the input value.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### predicate

[`Predicate`](../../../predicate/types/type-aliases/Predicate.md)\<`T`\>

Function that tests the value

### getError

(`value`) => `E`

Function that generates the error from the value

## Returns

[`Validator`](../../types/type-aliases/Validator.md)\<`T`, `T`, `E`\>

A validator function

## Example

```typescript
// Dynamic error message
const minLength = (min: number) =>
  fromPredicateWithError(
    (s: string) => s.length >= min,
    (s) => `Expected ${min} characters, got ${s.length}`
  )

minLength(5)('hi')
// => Invalid(['Expected 5 characters, got 2'])

// Real-world: Range validation with context
const inRange = (min: number, max: number) =>
  fromPredicateWithError(
    (n: number) => n >= min && n <= max,
    (n) => `${n} is out of range [${min}, ${max}]`
  )
```

## See

fromPredicate - for static error messages
