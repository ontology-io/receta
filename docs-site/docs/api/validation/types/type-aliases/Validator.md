# Type Alias: Validator()\<T, U, E\>

> **Validator**\<`T`, `U`, `E`\> = (`value`) => [`Validation`](Validation.md)\<`U`, `E`\>

Defined in: [validation/types.ts:59](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L59)

A function that validates a value and returns a Validation.

Validators can be composed using flatMap, validate, and other combinators
to build complex validation logic from simple validators.

## Type Parameters

### T

`T`

The input type to validate

### U

`U`

The output type after validation (often same as T)

### E

`E`

The error type

## Parameters

### value

`T`

## Returns

[`Validation`](Validation.md)\<`U`, `E`\>

## Example

```typescript
const minLength = (min: number): Validator<string, string, string> =>
  (value) => value.length >= min
    ? valid(value)
    : invalid(`Must be at least ${min} characters`)
```
