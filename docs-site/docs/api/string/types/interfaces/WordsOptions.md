# Interface: WordsOptions

Defined in: [string/types.ts:46](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/types.ts#L46)

Options for splitting text into words.

## Properties

### pattern?

> `readonly` `optional` **pattern**: `RegExp`

Defined in: [string/types.ts:52](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/types.ts#L52)

Pattern to match word boundaries.

#### Default

```ts
/[^a-zA-Z0-9]+/
```
