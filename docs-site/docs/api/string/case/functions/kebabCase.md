# Function: kebabCase()

> **kebabCase**(`str`): `string`

Defined in: [string/case/index.ts:24](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/case/index.ts#L24)

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
