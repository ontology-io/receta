# Function: tryCatch()

## Call Signature

> **tryCatch**\<`T`\>(`fn`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `unknown`\>

Defined in: [validation/constructors/index.ts:197](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/constructors/index.ts#L197)

Wraps a potentially throwing function in a Validation.

If the function succeeds, returns Valid with the return value.
If the function throws, returns Invalid with the caught error.

### Type Parameters

#### T

`T`

### Parameters

#### fn

() => `T`

Function that may throw

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `unknown`\>

Validation containing either the return value or the error

### Example

```typescript
// Parse JSON safely
const parseJSON = <T>(str: string): Validation<T, unknown> =>
  tryCatch(() => JSON.parse(str) as T)

parseJSON('{"name":"John"}')
// => Valid({ name: 'John' })

parseJSON('invalid json')
// => Invalid([SyntaxError: ...])
```

## Call Signature

> **tryCatch**\<`T`, `E`\>(`fn`, `mapError`): [`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Defined in: [validation/constructors/index.ts:223](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/constructors/index.ts#L223)

Wraps a potentially throwing function in a Validation with error mapping.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### fn

() => `T`

Function that may throw

#### mapError

(`error`) => `E`

Function to transform the caught error

### Returns

[`Validation`](../../types/type-aliases/Validation.md)\<`T`, `E`\>

Validation containing either the return value or mapped error

### Example

```typescript
// Parse JSON with custom error
const parseJSON = <T>(str: string): Validation<T, string> =>
  tryCatch(
    () => JSON.parse(str) as T,
    (e) => `JSON parse error: ${e.message}`
  )

// Real-world: Parse with validation
const parseAndValidate = <T>(str: string, validate: Validator<T, T, string>) =>
  pipe(
    tryCatch(() => JSON.parse(str) as T, String),
    flatMap(validate)
  )
```
