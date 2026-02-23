# Type Alias: ValidationSchema\<T, E\>

> **ValidationSchema**\<`T`, `E`\> = `{ [K in keyof T]: Validator<T[K], T[K], E> }`

Defined in: [validation/types.ts:85](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L85)

A schema definition for object validation.

Maps object keys to validators that test the corresponding values.
Used with the `schema` combinator for validating entire objects.

## Type Parameters

### T

`T`

The object type to validate

### E

`E`

The error type

## Example

```typescript
interface User {
  name: string
  email: string
  age: number
}

const userSchema: ValidationSchema<User, string> = {
  name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
  email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
  age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
}
```
