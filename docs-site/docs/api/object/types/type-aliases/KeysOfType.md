# Type Alias: KeysOfType\<T, V\>

> **KeysOfType**\<`T`, `V`\> = `{ [K in keyof T]: T[K] extends V ? K : never }`\[keyof `T`\]

Defined in: [object/types.ts:105](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L105)

Keys of T that have values of type V.

## Type Parameters

### T

`T`

### V

`V`
