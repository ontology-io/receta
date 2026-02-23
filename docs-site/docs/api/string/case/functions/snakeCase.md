# Function: snakeCase()

> **snakeCase**(`str`): `string`

Defined in: [string/case/index.ts:55](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/case/index.ts#L55)

Converts a string to snake_case.

## Parameters

### str

`string`

The string to convert

## Returns

`string`

The string in snake_case

## Example

```typescript
snakeCase('helloWorld')
// => 'hello_world'

snakeCase('UserProfilePage')
// => 'user_profile_page'

snakeCase('API-KEY-VALUE')
// => 'api_key_value'
```

## See

 - kebabCase - for kebab-case conversion
 - camelCase - for camelCase conversion
