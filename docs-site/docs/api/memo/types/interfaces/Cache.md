# Interface: Cache\<K, V\>

Defined in: [memo/types.ts:7](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L7)

Cache interface that memoization functions can use.
Allows custom cache implementations (Map, LRU, TTL, WeakMap, etc.).

## Type Parameters

### K

`K`

### V

`V`

## Methods

### clear()

> **clear**(): `void`

Defined in: [memo/types.ts:12](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L12)

#### Returns

`void`

***

### delete()

> **delete**(`key`): `boolean`

Defined in: [memo/types.ts:11](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L11)

#### Parameters

##### key

`K`

#### Returns

`boolean`

***

### get()

> **get**(`key`): [`Option`](../../../option/types/type-aliases/Option.md)\<`V`\>

Defined in: [memo/types.ts:8](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L8)

#### Parameters

##### key

`K`

#### Returns

[`Option`](../../../option/types/type-aliases/Option.md)\<`V`\>

***

### has()

> **has**(`key`): `boolean`

Defined in: [memo/types.ts:10](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L10)

#### Parameters

##### key

`K`

#### Returns

`boolean`

***

### set()

> **set**(`key`, `value`): `void`

Defined in: [memo/types.ts:9](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/types.ts#L9)

#### Parameters

##### key

`K`

##### value

`V`

#### Returns

`void`
