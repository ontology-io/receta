# Interface: Invalid\<E\>

Defined in: [validation/types.ts:15](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/types.ts#L15)

Represents a failed validation containing accumulated errors.

Unlike Result's Err which contains a single error, Invalid contains
an array of errors to support error accumulation across multiple validations.

## Type Parameters

### E

`E`

## Properties

### \_tag

> `readonly` **\_tag**: `"Invalid"`

Defined in: [validation/types.ts:16](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/types.ts#L16)

***

### errors

> `readonly` **errors**: readonly `E`[]

Defined in: [validation/types.ts:17](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/types.ts#L17)
