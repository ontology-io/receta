# Interface: CompactOptions

Defined in: [number/types.ts:90](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/types.ts#L90)

Options for compact number formatting (1K, 1M, etc.).

## Properties

### digits?

> `readonly` `optional` **digits**: `number`

Defined in: [number/types.ts:101](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/types.ts#L101)

Number of significant digits.

#### Default

```ts
1
```

***

### locale?

> `readonly` `optional` **locale**: `string`

Defined in: [number/types.ts:95](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/types.ts#L95)

Locale to use for formatting.

#### Default

```ts
'en-US'
```

***

### notation?

> `readonly` `optional` **notation**: `"short"` \| `"long"`

Defined in: [number/types.ts:107](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/number/types.ts#L107)

Notation style.

#### Default

```ts
'short'
```
