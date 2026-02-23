# Type Alias: Path\<T\>

> **Path**\<`T`\> = `string`

Defined in: [lens/types.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/lens/types.ts#L42)

A path type that can be used to access nested properties.

Supports dot notation for nested object access.

## Type Parameters

### T

`T`

## Example

```typescript
type UserPath = Path<User>
// Can be: 'name' | 'email' | 'address.street' | 'address.city'
```
