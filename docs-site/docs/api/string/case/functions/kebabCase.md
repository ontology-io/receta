# Function: kebabCase()

> **kebabCase**(`str`): `string`

Defined in: [string/case/index.ts:24](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/case/index.ts#L24)

Converts a string to kebab-case.

## Parameters

### str

`string`

The string to convert

## Returns

`string`

The string in kebab-case

## Example

```typescript
kebabCase('helloWorld')
// => 'hello-world'

kebabCase('UserProfilePage')
// => 'user-profile-page'

kebabCase('API_KEY_VALUE')
// => 'api-key-value'
```

## See

 - slugify - for URL-safe slugs with additional normalization
 - snakeCase - for snake_case conversion
