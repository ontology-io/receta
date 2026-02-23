# Type Alias: Path\<T\>

> **Path**\<`T`\> = `string`

Defined in: [lens/types.ts:42](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/lens/types.ts#L42)

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
