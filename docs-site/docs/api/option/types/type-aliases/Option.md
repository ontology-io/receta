# Type Alias: Option\<T\>

> **Option**\<`T`\> = [`Some`](../interfaces/Some.md)\<`T`\> \| [`None`](../interfaces/None.md)

Defined in: [option/types.ts:29](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/types.ts#L29)

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
