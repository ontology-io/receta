# Type Alias: PathValue\<T, P\>

> **PathValue**\<`T`, `P`\> = `P` *extends* keyof `T` ? `T`\[`P`\] : `P` *extends* `` `${infer K}.${infer Rest}` `` ? `K` *extends* keyof `T` ? `PathValue`\<`T`\[`K`\], `Rest`\> : `never` : `never`

Defined in: [lens/types.ts:49](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/types.ts#L49)

**`Internal`**

Type helper to extract the type at a given path.

## Type Parameters

### T

`T`

### P

`P` *extends* `string`
