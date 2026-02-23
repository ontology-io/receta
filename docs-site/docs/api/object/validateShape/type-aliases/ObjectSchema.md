# Type Alias: ObjectSchema\<T\>

> **ObjectSchema**\<`T`\> = \{ readonly \[K in keyof T\]: Validator\<T\[K\]\> \| ObjectSchema\<any\> \}

Defined in: [object/validateShape/index.ts:20](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/validateShape/index.ts#L20)

Schema for object validation.

## Type Parameters

### T

`T` *extends* [`PlainObject`](../../types/type-aliases/PlainObject.md)
