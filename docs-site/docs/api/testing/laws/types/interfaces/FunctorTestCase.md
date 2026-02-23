# Interface: FunctorTestCase\<A\>

Defined in: [testing/laws/types.ts:56](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L56)

Test case for functor law testing.

## Type Parameters

### A

`A`

## Properties

### transforms?

> `optional` **transforms**: (`a`) => `any`[]

Defined in: [testing/laws/types.ts:66](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L66)

Transformation functions to test composition law.
Defaults to [x => x, x => x] if not provided.

#### Parameters

##### a

`A`

#### Returns

`any`

***

### value

> **value**: `A`

Defined in: [testing/laws/types.ts:60](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L60)

Base value to test with.
