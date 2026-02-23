# Type Alias: ObjectSchema\<T\>

> **ObjectSchema**\<`T`\> = \{ readonly \[K in keyof T\]: Validator\<T\[K\]\> \| ObjectSchema\<any\> \}

Defined in: [object/validateShape/index.ts:20](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/validateShape/index.ts#L20)

Schema for object validation.

## Type Parameters

### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)
