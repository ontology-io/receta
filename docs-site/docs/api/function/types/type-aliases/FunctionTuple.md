# Type Alias: FunctionTuple\<T, Args\>

> **FunctionTuple**\<`T`, `Args`\> = `{ readonly [K in keyof Args]: Mapper<T, Args[K]> }`

Defined in: [function/types.ts:24](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/types.ts#L24)

Represents a tuple of functions that take the same input type.

## Type Parameters

### T

`T`

### Args

`Args` *extends* readonly `unknown`[]
