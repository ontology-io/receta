# Interface: WordsOptions

Defined in: [string/types.ts:46](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/types.ts#L46)

Options for splitting text into words.

## Properties

### pattern?

> `readonly` `optional` **pattern**: `RegExp`

Defined in: [string/types.ts:52](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/types.ts#L52)

Pattern to match word boundaries.

#### Default

```ts
/[^a-zA-Z0-9]+/
```
