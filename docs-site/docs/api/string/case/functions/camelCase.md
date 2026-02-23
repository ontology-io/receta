# Function: camelCase()

> **camelCase**(`str`): `string`

Defined in: [string/case/index.ts:86](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/case/index.ts#L86)

Converts a string to camelCase.

## Parameters

### str

`string`

The string to convert

## Returns

`string`

The string in camelCase

## Example

```typescript
camelCase('hello-world')
// => 'helloWorld'

camelCase('user_profile_page')
// => 'userProfilePage'

camelCase('API KEY VALUE')
// => 'apiKeyValue'
```

## See

 - pascalCase - for PascalCase conversion
 - snakeCase - for snake_case conversion
