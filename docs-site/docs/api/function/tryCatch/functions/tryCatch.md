# Function: tryCatch()

> **tryCatch**\<`Args`, `T`, `E`\>(`fn`, `onError?`): (...`args`) => [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

Defined in: [function/tryCatch/index.ts:52](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/tryCatch/index.ts#L52)

Wraps a function to safely execute it and return a Result.

This is a convenience wrapper around `Result.tryCatch` that creates a
function you can reuse, rather than wrapping a single execution.

**Note**: This wraps the Result module's `tryCatch`. For one-off executions,
use `Result.tryCatch` directly.

## Type Parameters

### Args

`Args` *extends* readonly `any`[]

### T

`T`

### E

`E` = `unknown`

## Parameters

### fn

(...`args`) => `T`

### onError?

(`error`) => `E`

## Returns

> (...`args`): [`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

### Parameters

#### args

...`Args`

### Returns

[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, `E`\>

## Examples

```typescript
const parseJSON = tryCatch(
  (str: string) => JSON.parse(str),
  (error) => new Error(`Parse failed: ${error}`)
)

parseJSON('{"valid": "json"}')  // => Ok({ valid: 'json' })
parseJSON('invalid json')       // => Err(Error('Parse failed: ...'))
```

```typescript
// Creating safe versions of throwing functions
const safeDivide = tryCatch(
  (a: number, b: number) => {
    if (b === 0) throw new Error('Division by zero')
    return a / b
  }
)

safeDivide(10, 2)  // => Ok(5)
safeDivide(10, 0)  // => Err(Error('Division by zero'))
```

```typescript
// In a pipe with Result operations
pipe(
  getUserInput(),
  tryCatch((input: string) => JSON.parse(input)),
  Result.map(data => data.userId),
  Result.flatMap(fetchUser)
)
```

## See

Result.tryCatch - For one-off safe execution
