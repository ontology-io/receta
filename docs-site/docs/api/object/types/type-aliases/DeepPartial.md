# Type Alias: DeepPartial\<T\>

> **DeepPartial**\<`T`\> = `{ [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }`

Defined in: [object/types.ts:22](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L22)

Makes all properties of T deeply partial (optional).

## Type Parameters

### T

`T`

The type to make deeply partial
