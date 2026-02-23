# Interface: HighlightOptions

Defined in: [string/highlight/index.ts:8](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L8)

Options for highlight function.

## Properties

### caseInsensitive?

> `readonly` `optional` **caseInsensitive**: `boolean`

Defined in: [string/highlight/index.ts:28](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L28)

If true, performs case-insensitive matching.

#### Default

```ts
true
```

***

### className?

> `readonly` `optional` **className**: `string`

Defined in: [string/highlight/index.ts:21](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L21)

CSS class name to add to the tag.

#### Default

```ts
undefined
```

***

### escapeHtml?

> `readonly` `optional` **escapeHtml**: `boolean`

Defined in: [string/highlight/index.ts:36](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L36)

If true, escapes HTML in the input text before highlighting.
This prevents XSS when highlighting user-generated content.

#### Default

```ts
true
```

***

### tag?

> `readonly` `optional` **tag**: `string`

Defined in: [string/highlight/index.ts:14](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/highlight/index.ts#L14)

HTML tag to wrap matched text.

#### Default

```ts
'mark'
```
