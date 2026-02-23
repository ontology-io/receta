# Type Alias: FlatObject

> **FlatObject** = `Record`\<`string`, `unknown`\>

Defined in: [object/types.ts:37](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/object/types.ts#L37)

Flattened object with dot-notation keys.

## Example

```typescript
const flat: FlatObject = {
  'user.name': 'Alice',
  'user.age': 30
}
```
