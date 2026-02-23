# Interface: DeepMergeOptions

Defined in: [object/types.ts:72](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L72)

Options for deep merging objects.

## Properties

### arrayStrategy?

> `readonly` `optional` **arrayStrategy**: `"concat"` \| `"replace"` \| `"merge"`

Defined in: [object/types.ts:79](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L79)

Strategy for handling array conflicts.
- 'replace': Replace the target array with source array (default)
- 'concat': Concatenate source array to target array
- 'merge': Merge arrays by index

***

### customMerge()?

> `readonly` `optional` **customMerge**: (`key`, `target`, `source`) => `unknown`

Defined in: [object/types.ts:84](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L84)

Custom merge function for specific keys.

#### Parameters

##### key

`string`

##### target

`unknown`

##### source

`unknown`

#### Returns

`unknown`
