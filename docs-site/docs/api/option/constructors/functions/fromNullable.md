# Function: fromNullable()

> **fromNullable**\<`T`\>(`value`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/constructors/index.ts:55](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/constructors/index.ts#L55)

Converts a nullable value to an Option.

If the value is not null or undefined, returns Some with the value.
Otherwise, returns None.

## Type Parameters

### T

`T`

## Parameters

### value

The nullable value

`T` | `null` | `undefined`

## Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

Option containing the value or None

## Example

```typescript
fromNullable(42) // => Some(42)
fromNullable(null) // => None
fromNullable(undefined) // => None

// With array find
const user = fromNullable(users.find(u => u.id === id))
```
