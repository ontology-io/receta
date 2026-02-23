# Interface: ParseNumberError

Defined in: [result/parsing/types.ts:4](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/parsing/types.ts#L4)

Error returned when number parsing fails.

## Properties

### \_tag

> `readonly` **\_tag**: `"ParseNumberError"`

Defined in: [result/parsing/types.ts:5](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/parsing/types.ts#L5)

***

### input

> `readonly` **input**: `string`

Defined in: [result/parsing/types.ts:6](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/parsing/types.ts#L6)

***

### message

> `readonly` **message**: `string`

Defined in: [result/parsing/types.ts:8](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/parsing/types.ts#L8)

***

### reason

> `readonly` **reason**: `"not_a_number"` \| `"infinite"` \| `"invalid_integer"` \| `"out_of_radix_range"`

Defined in: [result/parsing/types.ts:7](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/parsing/types.ts#L7)
