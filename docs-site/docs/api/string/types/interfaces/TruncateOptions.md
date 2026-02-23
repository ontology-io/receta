# Interface: TruncateOptions

Defined in: [string/types.ts:10](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/types.ts#L10)

Options for truncating a string.

## Properties

### ellipsis?

> `readonly` `optional` **ellipsis**: `string`

Defined in: [string/types.ts:21](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/types.ts#L21)

The string to append when truncated.

#### Default

```ts
'...'
```

***

### length

> `readonly` **length**: `number`

Defined in: [string/types.ts:14](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/types.ts#L14)

The maximum length of the string (including ellipsis).

***

### words?

> `readonly` `optional` **words**: `boolean`

Defined in: [string/types.ts:28](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/types.ts#L28)

If true, truncate at word boundary to avoid cutting words.

#### Default

```ts
false
```
