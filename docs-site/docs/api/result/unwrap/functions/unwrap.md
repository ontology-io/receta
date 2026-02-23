# Function: unwrap()

> **unwrap**\<`T`, `E`\>(`result`): `T`

Defined in: [result/unwrap/index.ts:24](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/unwrap/index.ts#L24)

Extracts the value from an Ok Result or throws the error.

**Warning**: This function throws if the Result is Err.
Use `unwrapOr` or `unwrapOrElse` for safer alternatives.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../../types/type-aliases/Result.md)\<`T`, `E`\>

The Result to unwrap

## Returns

`T`

The value from Ok

## Throws

The error if Result is Err

## Example

```typescript
unwrap(ok(42)) // => 42
unwrap(err('fail')) // throws 'fail'
```

## See

 - unwrapOr - for providing a default value
 - unwrapOrElse - for computing a fallback value
