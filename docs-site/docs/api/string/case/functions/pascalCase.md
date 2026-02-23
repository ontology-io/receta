# Function: pascalCase()

> **pascalCase**(`str`): `string`

Defined in: [string/case/index.ts:114](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/case/index.ts#L114)

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
