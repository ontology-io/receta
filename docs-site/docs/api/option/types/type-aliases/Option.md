# Type Alias: Option\<T\>

> **Option**\<`T`\> = [`Some`](../interfaces/Some.md)\<`T`\> \| [`None`](../interfaces/None.md)

Defined in: [option/types.ts:29](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/types.ts#L29)

Option type representing either a value (Some) or no value (None).

## Type Parameters

### T

`T`

The type of the value when present

## Example

```typescript
type MaybeUser = Option<User>

const present: MaybeUser = { _tag: 'Some', value: { name: 'John' } }
const absent: MaybeUser = { _tag: 'None' }
```
