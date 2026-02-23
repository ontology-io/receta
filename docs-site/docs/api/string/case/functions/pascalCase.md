# Function: pascalCase()

> **pascalCase**(`str`): `string`

Defined in: [string/case/index.ts:114](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/string/case/index.ts#L114)

Converts a string to PascalCase.

## Parameters

### str

`string`

The string to convert

## Returns

`string`

The string in PascalCase

## Example

```typescript
pascalCase('hello-world')
// => 'HelloWorld'

pascalCase('user_profile_page')
// => 'UserProfilePage'

pascalCase('api key value')
// => 'ApiKeyValue'
```

## See

 - camelCase - for camelCase conversion
 - kebabCase - for kebab-case conversion
