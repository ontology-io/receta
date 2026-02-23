# Interface: MemoizedFunction()\<Args, R\>

Defined in: [memo/types.ts:46](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L46)

A memoized function with cache access.

## Type Parameters

### Args

`Args` *extends* readonly `unknown`[]

### R

`R`

> **MemoizedFunction**(...`args`): `R`

Defined in: [memo/types.ts:47](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L47)

A memoized function with cache access.

## Parameters

### args

...`Args`

## Returns

`R`

## Properties

### cache

> **cache**: [`Cache`](Cache.md)\<`unknown`, `R`\>

Defined in: [memo/types.ts:48](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L48)

***

### clear()

> **clear**: () => `void`

Defined in: [memo/types.ts:49](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L49)

#### Returns

`void`
