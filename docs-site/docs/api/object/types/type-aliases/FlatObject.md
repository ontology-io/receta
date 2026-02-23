# Type Alias: FlatObject

> **FlatObject** = `Record`\<`string`, `unknown`\>

Defined in: [object/types.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/object/types.ts#L37)

Flattened object with dot-notation keys.

## Example

```typescript
const flat: FlatObject = {
  'user.name': 'Alice',
  'user.age': 30
}
```
