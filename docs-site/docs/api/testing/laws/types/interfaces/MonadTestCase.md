# Interface: MonadTestCase\<M, A\>

Defined in: [testing/laws/types.ts:126](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/laws/types.ts#L126)

Test case for monad law testing.

## Type Parameters

### M

`M`

### A

`A`

## Properties

### functions?

> `optional` **functions**: (`a`) => `M`[]

Defined in: [testing/laws/types.ts:136](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/laws/types.ts#L136)

Monadic functions for testing left identity and associativity.
Defaults to [of] if not provided.

#### Parameters

##### a

`A`

#### Returns

`M`

***

### value

> **value**: `A`

Defined in: [testing/laws/types.ts:130](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/laws/types.ts#L130)

Base value to test with.
