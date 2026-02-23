# Interface: BatchOptions

Defined in: [async/types.ts:90](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L90)

Options for batch operations.

## Properties

### batchSize?

> `readonly` `optional` **batchSize**: `number`

Defined in: [async/types.ts:95](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L95)

Number of items to process per batch.

#### Default

```ts
10
```

***

### concurrency?

> `readonly` `optional` **concurrency**: `number`

Defined in: [async/types.ts:107](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L107)

Maximum number of concurrent batches.

#### Default

```ts
1
```

***

### delayBetweenBatches?

> `readonly` `optional` **delayBetweenBatches**: `number`

Defined in: [async/types.ts:101](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/types.ts#L101)

Delay in milliseconds between batches.

#### Default

```ts
0
```
