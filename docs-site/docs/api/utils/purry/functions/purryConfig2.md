# Function: purryConfig2()

> **purryConfig2**(`impl`, `args`): `any`

Defined in: [utils/purry.ts:88](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/utils/purry.ts#L88)

**`Internal`**

Creates a function that supports both data-first and data-last signatures
where TWO configuration parameters come before the data.

Pattern:
- Data-first: `fn(config1, config2, data)` → result
- Data-last: `fn(config1, config2)` → `(data) => result`

Use this for:
- Lens operations with functions: `over(lens, fn, source)` / `over(lens, fn)(source)`
- Validation: `validate(schema, options, data)` / `validate(schema, options)(data)`

## Parameters

### impl

`any`

Implementation with signature `(config1, config2, data) => result`

### args

readonly `unknown`[]

Arguments passed to the wrapper function

## Returns

`any`

## Example

```typescript
function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A, source: S): S
function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A): (source: S) => S
function over(...args: unknown[]): unknown {
  return purryConfig2(overImpl, args)
}
```
