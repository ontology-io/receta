# Type Alias: DeepPartial\<T\>

> **DeepPartial**\<`T`\> = `{ [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }`

Defined in: [object/types.ts:22](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L22)

Makes all properties of T deeply partial (optional).

## Type Parameters

### T

`T`

The type to make deeply partial
