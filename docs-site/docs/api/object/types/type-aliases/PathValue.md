# Type Alias: PathValue\<T, P\>

> **PathValue**\<`T`, `P`\> = `P` *extends* readonly \[infer First, `...(infer Rest)`\] ? `First` *extends* keyof `T` ? `Rest` *extends* readonly `any`[] ? `PathValue`\<`T`\[`First`\], `Rest`\> : `T`\[`First`\] : `never` : `T`

Defined in: [object/types.ts:115](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L115)

Get the type at a given path in an object.

## Type Parameters

### T

`T`

The object type

### P

`P` *extends* readonly `any`[]

The path as a tuple of keys
