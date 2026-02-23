# Function: purryConfig()

> **purryConfig**(`impl`, `args`): `any`

Defined in: [utils/purry.ts:48](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/utils/purry.ts#L48)

**`Internal`**

Creates a function that supports both data-first and data-last signatures
where the "configuration" parameter comes first.

Pattern:
- Data-first: `fn(config, data)` → result
- Data-last: `fn(config)` → `(data) => result`

This differs from Remeda's `purry` which expects data-first as `fn(data, ...args)`.

Use this for:
- Lens operations: `view(lens, source)` / `view(lens)(source)`
- Predicate builders: `where(spec, obj)` / `where(spec)(obj)`
- Any function where config/spec/lens comes before data

## Parameters

### impl

`any`

Implementation function with signature `(config, data) => result`

### args

readonly `unknown`[]

Arguments passed to the wrapper function

## Returns

`any`

Either the result (data-first) or curried function (data-last)

## Example

```typescript
// Define wrapper with overloads
function myFn<T>(config: Config, data: T): Result
function myFn<T>(config: Config): (data: T) => Result
function myFn(...args: unknown[]): unknown {
  return purryConfig(myFnImpl, args)
}

// Implementation
function myFnImpl<T>(config: Config, data: T): Result {
  // ... logic
}

// Usage
myFn(config, data)        // data-first
myFn(config)(data)        // data-last
pipe(data, myFn(config))  // in pipe
```
