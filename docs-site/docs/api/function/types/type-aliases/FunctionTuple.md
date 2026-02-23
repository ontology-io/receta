# Type Alias: FunctionTuple\<T, Args\>

> **FunctionTuple**\<`T`, `Args`\> = `{ readonly [K in keyof Args]: Mapper<T, Args[K]> }`

Defined in: [function/types.ts:24](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/types.ts#L24)

Represents a tuple of functions that take the same input type.

## Type Parameters

### T

`T`

### Args

`Args` *extends* readonly `unknown`[]
