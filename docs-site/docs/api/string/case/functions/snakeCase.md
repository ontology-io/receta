# Function: snakeCase()

> **snakeCase**(`str`): `string`

Defined in: [string/case/index.ts:55](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/case/index.ts#L55)

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
