# Function: unwrap()

> **unwrap**\<`T`\>(`option`): `T`

Defined in: [option/unwrap/index.ts:27](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/unwrap/index.ts#L27)

Extracts the value from a Some Option or throws an error.

If the Option is Some, returns the value.
If the Option is None, throws an error.

Use this when you're certain the value exists. Prefer unwrapOr or unwrapOrElse
for safer alternatives.

## Type Parameters

### T

`T`

## Parameters

### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to unwrap

## Returns

`T`

The value if Some

## Throws

Error if None

## Example

```typescript
unwrap(some(42)) // => 42
unwrap(none()) // throws Error: Cannot unwrap None
```

## See

 - unwrapOr - for providing a default value
 - unwrapOrElse - for computing a default value
