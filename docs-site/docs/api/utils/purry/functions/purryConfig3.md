# Function: purryConfig3()

> **purryConfig3**(`impl`, `args`): `any`

Defined in: [utils/purry.ts:136](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/utils/purry.ts#L136)

**`Internal`**

Creates a function that supports both data-first and data-last signatures
where THREE configuration parameters come before the data.

Pattern:
- Data-first: `fn(config1, config2, config3, data)` → result
- Data-last: `fn(config1, config2, config3)` → `(data) => result`

Use this for:
- Conditional functions: `ifElse(pred, onTrue, onFalse, value)` / `ifElse(pred, onTrue, onFalse)(value)`

## Parameters

### impl

`any`

Implementation with signature `(config1, config2, config3, data) => result`

### args

readonly `unknown`[]

Arguments passed to the wrapper function

## Returns

`any`

## Example

```typescript
function ifElse<T, U>(
  predicate: Predicate<T>,
  onTrue: Mapper<T, U>,
  onFalse: Mapper<T, U>,
  value: T
): U
function ifElse<T, U>(
  predicate: Predicate<T>,
  onTrue: Mapper<T, U>,
  onFalse: Mapper<T, U>
): (value: T) => U
function ifElse(...args: unknown[]): unknown {
  return purryConfig3(ifElseImpl, args)
}
```
