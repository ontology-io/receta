# Type Alias: KeysOfType\<T, V\>

> **KeysOfType**\<`T`, `V`\> = `{ [K in keyof T]: T[K] extends V ? K : never }`\[keyof `T`\]

Defined in: [object/types.ts:105](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L105)

Keys of T that have values of type V.

## Type Parameters

### T

`T`

### V

`V`
