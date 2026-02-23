# Interface: FlattenOptions

Defined in: [object/types.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L42)

Options for flattening objects.

## Properties

### flattenArrays?

> `readonly` `optional` **flattenArrays**: `boolean`

Defined in: [object/types.ts:56](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L56)

Whether to flatten arrays (default: false).

***

### maxDepth?

> `readonly` `optional` **maxDepth**: `number`

Defined in: [object/types.ts:51](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L51)

Maximum depth to flatten (default: Infinity).

***

### separator?

> `readonly` `optional` **separator**: `string`

Defined in: [object/types.ts:46](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L46)

Separator to use between keys (default: '.').
