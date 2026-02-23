# Interface: ObjectError

Defined in: [object/types.ts:90](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L90)

Error type for object operations.

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [object/types.ts:94](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L94)

***

### code

> `readonly` **code**: `"PATH_NOT_FOUND"` \| `"INVALID_PATH"` \| `"VALIDATION_ERROR"` \| `"CIRCULAR_REFERENCE"`

Defined in: [object/types.ts:91](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L91)

***

### message

> `readonly` **message**: `string`

Defined in: [object/types.ts:92](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L92)

***

### path?

> `readonly` `optional` **path**: [`ObjectPath`](../type-aliases/ObjectPath.md)

Defined in: [object/types.ts:93](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L93)
