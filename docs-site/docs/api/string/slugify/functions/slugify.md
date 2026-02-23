# Function: slugify()

> **slugify**(`str`): `string`

Defined in: [string/slugify/index.ts:30](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/slugify/index.ts#L30)

Converts a string to a URL-safe slug.

Transforms the input by:
- Converting to lowercase
- Replacing spaces and special characters with hyphens
- Removing consecutive hyphens
- Trimming leading/trailing hyphens

## Parameters

### str

`string`

The string to slugify

## Returns

`string`

A URL-safe slug

## Example

```typescript
slugify('Hello World!')
// => 'hello-world'

slugify('  TypeScript & JavaScript  ')
// => 'typescript-javascript'

slugify('10 Tips for Better Code')
// => '10-tips-for-better-code'

slugify('Café Münster')
// => 'cafe-munster'
```

## See

kebabCase - for converting to kebab-case without URL normalization
