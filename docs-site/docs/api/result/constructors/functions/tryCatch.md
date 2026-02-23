# Function: tryCatch()

## Call Signature

> **tryCatch**\<`T`\>(`fn`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `unknown`\>

Defined in: [result/constructors/index.ts:56](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/constructors/index.ts#L56)

Wraps a potentially throwing function in a Result.

If the function executes successfully, returns Ok with the value.
If it throws, returns Err with the error.

### Type Parameters

#### T

`T`

### Parameters

#### fn

() => `T`

Function that may throw

### Returns

[`Result`](../../types/type-aliases/Result.md)\<`T`, `unknown`\>

Result containing either the return value or the error

### Example

```typescript
const parseJSON = (str: string) =>
  tryCatch(() => JSON.parse(str))

parseJSON('{"name":"John"}')
// => Ok({ name: 'John' })

parseJSON('invalid json')
// => Err(SyntaxError: ...)
```

## Call Signature

> **tryCatch**\<`T`, `E`\>(`fn`, `mapError`): [`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [result/constructors/index.ts:78](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/constructors/index.ts#L78)

Wraps a potentially throwing function in a Result with custom error mapping.

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

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

Result containing either the return value or the mapped error

### Example

```typescript
const parseNumber = (str: string) =>
  tryCatch(
    () => {
      const n = Number(str)
      if (Number.isNaN(n)) throw new Error('Invalid number')
      return n
    },
    (e) => `Parse error: ${e}`
  )
```
