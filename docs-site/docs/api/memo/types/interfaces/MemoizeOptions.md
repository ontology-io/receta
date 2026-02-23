# Interface: MemoizeOptions\<K\>

Defined in: [memo/types.ts:23](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L23)

Options for memoization functions.

## Type Parameters

### K

`K` = `string`

## Properties

### cache?

> `optional` **cache**: [`Cache`](Cache.md)\<`K`, `unknown`\>

Defined in: [memo/types.ts:28](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L28)

Custom cache implementation.
Defaults to a simple Map.

***

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [memo/types.ts:34](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L34)

Maximum number of cached entries (for built-in Map cache).
When exceeded, oldest entries are removed.

***

### ttl?

> `optional` **ttl**: `number`

Defined in: [memo/types.ts:40](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/types.ts#L40)

Time-to-live for cached entries in milliseconds.
Entries are removed after this duration.
