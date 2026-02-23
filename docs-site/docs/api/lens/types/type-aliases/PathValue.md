# Type Alias: PathValue\<T, P\>

> **PathValue**\<`T`, `P`\> = `P` *extends* keyof `T` ? `T`\[`P`\] : `P` *extends* `` `${infer K}.${infer Rest}` `` ? `K` *extends* keyof `T` ? `PathValue`\<`T`\[`K`\], `Rest`\> : `never` : `never`

Defined in: [lens/types.ts:49](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/lens/types.ts#L49)

**`Internal`**

Type helper to extract the type at a given path.

## Type Parameters

### T

`T`

### P

`P` *extends* `string`
