# Interface: MemoizedAsyncFunction()\<Args, R\>

Defined in: [memo/types.ts:55](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L55)

A memoized async function with cache access and deduplication.

## Type Parameters

### Args

`Args` *extends* readonly `unknown`[]

### R

`R`

> **MemoizedAsyncFunction**(...`args`): `Promise`\<`R`\>

Defined in: [memo/types.ts:56](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L56)

A memoized async function with cache access and deduplication.

## Parameters

### args

...`Args`

## Returns

`Promise`\<`R`\>

## Properties

### cache

> **cache**: [`Cache`](Cache.md)\<`unknown`, `Promise`\<`R`\>\>

Defined in: [memo/types.ts:57](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L57)

***

### clear()

> **clear**: () => `void`

Defined in: [memo/types.ts:58](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L58)

#### Returns

`void`
