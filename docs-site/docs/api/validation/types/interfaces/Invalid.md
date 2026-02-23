# Interface: Invalid\<E\>

Defined in: [validation/types.ts:15](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L15)

Represents a failed validation containing accumulated errors.

Unlike Result's Err which contains a single error, Invalid contains
an array of errors to support error accumulation across multiple validations.

## Type Parameters

### E

`E`

## Properties

### \_tag

> `readonly` **\_tag**: `"Invalid"`

Defined in: [validation/types.ts:16](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L16)

***

### errors

> `readonly` **errors**: readonly `E`[]

Defined in: [validation/types.ts:17](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L17)
