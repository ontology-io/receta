# Interface: ValidationMatcher\<T, E, R\>

Defined in: [validation/match/index.ts:14](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/match/index.ts#L14)

Pattern matching interface for Validation.

## Type Parameters

### T

`T`

### E

`E`

### R

`R`

## Properties

### onInvalid()

> `readonly` **onInvalid**: (`errors`) => `R`

Defined in: [validation/match/index.ts:16](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/match/index.ts#L16)

#### Parameters

##### errors

readonly `E`[]

#### Returns

`R`

***

### onValid()

> `readonly` **onValid**: (`value`) => `R`

Defined in: [validation/match/index.ts:15](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/match/index.ts#L15)

#### Parameters

##### value

`T`

#### Returns

`R`
